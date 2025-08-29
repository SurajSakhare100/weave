import React, { useState } from 'react';
import { X, Check } from 'lucide-react';
import { Button } from './button';
import { Input } from './input';

// Simplified color palette
const COLOR_PALETTE = [
  { name: 'Black', hex: '#000000' },
  { name: 'White', hex: '#FFFFFF' },
  { name: 'Red', hex: '#FF0000' },
  { name: 'Green', hex: '#00FF00' },
  { name: 'Blue', hex: '#0000FF' },
  { name: 'Yellow', hex: '#FFFF00' },
  { name: 'Purple', hex: '#800080' },
  { name: 'Pink', hex: '#FFC0CB' },
  { name: 'Orange', hex: '#FFA500' },
  { name: 'Brown', hex: '#A52A2A' },
  { name: 'Gray', hex: '#808080' },
  { name: 'Beige', hex: '#F5F5DC' },
];

interface SimpleColorPickerProps {
  onColorSelect: (color: { name: string; hex: string }) => void;
  onClose: () => void;
  existingColors?: string[];
}

export function SimpleColorPicker({ 
  onColorSelect, 
  onClose, 
  existingColors = [] 
}: SimpleColorPickerProps) {
  const [selectedColor, setSelectedColor] = useState<{ name: string; hex: string } | null>(null);
  const [customColor, setCustomColor] = useState('');

  const handleColorSelect = () => {
    if (selectedColor) {
      onColorSelect(selectedColor);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl p-6 w-96 relative">
        {/* Close button */}
        <button 
          onClick={onClose} 
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
        >
          <X className="h-6 w-6" />
        </button>
        
        <h2 className="text-xl font-semibold mb-4">Select Color</h2>
        
        {/* Predefined Colors */}
        <div className="grid grid-cols-4 gap-2 mb-4">
          {COLOR_PALETTE
            .filter(color => !existingColors.includes(color.name))
            .map((color) => (
              <button
                key={color.hex}
                onClick={() => setSelectedColor(color)}
                className={`w-full h-12 rounded border ${
                  selectedColor?.hex === color.hex 
                    ? 'ring-2 ring-primary' 
                    : 'hover:ring-1 hover:ring-gray-300'
                }`}
                style={{ 
                  backgroundColor: color.hex,
                  filter: ['#FFFFFF', '#F5F5DC', '#FFFF00'].includes(color.hex) 
                    ? 'brightness(0.9)' 
                    : 'none' 
                }}
                title={color.name}
              >
                {selectedColor?.hex === color.hex && (
                  <Check className="absolute top-1 right-1 text-white" />
                )}
              </button>
          ))}
        </div>

        {/* Custom Color Input */}
        <div className="flex space-x-2 mb-4">
          <Input 
            type="color" 
            value={customColor}
            onChange={(e) => {
              setCustomColor(e.target.value);
              setSelectedColor({ 
                name: 'Custom', 
                hex: e.target.value 
              });
            }}
            className="w-16 h-12 p-0 border-none"
          />
          <Input 
            type="text" 
            placeholder="Custom color name"
            value={selectedColor?.name === 'Custom' ? selectedColor.name : ''}
            onChange={(e) => {
              if (customColor) {
                setSelectedColor({ 
                  name: e.target.value, 
                  hex: customColor 
                });
              }
            }}
            className="flex-grow"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-2">
          <Button 
            variant="outline" 
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleColorSelect}
            disabled={!selectedColor}
          >
            Select Color
          </Button>
        </div>
      </div>
    </div>
  );
}
