import React from 'react';
import { MoreVertical, Star, Edit, Trash2 } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { ReleasedProduct } from '@/types/vendor';
import { useRouter } from 'next/router';

interface ProductGridViewProps {
  products: ReleasedProduct[];
  selectedProducts: string[];
  onProductSelect: (productId: string, checked: boolean) => void;
  showContextMenu: string | null;
  setShowContextMenu: (productId: string | null) => void;
}

export default function ProductGridView({
  products,
  selectedProducts,
  onProductSelect,
  showContextMenu,
  setShowContextMenu
}: ProductGridViewProps) {
  const router = useRouter();

  const handleEdit = (productId: string) => {
    router.push(`/vendor/products/${productId}`);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {products.map((product) => (
        <div key={product._id} className="  rounded-lg overflow-hidden hover:shadow-md transition-shadow">
          {/* Product Image with Checkbox */}
          <div className="relative">
            <img
              src={product.primaryImage || '/products/product.png'}
              alt={product.name}
              className="w-full h-48 object-cover"
            />
            {/* Checkbox in top-left */}
            <div className="absolute top-3 left-3">
              <Checkbox
                checked={selectedProducts.includes(product._id)}
                onCheckedChange={(checked) => onProductSelect(product._id, checked)}
                className="bg-white border-2 border-white shadow-sm"
              />
            </div>
            {/* Context Menu in top-right */}
            <div className="absolute top-3 right-3">
              <div className="relative">
                <button
                  onClick={() => setShowContextMenu(showContextMenu === product._id ? null : product._id)}
                  className="p-2 bg-white rounded-full shadow-sm hover:bg-gray-50"
                >
                  <MoreVertical className="h-4 w-4 text-[#3475A6]" />
                </button>
                
                {showContextMenu === product._id && (
                  <div className="absolute right-0 top-full mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                    <button 
                      onClick={() => handleEdit(product._id)}
                      className="w-full text-left px-4 py-2 text-sm text-[#3475A6] hover:bg-gray-50 flex items-center"
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </button>
                    <button className="w-full text-left px-4 py-2 text-sm text-[#3475A6] hover:bg-gray-50">
                      View Details
                    </button>
                    <button className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-50 flex items-center">
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Product Info */}
          <div className="p-4 flex items-start justify-between  ">
            {/* Product Name */}
            <div className="">
            <h3 className="font-medium text-[#3475A6] mb-2 line-clamp-2 text-sm">
              {product.name}
            </h3>
            
            {/* Rating */}
            <div className="flex items-center mb-3">
              <Star className="h-4 w-4 text-yellow-400 fill-current mr-1" />
              <span className="text-[#3475A6] text-sm">
                {product.rating} ({product.reviewCount})
              </span>
            </div>
            </div>
            
            {/* Price as Pill Button */}
            <div className="flex justify-end">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium text-white bg-[#3475A6]">
                ${product.price}
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
} 