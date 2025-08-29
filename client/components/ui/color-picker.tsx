import React, { useState, useEffect } from 'react';
import { Input } from './input';
import { Button } from './button';
import { X, Check, Palette } from 'lucide-react';

// Expanded color palette with more options and hex values
const COLOR_PALETTE = [
  { name: 'Black', hex: '#000000', textColor: 'white' },
  { name: 'White', hex: '#FFFFFF', textColor: 'black', border: true },
  { name: 'Red', hex: '#FF0000', textColor: 'white' },
  { name: 'Green', hex: '#00FF00', textColor: 'black' },
  { name: 'Blue', hex: '#0000FF', textColor: 'white' },
  { name: 'Yellow', hex: '#FFFF00', textColor: 'black' },
  { name: 'Purple', hex: '#800080', textColor: 'white' },
  { name: 'Pink', hex: '#FFC0CB', textColor: 'black' },
  { name: 'Orange', hex: '#FFA500', textColor: 'black' },
  { name: 'Brown', hex: '#A52A2A', textColor: 'white' },
  { name: 'Gray', hex: '#808080', textColor: 'white' },
  { name: 'Beige', hex: '#F5F5DC', textColor: 'black', border: true },
  { name: 'Navy', hex: '#000080', textColor: 'white' },
  { name: 'Maroon', hex: '#800000', textColor: 'white' },
  { name: 'Olive', hex: '#808000', textColor: 'white' },
  { name: 'Teal', hex: '#008080', textColor: 'white' },
];

interface ColorPickerModalProps {
  onColorSelect: (color: { name: string; hex: string }) => void;
  onClose: () => void;
  existingColors?: string[];
  initialColor?: { name: string; hex: string };
}

export function ColorPickerModal({ 
  onColorSelect, 
  onClose, 
  existingColors = [],
  initialColor 
}: ColorPickerModalProps) {
  const [selectedColor, setSelectedColor] = useState<{ name: string; hex: string } | null>(initialColor || null);
  const [customColor, setCustomColor] = useState({
    name: '',
    hex: '#000000'
  });
  const [isCustomMode, setIsCustomMode] = useState(false);

  // Validate color name
  const validateColorName = (name: string) => {
    // Remove any non-alphabetic characters and trim
    return name.replace(/[^a-zA-Z\s]/g, '').trim();
  };

  // Handle custom color name change
  const handleCustomColorNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const validName = validateColorName(e.target.value);
    setCustomColor(prev => ({
      ...prev,
      name: validName
    }));
  };

  // Handle custom color hex change
  const handleCustomColorHexChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCustomColor(prev => ({
      ...prev,
      hex: e.target.value
    }));
  };

  // Determine text color for contrast
  const getTextColor = (bgColor: string) => {
    // Convert hex to RGB
    const r = parseInt(bgColor.slice(1, 3), 16);
    const g = parseInt(bgColor.slice(3, 5), 16);
    const b = parseInt(bgColor.slice(5, 7), 16);
    
    // Calculate luminance
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    
    return luminance > 0.5 ? 'black' : 'white';
  };

  // Handle color selection
  const handleColorSelect = () => {
    if (isCustomMode) {
      // Validate custom color
      if (!customColor.name) {
        alert('Please enter a color name');
        return;
      }
      
      // Check if color name already exists
      if (existingColors.includes(customColor.name)) {
        alert('This color name is already in use');
        return;
      }

      onColorSelect({
        name: customColor.name,
        hex: customColor.hex
      });
    } else if (selectedColor) {
      onColorSelect(selectedColor);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl p-6 w-[500px] relative">
        {/* Close button */}
        <button 
          onClick={onClose} 
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
        >
          <X className="h-6 w-6" />
        </button>
        
        {/* Title */}
        <h2 className="text-xl font-semibold mb-4 flex items-center">
          <Palette className="mr-2 h-6 w-6 text-primary" />
          Select Product Color
        </h2>

        {/* Toggle between predefined and custom colors */}
        <div className="flex mb-4 border rounded-lg overflow-hidden">
          <button
            onClick={() => setIsCustomMode(false)}
            className={`flex-1 p-2 ${!isCustomMode ? 'bg-primary text-white' : 'bg-gray-100'}`}
          >
            Predefined Colors
          </button>
          <button
            onClick={() => setIsCustomMode(true)}
            className={`flex-1 p-2 ${isCustomMode ? 'bg-primary text-white' : 'bg-gray-100'}`}
          >
            Custom Color
          </button>
        </div>

        {/* Predefined Colors */}
        {!isCustomMode && (
          <div className="grid grid-cols-5 gap-2 mb-4 max-h-64 overflow-y-auto">
            {COLOR_PALETTE
              .filter(color => !existingColors.includes(color.name))
              .map((color) => (
                <button
                  key={color.hex}
                  onClick={() => setSelectedColor(color)}
                  className={`relative w-full h-12 rounded ${
                    selectedColor?.hex === color.hex 
                      ? 'ring-2 ring-primary scale-105' 
                      : 'hover:ring-1 hover:ring-gray-300'
                  } transition-all`}
                  style={{ 
                    backgroundColor: color.hex,
                    border: color.border ? '1px solid #E0E0E0' : 'none'
                  }}
                >
                  {selectedColor?.hex === color.hex && (
                    <Check 
                      className="absolute top-1 right-1" 
                      style={{ color: color.textColor }}
                    />
                  )}
                  <span 
                    className="absolute bottom-0 left-0 right-0 text-xs text-center pb-1"
                    style={{ color: color.textColor }}
                  >
                    {color.name}
                  </span>
                </button>
              ))
            }
          </div>
        )}

        {/* Custom Color */}
        {isCustomMode && (
          <div className="space-y-4">
            <div>
              <label className="block mb-2 text-sm font-medium">Color Name</label>
              <Input 
                type="text" 
                placeholder="Enter color name (e.g., Maroon)"
                value={customColor.name}
                onChange={handleCustomColorNameChange}
                className="w-full"
              />
            </div>

            <div className="flex items-center space-x-4">
              <div>
                <label className="block mb-2 text-sm font-medium">Color Picker</label>
                <Input 
                  type="color" 
                  value={customColor.hex}
                  onChange={handleCustomColorHexChange}
                  className="w-16 h-12 p-0 border-none"
                />
              </div>

              <div className="flex-1">
                <label className="block mb-2 text-sm font-medium">Hex Code</label>
                <Input 
                  type="text" 
                  value={customColor.hex}
                  onChange={(e) => setCustomColor(prev => ({
                    ...prev,
                    hex: e.target.value
                  }))}
                  placeholder="#000000"
                  className="w-full"
                />
              </div>

              {/* Color Preview */}
              <div>
                <label className="block mb-2 text-sm font-medium">Preview</label>
                <div 
                  className="w-16 h-12 rounded border flex items-center justify-center"
                  style={{ 
                    backgroundColor: customColor.hex,
                    color: getTextColor(customColor.hex)
                  }}
                >
                  {customColor.name ? customColor.name[0].toUpperCase() : 'A'}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-end space-x-2 mt-6">
          <Button 
            variant="outline" 
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleColorSelect}
            disabled={
              (isCustomMode && (!customColor.name || !customColor.hex)) || 
              (!isCustomMode && !selectedColor)
            }
          >
            Select Color
          </Button>
        </div>
      </div>
    </div>
  );
}
