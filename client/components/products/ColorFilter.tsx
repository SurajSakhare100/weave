import React from 'react';

interface ColorFilterProps {
  availableColors: Array<{
    colorName: string;
    colorCode: string;
    count: number;
  }>;
  selectedColor: string | null;
  onColorSelect: (colorName: string | null) => void;
  className?: string;
}

export const ColorFilter: React.FC<ColorFilterProps> = ({
  availableColors,
  selectedColor,
  onColorSelect,
  className = ''
}) => {
  if (!availableColors || availableColors.length === 0) {
    return null;
  }

  return (
    <div className={`color-filter ${className}`}>
      <div className="mb-3">
        <h3 className="text-sm font-medium text-gray-700 mb-2">Filter by Color</h3>
        
        {/* Clear filter button */}
        {selectedColor && (
          <button
            onClick={() => onColorSelect(null)}
            className="text-xs text-blue-600 hover:text-blue-800 mb-2 underline"
          >
            Clear color filter
          </button>
        )}
      </div>
      
      <div className="space-y-2">
        {/* All colors option */}
        <button
          onClick={() => onColorSelect(null)}
          className={`
            w-full flex items-center justify-between p-2 rounded-lg border text-sm transition-colors
            ${selectedColor === null
              ? 'bg-blue-50 border-blue-200 text-blue-800'
              : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
            }
          `}
        >
          <span>All Colors</span>
          <span className="text-xs text-gray-500">
            {availableColors.reduce((sum, color) => sum + color.count, 0)} items
          </span>
        </button>

        {/* Individual color options */}
        {availableColors.map((color) => (
          <button
            key={color.colorName}
            onClick={() => onColorSelect(color.colorName)}
            className={`
              w-full flex items-center justify-between p-2 rounded-lg border text-sm transition-colors
              ${selectedColor === color.colorName
                ? 'bg-blue-50 border-blue-200 text-blue-800'
                : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
              }
            `}
          >
            <div className="flex items-center gap-2">
              <div
                className="w-4 h-4 rounded-full border border-gray-300"
                style={{ backgroundColor: color.colorCode }}
              />
              <span className="capitalize">{color.colorName}</span>
            </div>
            <span className="text-xs text-gray-500">{color.count} items</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default ColorFilter;
