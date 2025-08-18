import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import MainLayout from '@/components/layout/MainLayout';
import ProductFilters from '@/components/products/ProductFilters';
import ProductGrid from '@/components/products/ProductGrid';
import { getProducts } from '@/services/productService';
import { getCategories } from '@/services/categoryService';
import { Product } from '@/types/index';
import useProductFilters from '@/hooks/useProductFilters';
import { Button } from '@/components/ui/button';
import CustomSelect from '@/components/ui/CustomSelect';
import { AlignLeft, SlidersHorizontal, X, Search } from 'lucide-react'; // Add X & Search import

interface Category {
  _id: string;
  slug: string;
  name: string;
}

const ProductsPage = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [totalProducts, setTotalProducts] = useState(0);
  const [openSort, setOpenSort] = useState(false); // Add state for sort drawer
  const [searchInput, setSearchInput] = useState<string>('');
  const router = useRouter();

  const {
    filters,
    priceRange,
    openFilters,
    minInputRef,
    maxInputRef,
    handleFilterChange,
    handleColorSwatchClick,
    handlePriceChange,
    handleSizeClick,
    handleClearFilters,
    handleAvailabilityToggle,
    handleCategoryClick,
    toggleFilter,
  } = useProductFilters();

  const ITEMS_PER_PAGE = 12;

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

  // Sync local search input with URL query
  useEffect(() => {
    const currentSearch = (router.query.search as string) || '';
    setSearchInput(currentSearch);
  }, [router.query.search]);

  const fetchProducts = async (pageNum: number = 1, append: boolean = false) => {
    const query = { 
      ...router.query,
      page: pageNum,
      limit: ITEMS_PER_PAGE
    };
    
    try {
      const res = await getProducts(query);
      if (res.success) {
        if (append) {
          setProducts(prev => [...prev, ...res.data]);
        } else {
          setProducts(res.data);
        }
        setTotalProducts(res.total || res.data.length);
        setHasMore(res.data.length === ITEMS_PER_PAGE);
      }
    } catch (error) {
      setError('Failed to fetch products');
      console.error('Failed to fetch products', error);
    }
  };

  useEffect(() => {
    setLoading(true);
    setPage(1);
    setHasMore(true);
    
    // If there's a search query, update the title
    if (router.query.search) {
      document.title = `Search: ${router.query.search} - Weave`;
    }
    
    fetchProducts(1, false).finally(() => setLoading(false));
  }, [router.query]);

  const handleLoadMore = async () => {
    if (loadingMore || !hasMore) return;
    
    setLoadingMore(true);
    const nextPage = page + 1;
    setPage(nextPage);
    
    try {
      await fetchProducts(nextPage, true);
    } finally {
      setLoadingMore(false);
    }
  };

  const toggleSort = () => setOpenSort(!openSort); // Toggle function for sort drawer

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const query = { ...router.query } as Record<string, any>;
    if (searchInput && searchInput.trim()) {
      query.search = searchInput.trim();
    } else {
      delete query.search;
    }
    router.push({ pathname: '/products', query }, undefined, { shallow: true });
  };

  const handleClearSearch = () => {
    setSearchInput('');
    const query = { ...router.query } as Record<string, any>;
    delete query.search;
    router.push({ pathname: '/products', query }, undefined, { shallow: true });
  };

  return (
    <MainLayout>
      <div className="min-h-screen bg-white">
        <div className=" mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
          

          {/* Results Count and Search Query */}
          <div className="flex justify-between items-center mb-6">
            {/* <div>
              {router.query.search && (
                <h1 className="text-xl font-medium mb-2">
                  Search results for "{router.query.search}"
                </h1>
              )}
              <h2 className="text-lg font-medium">{totalProducts} Results</h2>
            </div> */}
            
          </div>

          {/* Mobile Search + Trending */}
          <div className="sm:hidden">
            <form onSubmit={handleSearchSubmit} className="relative mb-4">
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#b59c8a]">
                  <Search className="w-5 h-5" />
                </span>
                <input
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder="Search For Bag"
                  className="w-full rounded-2xl border border-[#E7D9CC] bg-white pl-10 pr-10 py-3 text-sm text-[#6c4323] placeholder-[#b59c8a] focus:outline-none focus:ring-2 focus:ring-[#FFB7C9]"
                />
                {searchInput ? (
                  <button type="button" onClick={handleClearSearch} className="absolute right-3 top-1/2 -translate-y-1/2 ">
                    <X className="w-5 h-5" />
                  </button>
                ) : null}
              </div>
            </form>
            {categories && categories.length > 0 && (
              <div className="mb-6">
                <div className="text-[#6c4323] text-base font-semibold mb-2">Trending Searches</div>
                <div className="flex flex-wrap gap-2">
                  {categories.slice(0, 6).map((cat) => (
                    <button
                      key={cat._id}
                      onClick={() => {
                        setSearchInput(cat.name);
                        router.push({ pathname: '/products', query: { ...router.query, search: cat.name } }, undefined, { shallow: true });
                      }}
                      className="px-4 py-2 rounded-full border border-[#E7D9CC] bg-white text-[#6c4323] text-sm"
                    >
                      {cat.name}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="flex flex-row gap-6 sm:gap-8">
            {/* Desktop Filters */}
            <div className="hidden lg:block lg:w-1/5">
              <div className="sticky top-4">
                <ProductFilters
                  categories={categories}
                  filters={filters}
                  priceRange={priceRange}
                  openFilters={openFilters}
                  onFilterChange={handleFilterChange}
                  onColorSwatchClick={handleColorSwatchClick}
                  onPriceChange={handlePriceChange}
                  onSizeClick={handleSizeClick}
                  onClearFilters={handleClearFilters}
                  onAvailabilityToggle={handleAvailabilityToggle}
                  onCategoryClick={handleCategoryClick}
                  onToggleFilter={toggleFilter}
                  minInputRef={minInputRef}
                  maxInputRef={maxInputRef}
                />
              </div>
            </div>

            {/* Product Grid */}
            <div className="w-full lg:w-4/5">
            <div className='flex flex-row gap-4 justify-between items-center'>
            <div className='flex justify-between items-center'>
              <h1 className='text-xl font-medium text-primary'>Tote Bags</h1>
            </div>
           
            <div className="hidden sm:block">
              <CustomSelect
                value={filters.sort}
                onChange={(value) => handleFilterChange({ target: { name: 'sort', value } } as any)}
                options={[
                  { value: '-sales', label: 'Best Selling' },
                  { value: 'price', label: 'Price, low to high' },
                  { value: '-price', label: 'Price, high to low' },
                  { value: 'createdAt', label: 'Date, old to new' },
                  { value: '-createdAt', label: 'Date, new to old' },
                  { value: '-discount', label: 'Discounts' }
                ]}
              />
            </div>
            </div>
              <ProductGrid
                products={products}
                loading={loading}
                error={error}
                filters={filters}
                onFilterChange={handleFilterChange}
                onLoadMore={handleLoadMore}
                hasMore={hasMore}
                loadingMore={loadingMore}
              />
            </div>
          </div>

          {/* Mobile Bottom Navigation */}
          <div className="fixed bottom-0 left-0 right-0 border-t border-gray-200 bg-white sm:hidden z-50">
            <div className="grid grid-cols-2 divide-x divide-gray-200">
              <button
                onClick={toggleSort}
                className="flex items-center justify-center gap-2 py-4 text-[#8B4513]"
              >
                <AlignLeft className="w-5 h-5" />
                <span className="text-sm font-medium">Sort</span>
              </button>
              <button
                onClick={() => toggleFilter('mobile')}
                className="flex items-center justify-center gap-2 py-4 text-[#8B4513]"
              >
                <SlidersHorizontal className="w-5 h-5" />
                <span className="text-sm font-medium">Filter</span>
              </button>
            </div>

            {/* Progress Bar */}
            <div className="h-1 bg-gray-100">
              <div 
                className="h-full bg-[#8B4513]" 
                style={{ 
                  width: `${(products.length / totalProducts) * 100}%` 
                }}
              />
            </div>
          </div>

          {/* Sort Drawer - Bottom Sheet */}
          {openSort && (
            <div className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-50">
              <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl">
                <div className="flex justify-between items-center p-4 border-b border-[#E7D9CC]">
                  <h3 className="text-lg font-medium text-[#5E3A1C]">Sort By</h3>
                  <button onClick={toggleSort} className="p-2">
                    <X className="w-6 h-6 text-[#5E3A1C]" />
                  </button>
                </div>
                
                <div className="p-4">
                  <div className="space-y-2">
                    {[
                      { label: 'Best Selling', value: '-sales' },
                      { label: 'Price, low to high', value: 'price' },
                      { label: 'Price, high to low', value: '-price' },
                      { label: 'Date, old to new', value: 'createdAt' },
                      { label: 'Date, new to old', value: '-createdAt' },
                      { label: 'Discounts', value: '-discount' }
                    ].map((option) => (
                      <button
                        key={option.value}
                        onClick={() => {
                          // Remove immediate closing
                          handleFilterChange({ 
                            target: { name: 'sort', value: option.value }
                          } as any);
                        }}
                        className={`w-full text-left py-3 px-4 rounded-lg transition-colors ${
                          filters.sort === option.value
                            ? 'bg-[#FFF4EC] text-[#5E3A1C]'
                            : 'text-[#5E3A1C] hover:bg-[#FFF4EC]'
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                  
                  {/* New section: Apply Sort button */}
                  <div className="mt-6 flex gap-3 p-4">
                    <button
                      onClick={toggleSort}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={toggleSort}
                      className="flex-1 px-4 py-2 bg-[#EE346C] text-white rounded-lg hover:bg-[#D62A5A]"
                    >
                      Apply Sort
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Mobile Filter Modal */}
          {openFilters.mobile && (
            <div className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-50 overflow-hidden">
              <div className="absolute top-0 left-0 w-4/5 h-full bg-white rounded-r-2xl p-6 max-h-screen overflow-y-auto transform transition-transform duration-300 ease-in-out">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold">Filters</h3>
                  <Button
                    onClick={() => toggleFilter('mobile')}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </Button>
                </div>
                <ProductFilters
                  categories={categories}
                  filters={filters}
                  priceRange={priceRange}
                  openFilters={openFilters}
                  onFilterChange={handleFilterChange}
                  onColorSwatchClick={handleColorSwatchClick}
                  onPriceChange={handlePriceChange}
                  onSizeClick={handleSizeClick}
                  onClearFilters={handleClearFilters}
                  onAvailabilityToggle={handleAvailabilityToggle}
                  onCategoryClick={handleCategoryClick}
                  onToggleFilter={toggleFilter}
                  minInputRef={minInputRef}
                  maxInputRef={maxInputRef}
                />
                <div className="mt-6 flex gap-3">
                  <button
                    onClick={handleClearFilters}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                  >
                    Clear All
                  </button>
                  <button
                    onClick={() => toggleFilter('mobile')}
                    className="flex-1 px-4 py-2 bg-[#EE346C] text-white rounded-lg hover:bg-[#D62A5A]"
                  >
                    Apply Filters
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
};

export default ProductsPage;