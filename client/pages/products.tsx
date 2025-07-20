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
  const [error, setError] = useState<string | null>(null);
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

  return (
    <MainLayout>
      <div className="md:px-10 mx-auto py-8">
        <h1 className="text-3xl font-bold mb-4">Products</h1>
        <div className="flex">
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
          <ProductGrid
            products={products}
            loading={loading}
            error={error}
            filters={filters}
            onFilterChange={handleFilterChange}
          />
        </div>
      </div>
    </MainLayout>
  );
};

export default ProductsPage; 