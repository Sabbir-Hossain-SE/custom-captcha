import { memo } from 'react';
import type { ColorTint, ShapeType } from '../types';

interface ShapeGeneratorProps {
  shape: ShapeType;
  colorTint: ColorTint;
  size: number;
}
export const ShapeGenerator: React.FC<ShapeGeneratorProps> = memo(
  ({ shape, colorTint, size }) => {
    const baseColor = colorTint
      ? {
          red: '#ef4444',
          green: '#22c55e',
          blue: '#3b82f6',
        }[colorTint]
      : '#000000';

    const center = size / 2;
    const shapeSize = size * 0.6;

    switch (shape) {
      case 'triangle':
        return (
          <polygon
            points={`${center},${center - shapeSize / 2} ${center - shapeSize / 2},${center + shapeSize / 2} ${center + shapeSize / 2},${center + shapeSize / 2}`}
            fill={baseColor}
            opacity="0.7"
          />
        );
      case 'square':
        return (
          <rect
            x={center - shapeSize / 2}
            y={center - shapeSize / 2}
            width={shapeSize}
            height={shapeSize}
            fill={baseColor}
            opacity="0.7"
          />
        );
      case 'circle':
        return (
          <circle
            cx={center}
            cy={center}
            r={shapeSize / 2}
            fill={baseColor}
            opacity="0.7"
          />
        );
      default:
        return <></>;
    }
  }
);
