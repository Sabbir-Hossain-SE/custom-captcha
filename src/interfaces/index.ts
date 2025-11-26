import type { ColorTint, ShapeType } from '../types';

export interface CapturedImage {
  imageData: string; // Base64 encoded image
  squarePosition: { x: number; y: number; size: number };
  timestamp: number;
}

export interface WatermarkSector {
  row: number;
  col: number;
  shape: ShapeType | null;
  colorTint: ColorTint | null;
}

export interface CaptchaState {
  step: 1 | 2 | 3;
  capturedImage: CapturedImage | null;
  gridSize: number;
  watermarks: WatermarkSector[];
  targetShape: ShapeType;
  targetColor: ColorTint | null;
  selectedSectors: Set<string>;
  attempts: number;
  maxAttempts: number;
  tolerance: number; // Percentage of correct selections required
  passed: boolean | null;
}
