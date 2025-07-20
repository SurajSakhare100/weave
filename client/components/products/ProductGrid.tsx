import React from 'react';
import { Loader2, AlertCircle } from 'lucide-react';
import ProductCard from '@/components/products/ProductCard';
import { Product } from '@/types/index';

interface ProductGridProps {
  products: Product[];
  loading: boolean;
  error: string | null;
  filters: {
    sort: string;
  };
  onFilterChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
}

const ProductGrid: React.FC<ProductGridProps> = ({
  products,
  loading,
  error,
  filters,
  onFilterChange,
}) => {
  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-pink-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col justify-center items-center h-96">
        <AlertCircle className="h-12 w-12 text-red-500" />
        <p className="mt-4 text-red-500">{error}</p>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="flex justify-center items-center h-96">
        <p>No products found.</p>
      </div>
    );
  }

  return (
    <main className="w-4/5">
      <div className="flex justify-end mb-4">
        <select 
          name="sort" 
          value={filters.sort} 
          onChange={onFilterChange} 
          className="block w-52 pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
        >
          <option value="-createdAt">Newest</option>
          <option value="createdAt">Oldest</option>
          <option value="price">Price: Low to High</option>
          <option value="-price">Price: High to Low</option>
          <option value="discount">Discount</option>
        </select>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
        {products.map((product: Product) => (
          <ProductCard key={product._id} product={product} />
        ))}
      </div>
    </main>
  );
};

export default ProductGrid; 