import React, { useState } from 'react';
import { Loader2, AlertCircle, ChevronDown } from 'lucide-react';
import ProductCard from '@/components/products/ProductCard';
import { Button } from '@/components/ui/button';
import { Product } from '@/types/index';

interface ProductGridProps {
  products: Product[];
  loading: boolean;
  error: string | null;
  filters: {
    sort: string;
  };
  onFilterChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  onLoadMore?: () => void;
  hasMore?: boolean;
  loadingMore?: boolean;
}

const ProductGrid: React.FC<ProductGridProps> = ({
  products,
  loading,
  error,
  filters,
  onFilterChange,
  onLoadMore,
  hasMore = false,
  loadingMore = false,
}) => {
  const [itemsPerPage] = useState(12);
  const [currentPage, setCurrentPage] = useState(1);

  // Calculate pagination
  const totalPages = Math.ceil(products.length / itemsPerPage);
  const startIndex = 0; // Show all products initially, pagination handled by parent
  const endIndex = products.length;
  const displayedProducts = products.slice(startIndex, endIndex);

  const handleLoadMore = () => {
    if (onLoadMore) {
      onLoadMore();
    }
  };

  if (loading) {
    return (
      <div className="w-full flex justify-center items-center py-12 sm:py-16">
        <div className="text-center">
          <Loader2 className="h-8 w-8 sm:h-12 sm:w-12 animate-spin text-pink-500 mx-auto mb-4" />
          <p className="text-gray-600 text-sm sm:text-base">Loading products...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full flex flex-col justify-center items-center py-12 sm:py-16">
        <AlertCircle className="h-12 w-12 sm:h-16 sm:w-16 text-red-500 mb-4" />
        <p className="text-red-500 text-center text-sm sm:text-base mb-4">{error}</p>
        <Button 
          onClick={() => window.location.reload()} 
          variant="outline"
          className="text-sm sm:text-base"
        >
          Try Again
        </Button>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="w-full flex flex-col justify-center items-center py-12 sm:py-16">
        <div className="text-center">
          <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 sm:w-10 sm:h-10 text-gray-400" />
          </div>
          <h3 className="text-lg sm:text-xl font-medium text-gray-900 mb-2">No products found</h3>
          <p className="text-gray-500 text-sm sm:text-base">Try adjusting your filters or search terms</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto">
      {/* Sort Controls */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6 sm:mb-8">
        <div className="flex items-center gap-2">
          <span className="text-sm sm:text-base text-gray-600">Sort by:</span>
          <select 
            name="sort" 
            value={filters.sort} 
            onChange={onFilterChange} 
            className="block w-full sm:w-48 pl-3 pr-10 py-2 text-sm sm:text-base border border-gray-300 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500 rounded-md bg-white"
          >
            <option value="-createdAt">Newest First</option>
            <option value="createdAt">Oldest First</option>
            <option value="price">Price: Low to High</option>
            <option value="-price">Price: High to Low</option>
            <option value="discount">Best Discount</option>
            <option value="-averageRating">Highest Rated</option>
          </select>
        </div>
        
        <div className="text-sm sm:text-base text-gray-600">
          Showing {displayedProducts.length} of {products.length} products
        </div>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 lg:gap-8 mb-8">
        {displayedProducts.map((product: Product) => (
          <ProductCard key={product._id} product={product} />
        ))}
      </div>

      {/* Load More Button */}
      {hasMore && (
        <div className="flex justify-center mb-8">
          <Button
            onClick={handleLoadMore}
            disabled={loadingMore}
            variant="outline"
            size="lg"
            className="px-8 py-3 text-sm sm:text-base font-medium"
          >
            {loadingMore ? (
              <>
                <Loader2 className="h-4 w-4 sm:h-5 sm:w-5 animate-spin mr-2" />
                Loading...
              </>
            ) : (
              <>
                <ChevronDown className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                Load More Products
              </>
            )}
          </Button>
        </div>
      )}

      {/* End of Results */}
      {!hasMore && products.length > 0 && (
        <div className="text-center py-8 border-t border-gray-200">
          <p className="text-gray-500 text-sm sm:text-base">
            You've reached the end of all products
          </p>
        </div>
      )}
    </div>
  );
};

export default ProductGrid; 