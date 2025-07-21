import React from 'react';
import { Star, TrendingUp, Eye, MessageCircle, Edit, Trash2, ArrowRight } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';  
import { ReleasedProduct } from '@/types/vendor';
import { useRouter } from 'next/router';

interface ProductListViewProps {
  products: ReleasedProduct[];
  selectedProducts: string[];
  onProductSelect: (productId: string, checked: boolean) => void;
  onSelectAll: (checked: boolean) => void;
  showContextMenu: string | null;
  setShowContextMenu: (productId: string | null) => void;
}

export default function ProductListView({
  products,
  selectedProducts,
  onProductSelect,
  onSelectAll,
  showContextMenu,
  setShowContextMenu
}: ProductListViewProps) {
  const router = useRouter();
  const allSelected = products.length > 0 && selectedProducts.length === products.length;
  const someSelected = selectedProducts.length > 0 && selectedProducts.length < products.length;

  const handleEdit = (productId: string) => {
    router.push(`/vendor/products/${productId}`);
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b">
            <th className="text-left p-4">
              <Checkbox
                checked={allSelected}
                ref={(el) => {
                  if (el) el.indeterminate = someSelected;
                }}
                onCheckedChange={onSelectAll}
              />
            </th>
            <th className="text-left p-4 font-medium text-[#3475A6]">Product</th>
            <th className="text-left p-4 font-medium text-[#3475A6]">Sales</th>
            <th className="text-left p-4 font-medium text-[#3475A6]">Views</th>
            <th className="text-left p-4 font-medium text-[#3475A6]">Rating</th>
            <th className="text-left p-4 font-medium text-[#3475A6]">Status</th>
            <th className="text-left p-4 font-medium text-[#3475A6]">Actions</th>
          </tr>
        </thead>
        <tbody>
          {products.map((product) => (
            <tr key={product._id} className="border-b hover:bg-gray-50">
              <td className="p-4">
                <Checkbox
                  checked={selectedProducts.includes(product._id)}
                  onCheckedChange={(checked) => onProductSelect(product._id, checked)}
                />
              </td>
              <td className="p-4">
                <div className="flex items-center space-x-3">
                  <img
                    src={product.files[0] || '/products/product.png'}
                    alt={product.name}
                    className="w-12 h-12 object-cover rounded-lg"
                  />
                  <div>
                    <h3 className="font-medium text-[#3475A6]">{product.name}</h3>
                    <p className="text-sm text-gray-500">${product.price}</p>
                  </div>
                </div>
              </td>
              <td className="p-4">
                <div className="flex items-center space-x-2">
                  <span className="font-medium text-[#3475A6]">{product.sales}</span>
                  <div className="flex items-center text-green-600 text-sm">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    +{product.salesGrowth}%
                  </div>
                </div>
              </td>
              <td className="p-4">
                <div className="flex items-center space-x-1">
                  <Eye className="h-4 w-4 text-gray-400" />
                  <span className="text-[#3475A6]">{product.views}</span>
                </div>
              </td>
              <td className="p-4">
                <div className="flex items-center space-x-2">
                  <div className="flex items-center">
                    <Star className="h-4 w-4 text-yellow-400 fill-current" />
                    <span className="ml-1 text-[#3475A6]">{product.rating}</span>
                  </div>
                  <div className="flex items-center text-gray-500">
                    <MessageCircle className="h-3 w-3 mr-1" />
                    <span className="text-sm">{product.reviewCount}</span>
                  </div>
                </div>
              </td>
              <td className="p-4">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  {product.status}
                </span>
              </td>
              <td className="p-4">
                <div className="flex items-center space-x-2">
                  <button 
                    onClick={() => handleEdit(product._id)}
                    className="p-1 hover:bg-gray-100 rounded"
                    title="Edit product"
                  >
                    <Edit className="h-4 w-4 text-[#3475A6]" />
                  </button>
                  <button className="p-1 hover:bg-gray-100 rounded">
                    <Trash2 className="h-4 w-4 text-gray-500" />
                  </button>
                  <button className="p-1 hover:bg-gray-100 rounded">
                    <ArrowRight className="h-4 w-4 text-gray-500" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
} 