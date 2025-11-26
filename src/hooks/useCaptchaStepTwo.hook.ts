import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { TimingValidator } from '../utils';
import type { CapturedImage, WatermarkSector } from '../interfaces';
import type { ColorTint, ShapeType } from '../types';

export const useCaptchaStepTwo = (
  capturedImage: CapturedImage,
  gridSize: number,
  targetShape: ShapeType,
  targetColor: ColorTint | null,
  selectedSectors: Set<string>,
  watermarks: WatermarkSector[]
) => {
  const imgRef = useRef<HTMLImageElement>(null);
  const [imageDimensions, setImageDimensions] = useState({
    width: 0,
    height: 0,
  });
  const timingValidatorRef = useRef<TimingValidator | null>(null);

  // Initialize refs lazily to avoid creating instances on every render

  if (timingValidatorRef.current === null) {
    timingValidatorRef.current = new TimingValidator();
  }

  // Store original image dimensions in state to avoid recreating Image object
  const [originalImageDimensions, setOriginalImageDimensions] = useState<{
    width: number;
    height: number;
  } | null>(null);

  /**
   * Get actual rendered image dimensions
   */
  useEffect(() => {
    // Load original image dimensions once
    if (!originalImageDimensions) {
      const img = new Image();
      img.onload = () => {
        setOriginalImageDimensions({
          width: img.width || 640,
          height: img.height || 480,
        });
      };
      img.src = capturedImage.imageData;
    }

    const updateDimensions = () => {
      if (imgRef.current) {
        setImageDimensions({
          width: imgRef.current.offsetWidth,
          height: imgRef.current.offsetHeight,
        });
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, [capturedImage.imageData, originalImageDimensions]);

  /**
   * Calculate grid dimensions based on square position and actual image size
   */
  const gridDimensions = useMemo(() => {
    const { x, y, size } = capturedImage.squarePosition;
    const sectorSize = size / gridSize;

    // Use cached original dimensions or fallback
    const originalWidth = originalImageDimensions?.width || 640;
    const originalHeight = originalImageDimensions?.height || 480;

    // Calculate scale factor (avoid division by zero)
    const scaleX =
      originalWidth > 0 ? imageDimensions.width / originalWidth : 1;
    const scaleY =
      originalHeight > 0 ? imageDimensions.height / originalHeight : 1;

    return {
      startX: x * scaleX,
      startY: y * scaleY,
      sectorSize: sectorSize * scaleX,
      originalWidth,
      originalHeight,
      scaleX,
      scaleY,
    };
  }, [
    capturedImage.squarePosition,
    gridSize,
    imageDimensions.width,
    imageDimensions.height,
    originalImageDimensions,
  ]);

  /**
   * Get instruction text based on target shape and color
   */
  const instructionText = useMemo(() => {
    const shapeText =
      targetShape.charAt(0).toUpperCase() + targetShape.slice(1) + 's';
    if (targetColor) {
      const colorText =
        targetColor.charAt(0).toUpperCase() + targetColor.slice(1);
      return `Select all sectors containing ${colorText} ${shapeText}`;
    }
    return `Select all sectors containing ${shapeText}`;
  }, [targetShape, targetColor]);

  /**
   * Check if a sector is selected
   * Memoized to avoid recreating function on every render
   */
  const isSectorSelected = useCallback(
    (row: number, col: number): boolean => {
      return selectedSectors.has(`${row}-${col}`);
    },
    [selectedSectors]
  );

  /**
   * Get watermark for a specific sector
   * Memoized with useMemo to cache results
   */
  const watermarkMap = useMemo(() => {
    const map = new Map<string, WatermarkSector>();
    watermarks.forEach((w) => {
      map.set(`${w.row}-${w.col}`, w);
    });
    return map;
  }, [watermarks]);

  const getWatermark = useCallback(
    (row: number, col: number): WatermarkSector | undefined => {
      return watermarkMap.get(`${row}-${col}`);
    },
    [watermarkMap]
  );

  /**
   * Memoized handler for image load to avoid recreating function
   */
  const handleImageLoad = useCallback(() => {
    if (imgRef.current) {
      setImageDimensions({
        width: imgRef.current.offsetWidth,
        height: imgRef.current.offsetHeight,
      });
    }
  }, []);

  return {
    instructionText,
    isSectorSelected,
    getWatermark,
    gridDimensions,
    imageDimensions,
    imgRef,
    handleImageLoad,
  };
};
