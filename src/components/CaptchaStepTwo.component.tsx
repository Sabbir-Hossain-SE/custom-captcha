import { memo, useMemo, type ReactElement } from 'react';
import type { CapturedImage, WatermarkSector } from '../interfaces';
import type { ColorTint, ShapeType } from '../types';
import { useCaptchaStepTwo } from '../hooks/useCaptchaStepTwo.hook';
import { ShapeGenerator } from './ShapeGenerator.component';

interface CaptchaStepTwoProps {
  capturedImage: CapturedImage;
  watermarks: WatermarkSector[];
  targetShape: ShapeType;
  targetColor: ColorTint | null;
  selectedSectors: Set<string>;
  onSectorToggle: (row: number, col: number) => void;
  onValidate: () => void;
  gridSize: number;
  sectorKeyMapping: Map<string, string> | null;
}

export const CaptchaStepTwo: React.FC<CaptchaStepTwoProps> = memo(
  ({
    capturedImage,
    watermarks,
    targetShape,
    targetColor,
    selectedSectors,
    onSectorToggle,
    onValidate,
    gridSize,
    sectorKeyMapping,
  }) => {
    const {
      instructionText,
      isSectorSelected,
      getWatermark,
      gridDimensions,
      imageDimensions,
      imgRef,
      handleImageLoad,
      handleSectorToggleWithProtection,
    } = useCaptchaStepTwo(
      capturedImage,
      gridSize,
      targetShape,
      targetColor,
      selectedSectors,
      watermarks,
      onSectorToggle,
      sectorKeyMapping
    );

    // Memoize grid lines to avoid recreating on every render
    const gridLines = useMemo(() => {
      if (imageDimensions.width === 0 || imageDimensions.height === 0) {
        return null;
      }

      return Array.from({ length: gridSize + 1 }).map((_, i) => {
        const x = gridDimensions.startX + i * gridDimensions.sectorSize;
        const y = gridDimensions.startY + i * gridDimensions.sectorSize;

        return (
          <g key={`grid-${i}`}>
            {/* Vertical line */}
            {i <= gridSize && (
              <line
                x1={x}
                y1={gridDimensions.startY}
                x2={x}
                y2={
                  gridDimensions.startY + gridSize * gridDimensions.sectorSize
                }
                stroke="rgba(255, 255, 255, 0.5)"
                strokeWidth="1"
              />
            )}
            {/* Horizontal line */}
            {i <= gridSize && (
              <line
                x1={gridDimensions.startX}
                y1={y}
                x2={
                  gridDimensions.startX + gridSize * gridDimensions.sectorSize
                }
                y2={y}
                stroke="rgba(255, 255, 255, 0.5)"
                strokeWidth="1"
              />
            )}
          </g>
        );
      });
    }, [
      gridSize,
      gridDimensions.startX,
      gridDimensions.startY,
      gridDimensions.sectorSize,
      imageDimensions.width,
      imageDimensions.height,
    ]);

    // Memoize sectors to avoid recreating on every render
    const sectors = useMemo(() => {
      if (imageDimensions.width === 0 || imageDimensions.height === 0) {
        return null;
      }

      const sectorsArray: ReactElement[] = [];
      for (let row = 0; row < gridSize; row++) {
        for (let col = 0; col < gridSize; col++) {
          const watermark = getWatermark(row, col);
          const sectorKey = `${row}-${col}`;
          const isSelected = isSectorSelected(row, col);

          // Calculate sector position
          const left = gridDimensions.startX + col * gridDimensions.sectorSize;
          const top = gridDimensions.startY + row * gridDimensions.sectorSize;

          sectorsArray.push(
            <div
              key={sectorKey}
              className="absolute cursor-pointer border border-transparent hover:border-blue-400 transition-colors"
              style={{
                left: `${left}px`,
                top: `${top}px`,
                width: `${gridDimensions.sectorSize}px`,
                height: `${gridDimensions.sectorSize}px`,
                backgroundColor: isSelected
                  ? 'rgba(59, 130, 246, 0.3)'
                  : 'transparent',
              }}
              onClick={(e) => handleSectorToggleWithProtection(row, col, e)}
              title={`Sector ${row + 1},${col + 1}`}
            >
              {/* Render watermark shape if present */}
              {watermark && watermark.shape && (
                <svg
                  width={gridDimensions.sectorSize}
                  height={gridDimensions.sectorSize}
                  className="pointer-events-none"
                >
                  <ShapeGenerator
                    key={`shape-${watermark.shape}-${watermark.colorTint}-${gridDimensions.sectorSize}`}
                    shape={watermark.shape}
                    colorTint={watermark.colorTint!}
                    size={gridDimensions.sectorSize}
                  />
                </svg>
              )}
            </div>
          );
        }
      }
      return sectorsArray;
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [
      gridSize,
      gridDimensions.startX,
      gridDimensions.startY,
      gridDimensions.sectorSize,
      imageDimensions.width,
      imageDimensions.height,
      getWatermark,
      isSectorSelected,
    ]);

    // Memoize selected count text
    const selectedCountText = useMemo(() => {
      const count = selectedSectors.size;
      return `Selected: ${count} sector${count !== 1 ? 's' : ''}`;
    }, [selectedSectors.size]);
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100 p-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-4xl w-full">
          {/* Title */}
          <h2 className="text-2xl font-bold text-blue-600 mb-4 text-center">
            Select{' '}
            {targetShape.charAt(0).toUpperCase() + targetShape.slice(1) + 's'}
          </h2>

          {/* Instruction */}
          <p className="text-center text-gray-700 mb-6">{instructionText}</p>

          {/* Image container with grid overlay */}
          <div className="relative mb-6 bg-black rounded-lg overflow-hidden">
            <img
              ref={imgRef}
              src={capturedImage.imageData}
              alt="Captured selfie"
              className="w-full h-auto block"
              onLoad={handleImageLoad}
            />

            {/* Grid overlay SVG */}
            {gridLines && (
              <svg
                className="absolute top-0 left-0 pointer-events-none"
                width={imageDimensions.width}
                height={imageDimensions.height}
              >
                {gridLines}
              </svg>
            )}

            {/* Interactive sectors */}
            {sectors}
          </div>

          {/* Selected count */}
          <p className="text-center text-gray-600 mb-4">{selectedCountText}</p>

          {/* Validate button */}
          <button
            onClick={onValidate}
            className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-6 rounded-lg transition-colors uppercase"
          >
            Validate
          </button>
        </div>
      </div>
    );
  }
);
