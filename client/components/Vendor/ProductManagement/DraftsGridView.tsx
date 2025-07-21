import React from 'react';
import { Edit, Trash2, ArrowRight } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { DraftProduct } from '@/types/vendor';
import { useRouter } from 'next/router';

interface DraftsGridViewProps {
  products: DraftProduct[];
  selectedProducts: string[];
  onProductSelect: (productId: string, checked: boolean) => void;
  showContextMenu: string | null;
  setShowContextMenu: (productId: string | null) => void;
}

export default function DraftsGridView({
  products,
  selectedProducts,
  onProductSelect,
  showContextMenu,
  setShowContextMenu
}: DraftsGridViewProps) {
  const router = useRouter();

  const handleEdit = (productId: string) => {
    router.push(`/vendor/products/${productId}`);
  };

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((product) => (
          <div key={product._id} className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow relative group">
            <div className="relative">
              <img
                src={product.files[0] || '/products/product.png'}
                alt={product.name}
                className="w-full h-48 object-cover"
              />
              <div className="absolute top-3 left-3">
                <Checkbox
                  checked={selectedProducts.includes(product._id)}
                  onCheckedChange={(checked) => onProductSelect(product._id, checked)}
                  className="bg-white"
                />
              </div>
              
              {/* Hover overlay with action buttons */}
              <div className="absolute inset-0  bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200 flex items-center justify-center opacity-0 group-hover:opacity-100">
                <div className="flex bg-white rounded-lg p-1 shadow-sm items-center space-x-2">
                  <button 
                    onClick={() => handleEdit(product._id)}
                    className="p-2 hover:bg-gray-50"
                    title="Edit product"
                  >
                    <Edit className="h-4 w-4 text-gray-600" />
                  </button>
                  <button className="p-2 hover:bg-gray-50">
                    <Trash2 className="h-4 w-4 text-gray-600" />
                  </button>
                  <button className="p-2 hover:bg-gray-50">
                    <ArrowRight className="h-4 w-4 text-gray-600" />
                  </button>
                </div>
              </div>
            </div>
            
            <div className="p-4">
              <div className="flex items-center justify-between">
                <h3 className="font-medium text-gray-900">{product.name}</h3>
                <span className="font-bold text-[#3475A6]">${product.price}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {/* Pagination */}
      <div className="flex items-center justify-center mt-6">
        <div className="flex items-center space-x-2">
          <button className="p-2 hover:bg-gray-100 rounded">
            <ArrowRight className="h-4 w-4 rotate-180 text-gray-500" />
          </button>
          <button className="p-2 hover:bg-gray-100 rounded">
            <ArrowRight className="h-4 w-4 text-gray-500" />
          </button>
        </div>
      </div>
    </div>
  );
} 