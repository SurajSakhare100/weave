import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import MainLayout from '@/components/layout/MainLayout';
import ProductFilters from '@/components/products/ProductFilters';
import ProductGrid from '@/components/products/ProductGrid';
import { getProducts } from '@/services/productService';
import { getCategories } from '@/services/categoryService';
import { Product } from '@/types/index';
import useProductFilters from '@/hooks/useProductFilters';

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

  return (
    <MainLayout>
      <div className="min-h-screen bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
          {/* Page Header */}
          <div className="mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-2">Products</h1>
            <p className="text-gray-600 text-sm sm:text-base">
              Discover our collection of {totalProducts} products
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 sm:gap-8">
            {/* Filters - Hidden on mobile, shown on desktop */}
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

            {/* Product Grid - Full width on mobile, 3 columns on desktop */}
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

          {/* Mobile Filter Toggle */}
          <div className="lg:hidden fixed bottom-4 right-4 z-50">
            <button
              onClick={() => toggleFilter('mobile')}
              className="bg-[#EE346C] text-white p-3 rounded-full shadow-lg hover:bg-[#D62A5A] transition-colors"
              aria-label="Toggle filters"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
            </button>
          </div>

          {/* Mobile Filters Modal */}
          {openFilters.mobile && (
            <div className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-50">
              <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl p-6 max-h-[80vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold">Filters</h3>
                  <button
                    onClick={() => toggleFilter('mobile')}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
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