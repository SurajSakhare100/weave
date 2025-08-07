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
import { AlignLeft, SlidersHorizontal, X } from 'lucide-react'; // Add X import

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

  return (
    <MainLayout>
      <div className="min-h-screen bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
          

          {/* Results Count and View All */}
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-medium">{totalProducts} Results</h2>
            <a href="#" className="text-[#8B4513] hover:underline">View all</a>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 sm:gap-8">
            {/* Desktop Filters */}
            <div className="hidden lg:block">
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
            <div className="lg:col-span-3">
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

          {/* Sort Drawer - Left Side */}
          {openSort && (
            <div className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-50">
              <div className="absolute top-0 left-0 bottom-0 w-[80%] max-w-md bg-white">
                <div className="flex justify-between items-center p-4 border-b">
                  <h3 className="text-lg font-medium text-gray-900">Sort by</h3>
                  <button onClick={toggleSort} className="p-2">
                    <X className="w-6 h-6 text-gray-500" />
                  </button>
                </div>
                
                <div className="p-4">
                  <div className="space-y-3">
                    {[
                      { label: 'Best Selling', value: 'best-selling' },
                      { label: 'Price, low to high', value: 'price-asc' },
                      { label: 'Price, high to low', value: 'price-desc' },
                      { label: 'Date, old to new', value: 'date-asc' },
                      { label: 'Date, new to old', value: 'date-desc' },
                      { label: 'Discounts', value: 'discount' }
                    ].map((option) => (
                      <button
                        key={option.value}
                        onClick={() => {
                          handleFilterChange({ 
                            target: { name: 'sort', value: option.value }
                          } as any);
                          toggleSort();
                        }}
                        className={`w-full text-left py-3 px-4 rounded-lg transition-colors ${
                          filters.sort === option.value
                            ? 'bg-[#8B4513] text-white'
                            : 'hover:bg-gray-50'
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Mobile Filter Modal */}
          {openFilters.mobile && (
            <div className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-50">
              <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl p-6 max-h-[80vh] overflow-y-auto">
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