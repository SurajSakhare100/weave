import React, { useState } from 'react';
import VendorLayout from '@/components/VendorLayout';
import ColorPalette from '@/components/ui/ColorPalette';

const ColorDemo: React.FC = () => {
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [customColors, setCustomColors] = useState<string[]>([]);

  const customColorSet = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
    '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9'
  ];

  return (
    <VendorLayout>
      <div className="p-6 bg-[#f4f8fb] min-h-screen">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-[#357ab8] mb-8">Color Palette Component Demo</h1>
          
          {/* Default Color Palette */}
          <div className="bg-white rounded-xl p-6 shadow-sm mb-8">
            <h2 className="text-xl font-semibold text-[#357ab8] mb-4">Default Color Palette</h2>
            <p className="text-gray-600 mb-4">Click on colors to select/deselect them. Selected colors will have a pink border.</p>
            <ColorPalette
              selectedColors={selectedColors}
              setSelectedColors={setSelectedColors}
            />
            <div className="mt-4 p-3 bg-gray-50 rounded-lg">
              <p className="text-sm font-medium text-gray-700">Selected Colors:</p>
              <div className="flex flex-wrap gap-2 mt-2">
                {selectedColors.map((color, index) => (
                  <div
                    key={index}
                    className="w-6 h-6 rounded-full border-2 border-gray-300"
                    style={{ backgroundColor: color }}
                    title={color}
                  />
                ))}
                {selectedColors.length === 0 && (
                  <span className="text-gray-500 text-sm">No colors selected</span>
                )}
              </div>
            </div>
          </div>

          {/* Custom Color Palette */}
          <div className="bg-white rounded-xl p-6 shadow-sm mb-8">
            <h2 className="text-xl font-semibold text-[#357ab8] mb-4">Custom Color Palette</h2>
            <p className="text-gray-600 mb-4">Custom color set with different styling.</p>
            <ColorPalette
              selectedColors={customColors}
              setSelectedColors={setCustomColors}
              colors={customColorSet}
              className="gap-3"
            />
            <div className="mt-4 p-3 bg-gray-50 rounded-lg">
              <p className="text-sm font-medium text-gray-700">Selected Colors:</p>
              <div className="flex flex-wrap gap-2 mt-2">
                {customColors.map((color, index) => (
                  <div
                    key={index}
                    className="w-6 h-6 rounded-full border-2 border-gray-300"
                    style={{ backgroundColor: color }}
                    title={color}
                  />
                ))}
                {customColors.length === 0 && (
                  <span className="text-gray-500 text-sm">No colors selected</span>
                )}
              </div>
            </div>
          </div>

          {/* Usage Examples */}
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-[#357ab8] mb-4">Usage Examples</h2>
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <h3 className="font-medium text-gray-900 mb-2">Basic Usage:</h3>
                <pre className="text-sm text-gray-700 bg-white p-3 rounded border">
{`<ColorPalette
  selectedColors={selectedColors}
  setSelectedColors={setSelectedColors}
/>`}
                </pre>
              </div>
              
              <div className="p-4 bg-gray-50 rounded-lg">
                <h3 className="font-medium text-gray-900 mb-2">With Custom Colors:</h3>
                <pre className="text-sm text-gray-700 bg-white p-3 rounded border">
{`<ColorPalette
  selectedColors={selectedColors}
  setSelectedColors={setSelectedColors}
  colors={['#FF6B6B', '#4ECDC4', '#45B7D1']}
  className="gap-3"
/>`}
                </pre>
              </div>
            </div>
          </div>
        </div>
      </div>
    </VendorLayout>
  );
};

export default ColorDemo; 