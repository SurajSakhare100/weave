import React from 'react';
import { ChevronUp, ChevronDown } from 'lucide-react';

interface Category {
  _id: string;
  slug: string;
  name: string;
}

interface ProductFiltersProps {
  categories: Category[];
  filters: {
    category: string;
    availability: string;
    size: string;
    colors: string;
    minPrice: string;
    maxPrice: string;
    sort: string;
  };
  priceRange: {
    min: number;
    max: number;
  };
  openFilters: { [key: string]: boolean };
  onFilterChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  onColorSwatchClick: (color: string) => void;
  onPriceChange: (min: number, max: number) => void;
  onSizeClick: (sizeOption: string) => void;
  onClearFilters: () => void;
  onAvailabilityToggle: () => void;
  onCategoryClick: (slug: string) => void;
  onToggleFilter: (key: string) => void;
  minInputRef: React.RefObject<HTMLInputElement>;
  maxInputRef: React.RefObject<HTMLInputElement>;
}

// Updated color swatches based on seed file colors
const COLOR_SWATCHES = [
  { name: 'natural', color: '#f5f5dc', hex: '#f5f5dc' },
  { name: 'beige', color: '#f5f5dc', hex: '#f5f5dc' },
  { name: 'brown', color: '#8b4513', hex: '#8b4513' },
  { name: 'black', color: '#000000', hex: '#000000' },
  { name: 'cream', color: '#fffdd0', hex: '#fffdd0' },
  { name: 'blue', color: '#0000ff', hex: '#0000ff' },
  { name: 'white', color: '#ffffff', hex: '#ffffff' },
  { name: 'pink', color: '#ffc0cb', hex: '#ffc0cb' },
  { name: 'green', color: '#008000', hex: '#008000' },
  { name: 'gray', color: '#808080', hex: '#808080' },
  { name: 'navy', color: '#000080', hex: '#000080' },
  { name: 'olive', color: '#808000', hex: '#808000' },
  { name: 'burgundy', color: '#800020', hex: '#800020' }
];

const ProductFilters: React.FC<ProductFiltersProps> = ({
  categories,
  filters,
  priceRange,
  openFilters,
  onFilterChange,
  onColorSwatchClick,
  onPriceChange,
  onSizeClick,
  onClearFilters,
  onAvailabilityToggle,
  onCategoryClick,
  onToggleFilter,
  minInputRef,
  maxInputRef,
}) => {
  // Calculate price range for better UX
  const maxPriceValue = 3000; // Based on seed file prices (max is 2499)
  const minPriceValue = 0;

  return (
    <aside className="w-1/5 pr-8">
      <h2 className="text-xl font-semibold mb-4">Filters</h2>
      <button
        onClick={onClearFilters}
        className="mb-4 border border-[#b59c8a] text-[#6c4323] rounded-md px-4 py-2 text-sm font-medium hover:bg-[#f5e7df] transition-colors"
      >
        Clear All Filters
      </button>
      <div className="space-y-4">
        <div>
          <div className="flex items-center justify-between cursor-pointer mb-1" onClick={() => onToggleFilter('category')}>
            <label className="block text-sm font-medium text-[#6c4323]">Product Category</label>
            {openFilters.category ? <ChevronUp className="h-4 w-4 text-[#6c4323]" /> : <ChevronDown className="h-4 w-4 text-[#6c4323]" />}
          </div>
          {openFilters.category && (
            <div className="flex flex-col gap-1 mt-1">
              <button
                type="button"
                className={`text-left px-1 py-1 rounded-md text-base font-medium transition-all duration-150 ${!filters.category ? 'bg-[#f5e7df] text-[#6c4323] font-bold' : 'text-[#8b7355] hover:bg-[#f5e7df]'}`}
                onClick={() => onCategoryClick('')}
              >
                All
              </button>
              {categories.map((cat) => (
                <button
                  key={cat._id}
                  type="button"
                  className={`text-left px-1 py-1 rounded-md text-base font-medium transition-all duration-150 ${filters.category === cat.slug ? 'bg-[#f5e7df] text-[#6c4323] font-bold' : 'text-[#8b7355] hover:bg-[#f5e7df]'}`}
                  onClick={() => onCategoryClick(cat.slug)}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          )}
        </div>

        <div>
          <div className="flex items-center justify-between cursor-pointer mb-1" onClick={() => onToggleFilter('availability')}>
            <label className="block text-sm font-medium text-[#6c4323]">Availability</label>
            {openFilters.availability ? <ChevronUp className="h-4 w-4 text-[#6c4323]" /> : <ChevronDown className="h-4 w-4 text-[#6c4323]" />}
          </div>
          {openFilters.availability && (
            <div className="flex items-center gap-3 mt-2">
              <button
                type="button"
                onClick={onAvailabilityToggle}
                className={`w-10 h-6 rounded-full flex items-center transition-colors duration-200 ${filters.availability === 'true' ? 'bg-[#8b7355]' : 'bg-[#e5e5e5]'}`}
                style={{ position: 'relative' }}
                aria-pressed={filters.availability === 'true'}
              >
                <span
                  className={`block w-5 h-5 rounded-full bg-white shadow transition-transform duration-200 ${filters.availability === 'true' ? 'translate-x-4' : 'translate-x-0'}`}
                  style={{ position: 'absolute', left: 2, top: 1 }}
                />
              </button>
              <span className="text-[#8b7355] text-base font-medium">In Stock</span>
            </div>
          )}
        </div>

        <div>
          <div className="flex items-center justify-between cursor-pointer mb-1" onClick={() => onToggleFilter('size')}>
            <label className="block text-sm font-medium text-[#6c4323]">Size</label>
            {openFilters.size ? <ChevronUp className="h-4 w-4 text-[#6c4323]" /> : <ChevronDown className="h-4 w-4 text-[#6c4323]" />}
          </div>
          {openFilters.size && (
            <div className="flex flex-col gap-1 mt-1">
              {['XS', 'S', 'M', 'L', 'XL', 'XXL'].map(sizeOption => (
                <button
                  key={sizeOption}
                  type="button"
                  className={`text-left px-1 py-1 rounded-md text-base font-medium transition-all duration-150 ${filters.size && filters.size.split(',').includes(sizeOption) ? 'bg-[#f5e7df] text-[#6c4323] font-bold' : 'text-[#8b7355] hover:bg-[#f5e7df]'}`}
                  onClick={() => onSizeClick(sizeOption)}
                >
                  {sizeOption}
                </button>
              ))}
            </div>
          )}
        </div>

        <div>
          <div className="flex items-center justify-between cursor-pointer mb-1" onClick={() => onToggleFilter('color')}>
            <label className="block text-sm font-medium text-[#6c4323]">Color</label>
            {openFilters.color ? <ChevronUp className="h-4 w-4 text-[#6c4323]" /> : <ChevronDown className="h-4 w-4 text-[#6c4323]" />}
          </div>
          {openFilters.color && (
            <div className="mt-2">
              <div className="flex flex-wrap gap-2 items-center mb-2">
                {COLOR_SWATCHES.map((colorItem) => (
                  <button
                    key={colorItem.name}
                    type="button"
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all duration-150 relative ${filters.colors && filters.colors.split(',').includes(colorItem.name) ? 'border-[#cf1a53] scale-110' : 'border-[#e5e5e5] hover:border-[#b59c8a]'}`}
                    style={{ backgroundColor: colorItem.hex }}
                    onClick={() => onColorSwatchClick(colorItem.name)}
                    aria-label={colorItem.name}
                    title={colorItem.name}
                  >
                    {filters.colors && filters.colors.split(',').includes(colorItem.name) && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-3 h-3  rounded-full opacity-80"></div>
                      </div>
                    )}
                  </button>
                ))}
              </div>
              <div className="text-xs text-[#8b7355] mt-1">
                Selected: {filters.colors ? filters.colors.split(',').join(', ') : 'None'}
              </div>
            </div>
          )}
        </div>

        <div>
          <div className="flex items-center justify-between cursor-pointer mb-1" onClick={() => onToggleFilter('price')}>
            <label className="block text-sm font-medium text-[#6c4323]">Price Range</label>
            {openFilters.price ? <ChevronUp className="h-4 w-4 text-[#6c4323]" /> : <ChevronDown className="h-4 w-4 text-[#6c4323]" />}
          </div>
          {openFilters.price && (
            <div className="mb-2 flex flex-col gap-3">
              {/* Price Range Slider */}
              <div className="relative">
                <div className="h-2 bg-[#e5e5e5] rounded-lg relative">
                  <div 
                    className="absolute h-2 bg-[#6c4323] rounded-lg"
                    style={{
                      left: `${(priceRange.min / maxPriceValue) * 100}%`,
                      right: `${100 - (priceRange.max / maxPriceValue) * 100}%`
                    }}
                  ></div>
                </div>
                <input
                  type="range"
                  min={minPriceValue}
                  max={maxPriceValue}
                  value={priceRange.min}
                  onChange={e => {
                    let min = Number(e.target.value);
                    if (min > priceRange.max) min = priceRange.max;
                    onPriceChange(min, priceRange.max);
                  }}
                  className="absolute top-0 w-full h-2 opacity-0 cursor-pointer"
                />
                <input
                  type="range"
                  min={minPriceValue}
                  max={maxPriceValue}
                  value={priceRange.max}
                  onChange={e => {
                    let max = Number(e.target.value);
                    if (max < priceRange.min) max = priceRange.min;
                    onPriceChange(priceRange.min, max);
                  }}
                  className="absolute top-0 w-full h-2 opacity-0 cursor-pointer"
                />
              </div>

              {/* Price Input Fields */}
              <div className="flex items-center gap-2">
                <div className="flex items-center border border-[#e5e5e5] rounded-md px-3 py-2 bg-white flex-1">
                  <span className="text-[#b59c8a] text-sm mr-1">₹</span>
                  <input
                    ref={minInputRef}
                    type="number"
                    min={minPriceValue}
                    max={priceRange.max}
                    value={priceRange.min}
                    onChange={e => {
                      let min = Number(e.target.value);
                      if (min > priceRange.max) min = priceRange.max;
                      if (min < minPriceValue) min = minPriceValue;
                      onPriceChange(min, priceRange.max);
                    }}
                    className="w-full text-center border-none outline-none text-[#6c4323] font-medium bg-transparent text-sm"
                    placeholder="Min"
                  />
                </div>
                <span className="text-[#b59c8a] text-sm font-medium">to</span>
                <div className="flex items-center border border-[#e5e5e5] rounded-md px-3 py-2 bg-white flex-1">
                  <span className="text-[#b59c8a] text-sm mr-1">₹</span>
                  <input
                    ref={maxInputRef}
                    type="number"
                    min={priceRange.min}
                    max={maxPriceValue}
                    value={priceRange.max}
                    onChange={e => {
                      let max = Number(e.target.value);
                      if (max < priceRange.min) max = priceRange.min;
                      if (max > maxPriceValue) max = maxPriceValue;
                      onPriceChange(priceRange.min, max);
                    }}
                    className="w-full text-center border-none outline-none text-[#6c4323] font-medium bg-transparent text-sm"
                    placeholder="Max"
                  />
                </div>
              </div>

              {/* Price Range Labels */}
              <div className="flex justify-between text-xs text-[#8b7355]">
                <span>₹{minPriceValue}</span>
                <span>₹{maxPriceValue}</span>
              </div>

              {/* Quick Price Filters */}
              <div className="flex flex-wrap gap-2 mt-2">
                {[
                  { label: 'Under ₹500', min: 0, max: 500 },
                  { label: '₹500 - ₹1000', min: 500, max: 1000 },
                  { label: '₹1000 - ₹2000', min: 1000, max: 2000 },
                  { label: 'Over ₹2000', min: 2000, max: maxPriceValue }
                ].map((range) => (
                  <button
                    key={range.label}
                    type="button"
                    onClick={() => onPriceChange(range.min, range.max)}
                    className={`px-3 py-1 text-xs rounded-full border transition-colors ${
                      priceRange.min === range.min && priceRange.max === range.max
                        ? 'bg-[#6c4323] text-white border-[#6c4323]'
                        : 'bg-white text-[#6c4323] border-[#e5e5e5] hover:border-[#6c4323]'
                    }`}
                  >
                    {range.label}
                  </button>
                ))}
              </div>
            </div>
          )}
          <hr className="border-[#f5e7df] mt-2" />
        </div>
      </div>
    </aside>
  );
};

export default ProductFilters; 