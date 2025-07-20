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

const COLOR_SWATCHES = [
  '#e5dbc8', '#000000', '#7b4d2b', '#e5dbc8', '#3d5c49', '#c75a2a', '#7b7b2b', '#c75a5a',
  '#8a8a0d', '#8b7b5b', '#dbeec8', '#8b4d5b', '#dba87b', '#5a5a7b', '#3d2b1b', '#b88b4d'
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
            <div className="flex flex-wrap gap-2 items-center mt-1">
              {COLOR_SWATCHES.map((color) => (
                <button
                  key={color}
                  type="button"
                  className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-150 ${filters.colors && filters.colors.split(',').includes(color) ? 'border-[#cf1a53] scale-110' : 'border-[#e5e5e5]'}`}
                  style={{ backgroundColor: color }}
                  onClick={() => onColorSwatchClick(color)}
                  aria-label={color}
                />
              ))}
            </div>
          )}
        </div>

        <div>
          <div className="flex items-center justify-between cursor-pointer mb-1" onClick={() => onToggleFilter('price')}>
            <label className="block text-sm font-medium text-[#6c4323]">Price</label>
            {openFilters.price ? <ChevronUp className="h-4 w-4 text-[#6c4323]" /> : <ChevronDown className="h-4 w-4 text-[#6c4323]" />}
          </div>
          {openFilters.price && (
            <div className="mb-2 flex flex-col gap-2">
              <div className="relative flex items-center h-8 mb-2">
                <input
                  type="range"
                  min={0}
                  max={10000}
                  value={priceRange.min}
                  onChange={e => {
                    let min = Number(e.target.value);
                    if (min > priceRange.max) min = priceRange.max;
                    onPriceChange(min, priceRange.max);
                  }}
                  className="w-full accent-[#6c4323] h-2 rounded-lg appearance-none bg-[#e5e5e5]"
                  style={{ zIndex: 2, position: 'absolute' }}
                />
                <input
                  type="range"
                  min={0}
                  max={10000}
                  value={priceRange.max}
                  onChange={e => {
                    let max = Number(e.target.value);
                    if (max < priceRange.min) max = priceRange.min;
                    onPriceChange(priceRange.min, max);
                  }}
                  className="w-full accent-[#6c4323] h-2 rounded-lg appearance-none bg-[#e5e5e5]"
                  style={{ zIndex: 1, position: 'absolute' }}
                />
              </div>
              <div className="flex items-center gap-2 mt-2">
                <div className="flex items-center border border-[#e5e5e5] rounded-md px-2 py-1 bg-white">
                  <span className="text-[#b59c8a] text-lg mr-1">₹</span>
                  <input
                    ref={minInputRef}
                    type="number"
                    min={0}
                    max={priceRange.max}
                    value={priceRange.min}
                    onChange={e => {
                      let min = Number(e.target.value);
                      if (min > priceRange.max) min = priceRange.max;
                      onPriceChange(min, priceRange.max);
                    }}
                    className="w-12 text-center border-none outline-none text-[#6c4323] font-semibold bg-transparent"
                  />
                </div>
                <span className="text-[#b59c8a] text-lg">to</span>
                <div className="flex items-center border border-[#e5e5e5] rounded-md px-2 py-1 bg-white">
                  <span className="text-[#b59c8a] text-lg mr-1">₹</span>
                  <input
                    ref={maxInputRef}
                    type="number"
                    min={priceRange.min}
                    max={10000}
                    value={priceRange.max}
                    onChange={e => {
                      let max = Number(e.target.value);
                      if (max < priceRange.min) max = priceRange.min;
                      onPriceChange(priceRange.min, max);
                    }}
                    className="w-12 text-center border-none outline-none text-[#6c4323] font-semibold bg-transparent"
                  />
                </div>
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