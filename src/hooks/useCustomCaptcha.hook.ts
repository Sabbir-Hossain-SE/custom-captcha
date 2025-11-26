import { useState, useCallback } from 'react';
import type {
  CaptchaState,
  CapturedImage,
  WatermarkSector,
} from '../interfaces';
import { INITIAL_TOLERANCE } from '../constants';
import type { ColorTint, ShapeType } from '../types';

export const useCustomCaptcha = () => {
  const [captchaState, setCaptchaState] = useState<CaptchaState>(() => ({
    step: 1,
    capturedImage: null,
    gridSize: 5, // 5x5 grid
    watermarks: [],
    targetShape: 'triangle',
    targetColor: null,
    selectedSectors: new Set(),
    attempts: 0,
    maxAttempts: 3,
    tolerance: INITIAL_TOLERANCE,
    passed: null,
  }));

  const initializeWatermarks = useCallback(
    (gridSize: number, includeColors: boolean = true): WatermarkSector[] => {
      const shapes: ShapeType[] = ['triangle', 'square', 'circle'];
      const colors: ColorTint[] = ['red', 'green', 'blue'];
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
            shape: shapes[Math.floor(Math.random() * shapes.length)],
            colorTint: includeColors
              ? colors[Math.floor(Math.random() * colors.length)]
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
      const shapes: ShapeType[] = ['triangle', 'square', 'circle'];
      const colors: ColorTint[] = ['red', 'green', 'blue'];

      // Get all watermarked sectors
      const watermarkedSectors = watermarks.filter((w) => w.shape !== null);

      if (watermarkedSectors.length === 0) {
        return { shape: shapes[0], color: colors[0] };
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

  const handleImageCapture = useCallback(
    (capturedImage: CapturedImage) => {
      // Initialize watermarks with colors (Task 2)
      const watermarks = initializeWatermarks(captchaState.gridSize, true);
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
    [captchaState.gridSize, initializeWatermarks, selectTarget]
  );

  return {
    captchaState,
    handleImageCapture,
  };
};
