import Layout from '@/components/Layout';
import ProductCard from '@/components/ProductCard';
import { getProducts } from '@/services/productService';
import { getCategories } from '@/services/categoryService';
import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/router';
import { Product } from '@/types/index';
import { Loader2, AlertCircle, ChevronUp, ChevronDown } from 'lucide-react';

const COLOR_SWATCHES = [
  '#e5dbc8', '#000000', '#7b4d2b', '#e5dbc8', '#3d5c49', '#c75a2a', '#7b7b2b', '#c75a5a',
  '#8a8a0d', '#8b7b5b', '#dbeec8', '#8b4d5b', '#dba87b', '#5a5a7b', '#3d2b1b', '#b88b4d'
];

const ProductsPage = () => {
    const [products, setProducts] = useState<Product[]>([]);
    const [categories, setCategories] = useState<Array<{ _id: string; slug: string; name: string }>>([]);
    const [filters, setFilters] = useState({
        category: '',
        availability: '',
        size: '',
        colors: '',
        minPrice: '',
        maxPrice: '',
        sort: '-createdAt'
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();
    const [priceRange, setPriceRange] = useState({
        min: Number(filters.minPrice) || 0,
        max: Number(filters.maxPrice) || 10000
    });
    const minInputRef = useRef<HTMLInputElement>(null);
    const maxInputRef = useRef<HTMLInputElement>(null);
    // Dropdown state for filters
    const [openFilters, setOpenFilters] = useState<{ [key: string]: boolean }>({ category: true, availability: true, size: true, price: true, color: true });
    const toggleFilter = (key: string) => setOpenFilters(f => ({ ...f, [key]: !f[key] }));

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const res = await getCategories();
                if (res.success) {
                    setCategories(res.data);
                }
            } catch (error) {
                console.error('Failed to fetch categories', error);
            }
        };
        fetchCategories();
    }, []);

    useEffect(() => {
        const query = { ...router.query };
        
        // sync filters state with url query params
        setFilters(prev => ({
            ...prev,
            ...query
        }));

        const fetchProducts = async () => {
            setLoading(true);
            setError(null);
            try {
                const res = await getProducts(query);
                if (res.success) {
                    setProducts(res.data);
                }
            } catch (error) {
                setError('Failed to fetch products');
                console.error('Failed to fetch products', error);
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, [router.query]);
    
    const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        const newFilters = { ...filters, [name]: value };
        setFilters(newFilters);

        const query = { ...newFilters };
        // Remove empty filters
        Object.keys(query).forEach(key => {
            const filterKey = key as keyof typeof query;
            if (query[filterKey] === '' || query[filterKey] === null) {
                delete query[filterKey];
            }
        });

        router.push({
            pathname: '/products',
            query,
        }, undefined, { shallow: true });
    };

    const handleColorSwatchClick = (color: string) => {
        let selectedColors = filters.colors ? filters.colors.split(',') : [];
        if (selectedColors.includes(color)) {
            selectedColors = selectedColors.filter(c => c !== color);
        } else {
            selectedColors.push(color);
        }
        const newFilters = { ...filters, colors: selectedColors.join(',') };
        setFilters(newFilters);
        const query = { ...newFilters };
        Object.keys(query).forEach(key => {
            const filterKey = key as keyof typeof query;
            if (query[filterKey] === '' || query[filterKey] === null) {
                delete query[filterKey];
            }
        });
        router.push({ pathname: '/products', query }, undefined, { shallow: true });
    };

    const handlePriceChange = (min: number, max: number) => {
        setPriceRange({ min, max });
        const newFilters = { ...filters, minPrice: min.toString(), maxPrice: max.toString() };
        setFilters(newFilters);
        const query = { ...newFilters };
        Object.keys(query).forEach(key => {
            const filterKey = key as keyof typeof query;
            if (query[filterKey] === '' || query[filterKey] === null) {
                delete query[filterKey];
            }
        });
        router.push({ pathname: '/products', query }, undefined, { shallow: true });
    };

    // Multi-select for size
    const handleSizeClick = (sizeOption: string) => {
        let selectedSizes = filters.size ? filters.size.split(',') : [];
        if (selectedSizes.includes(sizeOption)) {
            selectedSizes = selectedSizes.filter(s => s !== sizeOption);
        } else {
            selectedSizes.push(sizeOption);
        }
        const newFilters = { ...filters, size: selectedSizes.join(',') };
        setFilters(newFilters);
        const query = { ...newFilters };
        Object.keys(query).forEach(key => {
            const filterKey = key as keyof typeof query;
            if (query[filterKey] === '' || query[filterKey] === null) {
                delete query[filterKey];
            }
        });
        router.push({ pathname: '/products', query }, undefined, { shallow: true });
    };

    // Clear all filters
    const handleClearFilters = () => {
        setFilters({
            category: '',
            availability: '',
            size: '',
            colors: '',
            minPrice: '',
            maxPrice: '',
            sort: '-createdAt'
        });
        setPriceRange({ min: 0, max: 10000 });
        router.push({ pathname: '/products' }, undefined, { shallow: true });
    };

    // Custom toggle for availability
    const handleAvailabilityToggle = () => {
        const newFilters = { ...filters, availability: filters.availability === 'true' ? '' : 'true' };
        setFilters(newFilters);
        const query = { ...newFilters };
        Object.keys(query).forEach(key => {
            const filterKey = key as keyof typeof query;
            if (query[filterKey] === '' || query[filterKey] === null) {
                delete query[filterKey];
            }
        });
        router.push({ pathname: '/products', query }, undefined, { shallow: true });
    };

    // Custom category click
    const handleCategoryClick = (slug: string) => {
        const newFilters = { ...filters, category: filters.category === slug ? '' : slug };
        setFilters(newFilters);
        const query = { ...newFilters };
        Object.keys(query).forEach(key => {
            const filterKey = key as keyof typeof query;
            if (query[filterKey] === '' || query[filterKey] === null) {
                delete query[filterKey];
            }
        });
        router.push({ pathname: '/products', query }, undefined, { shallow: true });
    };

    return (
        <Layout>
            <div className="md:px-10 mx-auto py-8">
                <h1 className="text-3xl font-bold mb-4">Products</h1>
                <div className="flex">
                    {/* Filters Sidebar */}
                    <aside className="w-1/5 pr-8">
                        <h2 className="text-xl font-semibold mb-4">Filters</h2>
                        <button
                          onClick={handleClearFilters}
                          className="mb-4 border border-[#b59c8a] text-[#6c4323] rounded-md px-4 py-2 text-sm font-medium hover:bg-[#f5e7df] transition-colors"
                        >
                          Clear All Filters
                        </button>
                        <div className="space-y-4">
                            {/* Category Filter Dropdown */}
                            <div>
                                <div className="flex items-center justify-between cursor-pointer mb-1" onClick={() => toggleFilter('category')}>
                                    <label className="block text-sm font-medium text-[#6c4323]">Product Category</label>
                                    {openFilters.category ? <ChevronUp className="h-4 w-4 text-[#6c4323]" /> : <ChevronDown className="h-4 w-4 text-[#6c4323]" />}
                                </div>
                                {openFilters.category && (
                                  <div className="flex flex-col gap-1 mt-1">
                                    <button
                                      type="button"
                                      className={`text-left px-1 py-1 rounded-md text-base font-medium transition-all duration-150 ${!filters.category ? 'bg-[#f5e7df] text-[#6c4323] font-bold' : 'text-[#8b7355] hover:bg-[#f5e7df]'}`}
                                      onClick={() => handleCategoryClick('')}
                                    >
                                      All
                                    </button>
                                    {categories.map((cat) => (
                                      <button
                                        key={cat._id}
                                        type="button"
                                        className={`text-left px-1 py-1 rounded-md text-base font-medium transition-all duration-150 ${filters.category === cat.slug ? 'bg-[#f5e7df] text-[#6c4323] font-bold' : 'text-[#8b7355] hover:bg-[#f5e7df]'}`}
                                        onClick={() => handleCategoryClick(cat.slug)}
                                      >
                                        {cat.name}
                                      </button>
                                    ))}
                                  </div>
                                )}
                            </div>
                            {/* Availability Filter Dropdown */}
                            <div>
                                <div className="flex items-center justify-between cursor-pointer mb-1" onClick={() => toggleFilter('availability')}>
                                    <label className="block text-sm font-medium text-[#6c4323]">Availability</label>
                                    {openFilters.availability ? <ChevronUp className="h-4 w-4 text-[#6c4323]" /> : <ChevronDown className="h-4 w-4 text-[#6c4323]" />}
                                </div>
                                {openFilters.availability && (
                                  <div className="flex items-center gap-3 mt-2">
                                    <button
                                      type="button"
                                      onClick={handleAvailabilityToggle}
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
                            {/* Size Filter Dropdown */}
                            <div>
                                <div className="flex items-center justify-between cursor-pointer mb-1" onClick={() => toggleFilter('size')}>
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
                                        onClick={() => handleSizeClick(sizeOption)}
                                      >
                                        {sizeOption}
                                      </button>
                                    ))}
                                  </div>
                                )}
                            </div>
                            {/* Color Filter Dropdown */}
                            <div>
                                <div className="flex items-center justify-between cursor-pointer mb-1" onClick={() => toggleFilter('color')}>
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
                                        onClick={() => handleColorSwatchClick(color)}
                                        aria-label={color}
                                      />
                                    ))}
                                  </div>
                                )}
                            </div>
                            {/* Price Filter Dropdown */}
                            <div>
                                <div className="flex items-center justify-between cursor-pointer mb-1" onClick={() => toggleFilter('price')}>
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
                                          handlePriceChange(min, priceRange.max);
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
                                          handlePriceChange(priceRange.min, max);
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
                                            handlePriceChange(min, priceRange.max);
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
                                            handlePriceChange(priceRange.min, max);
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
                    {/* Products Grid */}
                    <main className="w-4/5">
                        <div className="flex justify-end mb-4">
                            <select name="sort" value={filters.sort} onChange={handleFilterChange} className="block w-52 pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md">
                                <option value="-createdAt">Newest</option>
                                <option value="createdAt">Oldest</option>
                                <option value="price">Price: Low to High</option>
                                <option value="-price">Price: High to Low</option>
                                <option value="discount">Discount</option>
                            </select>
                        </div>
                        {loading ? (
                            <div className="flex justify-center items-center h-96">
                                <Loader2 className="h-8 w-8 animate-spin text-pink-500" />
                            </div>
                        ) : error ? (
                             <div className="flex flex-col justify-center items-center h-96">
                                <AlertCircle className="h-12 w-12 text-red-500" />
                                <p className="mt-4 text-red-500">{error}</p>
                            </div>
                        ) : products.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
                                {products.map((product: Product) => (
                                    <ProductCard key={product._id} product={product} />
                                ))}
                            </div>
                        ) : (
                            <div className="flex justify-center items-center h-96">
                                <p>No products found.</p>
                            </div>
                        )}
                    </main>
                </div>
            </div>
        </Layout>
    );
};

export default ProductsPage; 