import React from 'react';

interface ColorPaletteProps {
  selectedColors: string[];
  setSelectedColors: (colors: string[]) => void;
  colors?: string[];
  className?: string;
}

const DEFAULT_COLORS = [
  '#FF6B6B', // Red
  '#4ECDC4', // Teal
  '#45B7D1', // Blue
  '#96CEB4', // Green
  '#FFEAA7', // Yellow
  '#DDA0DD', // Plum
  '#98D8C8', // Mint
  '#F7DC6F', // Gold
  '#BB8FCE', // Purple
  '#85C1E9', // Sky Blue
  '#F8C471', // Orange
  '#82E0AA', // Light Green
  '#F1948A', // Salmon
  '#85C1E9', // Light Blue
  '#F7DC6F', // Light Yellow
  '#D7BDE2', // Light Purple
];

const ColorPalette: React.FC<ColorPaletteProps> = ({
  selectedColors,
  setSelectedColors,
  colors: _colors = DEFAULT_COLORS,
  className = ''
}) => {
  const toggleColor = (color: string) => {
    if (selectedColors.includes(color)) {
      setSelectedColors(selectedColors.filter(c => c !== color));
    } else {
      setSelectedColors([...selectedColors, color]);
    }
  };

  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      {colors.map((color, index) => (
        <button
          key={index}
          type="button"
          className={`w-6 h-6 rounded-full border-2 transition-all duration-200 hover:scale-110 ${
            selectedColors.includes(color) 
              ? 'border-[#EE346C] scale-110 shadow-md' 
              : 'border-gray-300 hover:border-gray-400'
          }`}
          style={{ backgroundColor: color }}
          onClick={() => toggleColor(color)}
          aria-label={`Select color ${color}`}
          title={color}
        />
      ))}
    </div>
  );
};

export default ColorPalette; 