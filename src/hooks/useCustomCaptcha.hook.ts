import { useState, useCallback, useRef, useEffect } from 'react';
import type {
  CaptchaState,
  CapturedImage,
  WatermarkSector,
} from '../interfaces';
import {
  INITIAL_TOLERANCE,
  MIN_TOLERANCE,
  TOLERANCE_DECREASE,
} from '../constants';
import type { ColorTint, ShapeType } from '../types';
import {
  detectAutomation,
  randomDelay,
  createSectorKeyMapping,
} from '../utils';

const GRID_SIZE = 5; // 5x5 grid - constant to avoid unnecessary re-renders
const SHAPES: ShapeType[] = ['triangle', 'square', 'circle'];
const COLORS: ColorTint[] = ['red', 'green', 'blue'];

export const useCustomCaptcha = () => {
  // Check for automation on mount
  useEffect(() => {
    if (detectAutomation()) {
      console.warn('Automation tools detected');
      // In production, you might want to block access or show a warning
    }
  }, []);
  const [captchaState, setCaptchaState] = useState<CaptchaState>(() => ({
    step: 1,
    capturedImage: null,
    gridSize: GRID_SIZE,
    watermarks: [],
    targetShape: 'triangle',
    targetColor: null,
    selectedSectors: new Set(),
    sectorKeyMapping: null,
    obfuscationSeed: null,
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

      // Generate obfuscation seed and mapping for this session
      const obfuscationSeed = Math.floor(Math.random() * 1000000);
      const sectorKeyMapping = createSectorKeyMapping(
        gridSizeRef.current,
        obfuscationSeed
      );

      setCaptchaState((prev) => ({
        ...prev,
        step: 2,
        capturedImage,
        watermarks,
        targetShape: target.shape,
        targetColor: target.color,
        selectedSectors: new Set(),
        sectorKeyMapping,
        obfuscationSeed,
      }));
    },
    [initializeWatermarks, selectTarget]
  );

  const handleSectorToggle = useCallback((row: number, col: number) => {
    setCaptchaState((prev) => {
      if (!prev.sectorKeyMapping) {
        // Fallback to simple key if mapping not available
        const sectorKey = `${row}-${col}`;
        const newSelected = new Set(prev.selectedSectors);
        if (newSelected.has(sectorKey)) {
          newSelected.delete(sectorKey);
        } else {
          newSelected.add(sectorKey);
        }
        return { ...prev, selectedSectors: newSelected };
      }

      // Use obfuscated key for anti-automation
      const simpleKey = `${row}-${col}`;
      const obfuscatedKey = prev.sectorKeyMapping.get(simpleKey);
      if (!obfuscatedKey) {
        return prev; // Should not happen, but safety check
      }

      const newSelected = new Set(prev.selectedSectors);
      if (newSelected.has(obfuscatedKey)) {
        newSelected.delete(obfuscatedKey);
      } else {
        newSelected.add(obfuscatedKey);
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

      // Create reverse mapping (obfuscated key -> simple key) for validation
      const reverseMapping = new Map<string, string>();
      if (currentState.sectorKeyMapping) {
        currentState.sectorKeyMapping.forEach((obfuscated, simple) => {
          reverseMapping.set(obfuscated, simple);
        });
      }

      // Count correct selections
      const correctSectors = watermarks.filter((w) => {
        if (w.shape !== targetShape) return false;
        if (targetColor !== null && w.colorTint !== targetColor) return false;

        // Check using obfuscated key if mapping exists, otherwise use simple key
        if (currentState.sectorKeyMapping) {
          const simpleKey = `${w.row}-${w.col}`;
          const obfuscatedKey = currentState.sectorKeyMapping.get(simpleKey);
          return obfuscatedKey ? selectedSectors.has(obfuscatedKey) : false;
        } else {
          const sectorKey = `${w.row}-${w.col}`;
          return selectedSectors.has(sectorKey);
        }
      });

      // Count total expected selections
      const totalExpected = watermarks.filter((w) => {
        if (w.shape !== targetShape) return false;
        if (targetColor !== null && w.colorTint !== targetColor) return false;
        return true;
      }).length;

      // Count false positives (selected but shouldn't be)
      const falsePositives = Array.from(selectedSectors).filter((key) => {
        // Decode obfuscated key back to row/col if mapping exists
        let row: number, col: number;
        if (currentState.sectorKeyMapping && reverseMapping.has(key)) {
          const simpleKey = reverseMapping.get(key)!;
          [row, col] = simpleKey.split('-').map(Number);
        } else {
          // Fallback to simple key parsing
          [row, col] = key.split('-').map(Number);
        }

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

  const handleReset = useCallback(() => {
    setCaptchaState((prev) => ({
      ...prev,
      step: 1,
      capturedImage: null,
      gridSize: 5,
      watermarks: [],
      targetShape: 'triangle',
      targetColor: null,
      selectedSectors: new Set(),
      sectorKeyMapping: null,
      obfuscationSeed: null,
      attempts: 0,
      maxAttempts: 3,
      tolerance: INITIAL_TOLERANCE,
      passed: null,
    }));
  }, []);

  const handleRetry = useCallback(() => {
    const newTolerance = Math.max(
      INITIAL_TOLERANCE - captchaState.attempts * TOLERANCE_DECREASE,
      MIN_TOLERANCE
    );

    setCaptchaState((prev) => ({
      ...prev,
      step: 1,
      capturedImage: null,
      watermarks: [],
      selectedSectors: new Set(),
      tolerance: newTolerance,
      passed: null,
    }));
  }, [captchaState.attempts]);

  return {
    captchaState,
    handleImageCapture,
    handleSectorToggle,
    handleValidation,
    handleReset,
    handleRetry,
  };
};
