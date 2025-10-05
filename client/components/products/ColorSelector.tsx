import React from 'react';
import { ColorVariant } from '@/types/index';

interface ColorSelectorProps {
  colorVariants: ColorVariant[];
  selectedColor: string | null;
  onColorSelect: (colorName: string) => void;
  className?: string;
}

export const ColorSelector: React.FC<ColorSelectorProps> = ({
  colorVariants,
  selectedColor,
  onColorSelect,
  className = ''
}) => {
  if (!colorVariants || colorVariants.length === 0) {
    return null;
  }

  return (
    <div className={`color-selector ${className}`}>
      <div className="mb-2">
        <span className="text-sm font-medium text-gray-700">Color:</span>
        <span className="ml-2 text-sm text-gray-600">
          {selectedColor || 'Select a color'}
        </span>
      </div>
      
      <div className="flex flex-wrap gap-2">
        {colorVariants.map((variant) => (
          <button
            key={variant.colorName}
            onClick={() => onColorSelect(variant.colorName)}
            disabled={!variant.isActive || variant.stock <= 0}
            className={`
              relative w-10 h-10 rounded-full border-2 transition-all duration-200
              ${selectedColor === variant.colorName
                ? 'border-gray-800 scale-110 shadow-lg'
                : 'border-gray-300 hover:border-gray-500'
              }
              ${!variant.isActive || variant.stock <= 0
                ? 'opacity-50 cursor-not-allowed grayscale'
                : 'cursor-pointer hover:scale-105'
              }
            `}
            style={{ backgroundColor: variant.colorCode }}
            title={`${variant.colorName} ${variant.stock <= 0 ? '(Out of Stock)' : `(${variant.stock} available)`}`}
          >
            {selectedColor === variant.colorName && (
              <div className="absolute inset-0 flex items-center justify-center">
                <svg 
                  className="w-5 h-5 text-white drop-shadow-md" 
                  fill="currentColor" 
                  viewBox="0 0 20 20"
                >
                  <path 
                    fillRule="evenodd" 
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" 
                    clipRule="evenodd" 
                  />
                </svg>
              </div>
            )}
            
            {/* Stock indicator */}
            {variant.stock <= 0 && (
              <div className="absolute inset-0 flex items-center justify-center">
                <svg 
                  className="w-6 h-6 text-red-600" 
                  fill="currentColor" 
                  viewBox="0 0 20 20"
                >
                  <path 
                    fillRule="evenodd" 
                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" 
                    clipRule="evenodd" 
                  />
                </svg>
              </div>
            )}
          </button>
        ))}
      </div>
      
      {/* Color name display */}
      {selectedColor && (
        <div className="mt-2 text-sm text-gray-600">
          Selected: <span className="font-medium capitalize">{selectedColor}</span>
        </div>
      )}
    </div>
  );
};

export default ColorSelector;
