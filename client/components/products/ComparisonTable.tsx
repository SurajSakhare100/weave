import React from 'react';
import Image from 'next/image';
import { Star } from 'lucide-react';
import { Product, ProductWithReviews } from '@/types';
import Link from 'next/link';

interface ComparisonTableProps {
  products: (Product | ProductWithReviews)[];
  onRemoveProduct: (productId: string) => void;
}

const ComparisonTable: React.FC<ComparisonTableProps> = ({ products, onRemoveProduct }) => {
  const getPrimaryImage = (product: Product | ProductWithReviews) => {
    if (product.images && product.images.length > 0) {
      const primary = product.images.find(img => img.is_primary);
      return primary ? primary.url : product.images[0].url;
    }
    return '/products/product.png';
  };

  const getStarRating = (rating: number) => {
    return Math.round(rating);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price).replace('₹', '₹ ');
  };

  const getCategoryName = (category: any) => {
    if (category && typeof category === 'object' && category !== null) {
      return category.name || 'N/A';
    }
    return (category as string) || 'N/A';
  };

  if (products.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <p className="text-lg mb-2">No products selected for comparison</p>
        <p className="text-sm">Add products from the suggestions to compare them</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse bg-white">
        {/* Product Images Row */}
        <tbody>
          <tr>
            <td className="p-4 font-medium text-[#5E3A1C] text-left border-b border-gray-200 w-32">
              Bag Image
            </td>
            {products.map((product) => (
              <td key={product._id} className="p-4 text-center border-b border-gray-200 min-w-[200px] relative">
                <div className="relative w-32 h-32 mx-auto mb-2">
                  <Image
                    src={getPrimaryImage(product)}
                    alt={product.name}
                    fill
                    className="object-contain rounded-lg"
                  />
                </div>
                <button
                  onClick={() => onRemoveProduct(product._id)}
                  className="absolute top-2 right-2 text-red-500 hover:text-red-700 text-lg font-bold"
                  title="Remove from comparison"
                >
                  ×
                </button>
              </td>
            ))}
          </tr>

          {/* Product Names Row */}
          <tr>
            <td className="p-4 font-medium text-[#5E3A1C] text-left border-b border-gray-200">
              Bag name
            </td>
            {products.map((product) => (
              <td key={product._id} className="p-4 text-center border-b border-gray-200">
                <Link 
                  href={`/products/${product._id}`}
                  className="text-[#5E3A1C] font-medium hover:text-[#EE346C] transition-colors"
                >
                  {product.name}
                </Link>
              </td>
            ))}
          </tr>

          {/* Colors Row */}
          <tr>
            <td className="p-4 font-medium text-[#5E3A1C] text-left border-b border-gray-200">
              Color
            </td>
            {products.map((product) => (
              <td key={product._id} className="p-4 text-center border-b border-gray-200">
                <div className="flex gap-1 justify-center flex-wrap">
                  {product.colors && product.colors.length > 0 ? (
                    product.colors.slice(0, 6).map((color, idx) => (
                      <span
                        key={idx}
                        className="w-6 h-6 rounded-full border-2 border-gray-300"
                        style={{ backgroundColor: color }}
                        title={color}
                      />
                    ))
                  ) : (
                    <span className="text-sm text-gray-500">No colors available</span>
                  )}
                </div>
              </td>
            ))}
          </tr>

          {/* Reviews Row */}
          <tr>
            <td className="p-4 font-medium text-[#5E3A1C] text-left border-b border-gray-200">
              Reviews
            </td>
            {products.map((product) => (
              <td key={product._id} className="p-4 text-center border-b border-gray-200">
                <div className="flex items-center justify-center gap-1 mb-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-4 w-4 ${
                        i < getStarRating(product.averageRating || 0) 
                          ? 'text-[#FFB800] fill-[#FFB800]' 
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-sm text-gray-600">
                  ({product.totalReviews || 0})
                </span>
              </td>
            ))}
          </tr>

          {/* Price Row */}
          <tr>
            <td className="p-4 font-medium text-[#5E3A1C] text-left border-b border-gray-200">
              Price
            </td>
            {products.map((product) => (
              <td key={product._id} className="p-4 text-center border-b border-gray-200">
                <div className="text-lg font-bold text-[#5E3A1C]">
                  {formatPrice(product.price)}
                </div>
                {product.mrp && product.mrp > product.price && (
                  <div className="text-sm text-gray-500 line-through">
                    {formatPrice(product.mrp)}
                  </div>
                )}
              </td>
            ))}
          </tr>

          {/* Shipping Row */}
          <tr>
            <td className="p-4 font-medium text-[#5E3A1C] text-left">
              Shipping
            </td>
            {products.map((product) => (
              <td key={product._id} className="p-4 text-center text-sm text-gray-600">
                Free Delivery on orders over 999
              </td>
            ))}
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default ComparisonTable;
