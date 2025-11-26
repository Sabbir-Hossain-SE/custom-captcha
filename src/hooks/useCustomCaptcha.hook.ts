import { useState, useCallback, useRef, useEffect } from 'react';
import type {
  CaptchaState,
  CapturedImage,
  WatermarkSector,
} from '../interfaces';
import { INITIAL_TOLERANCE } from '../constants';
import type { ColorTint, ShapeType } from '../types';
import { randomDelay } from '../utils';

const GRID_SIZE = 5; // 5x5 grid - constant to avoid unnecessary re-renders
const SHAPES: ShapeType[] = ['triangle', 'square', 'circle'];
const COLORS: ColorTint[] = ['red', 'green', 'blue'];

export const useCustomCaptcha = () => {
  const [captchaState, setCaptchaState] = useState<CaptchaState>(() => ({
    step: 1,
    capturedImage: null,
    gridSize: GRID_SIZE,
    watermarks: [],
    targetShape: 'triangle',
    targetColor: null,
    selectedSectors: new Set(),
    attempts: 0,
    maxAttempts: 3,
    tolerance: INITIAL_TOLERANCE,
    passed: null,
  }));

  // Memoize initialization functions to avoid recreating on every render
  const initializeWatermarks = useCallback(
    (gridSize: number, includeColors: boolean = true): WatermarkSector[] => {
      const totalSectors = gridSize * gridSize;
      const sectorsWithWatermarks = Math.floor(totalSectors / 2);

      // Create array of all sector positions
      const allSectors: Array<{ row: number; col: number }> = [];
      for (let row = 0; row < gridSize; row++) {
        for (let col = 0; col < gridSize; col++) {
          allSectors.push({ row, col });
        }
      }

      // Randomly select half of the sectors
      const selectedSectors = allSectors
        .sort(() => Math.random() - 0.5)
        .slice(0, sectorsWithWatermarks);

      // Assign random shapes and colors to selected sectors
      return allSectors.map((sector) => {
        const isWatermarked = selectedSectors.some(
          (s) => s.row === sector.row && s.col === sector.col
        );

        if (isWatermarked) {
          return {
            row: sector.row,
            col: sector.col,
            shape: SHAPES[Math.floor(Math.random() * SHAPES.length)],
            colorTint: includeColors
              ? COLORS[Math.floor(Math.random() * COLORS.length)]
              : null,
          };
        }

        return {
          row: sector.row,
          col: sector.col,
          shape: null,
          colorTint: null,
        };
      });
    },
    []
  );

  const selectTarget = useCallback(
    (
      watermarks: WatermarkSector[]
    ): { shape: ShapeType; color: ColorTint | null } => {
      // Get all watermarked sectors
      const watermarkedSectors = watermarks.filter((w) => w.shape !== null);

      if (watermarkedSectors.length === 0) {
        return { shape: SHAPES[0], color: COLORS[0] };
      }

      // Randomly select a target from existing watermarks
      const randomWatermark =
        watermarkedSectors[
          Math.floor(Math.random() * watermarkedSectors.length)
        ];

      return {
        shape: randomWatermark.shape!,
        color: randomWatermark.colorTint,
      };
    },
    []
  );

  // Use ref to avoid dependency on captchaState.gridSize
  const gridSizeRef = useRef(GRID_SIZE);

  // Update ref in effect to avoid updating during render
  useEffect(() => {
    gridSizeRef.current = captchaState.gridSize;
  }, [captchaState.gridSize]);

  const handleImageCapture = useCallback(
    (capturedImage: CapturedImage) => {
      // Initialize watermarks with colors (Task 2)
      const watermarks = initializeWatermarks(gridSizeRef.current, true);
      const target = selectTarget(watermarks);

      setCaptchaState((prev) => ({
        ...prev,
        step: 2,
        capturedImage,
        watermarks,
        targetShape: target.shape,
        targetColor: target.color,
        selectedSectors: new Set(),
      }));
    },
    [initializeWatermarks, selectTarget]
  );

  const handleSectorToggle = useCallback((row: number, col: number) => {
    const sectorKey = `${row}-${col}`;
    setCaptchaState((prev) => {
      const newSelected = new Set(prev.selectedSectors);
      if (newSelected.has(sectorKey)) {
        newSelected.delete(sectorKey);
      } else {
        newSelected.add(sectorKey);
      }
      return { ...prev, selectedSectors: newSelected };
    });
  }, []);

  const handleValidation = useCallback(async () => {
    // Add random delay to prevent rapid automated submissions
    await randomDelay(100, 300);

    setCaptchaState((currentState) => {
      const {
        watermarks,
        targetShape,
        targetColor,
        selectedSectors,
        tolerance,
      } = currentState;

      // Count correct selections
      const correctSectors = watermarks.filter((w) => {
        if (w.shape !== targetShape) return false;
        if (targetColor !== null && w.colorTint !== targetColor) return false;

        const sectorKey = `${w.row}-${w.col}`;
        return selectedSectors.has(sectorKey);
      });

      // Count total expected selections
      const totalExpected = watermarks.filter((w) => {
        if (w.shape !== targetShape) return false;
        if (targetColor !== null && w.colorTint !== targetColor) return false;
        return true;
      }).length;

      // Count false positives (selected but shouldn't be)
      const falsePositives = Array.from(selectedSectors).filter((key) => {
        const [row, col] = key.split('-').map(Number);
        const watermark = watermarks.find(
          (w) => w.row === row && w.col === col
        );

        if (!watermark || !watermark.shape) return true; // Selected empty sector
        if (watermark.shape !== targetShape) return true; // Wrong shape
        if (targetColor !== null && watermark.colorTint !== targetColor)
          return true; // Wrong color

        return false;
      });

      // Calculate accuracy
      const accuracy =
        totalExpected > 0
          ? (correctSectors.length - falsePositives.length) / totalExpected
          : 0;

      const passed = accuracy >= tolerance;

      return {
        ...currentState,
        step: 3,
        passed,
        attempts: currentState.attempts + 1,
      };
    });
  }, []);

  return {
    captchaState,
    handleImageCapture,
    handleSectorToggle,
    handleValidation,
  };
};
