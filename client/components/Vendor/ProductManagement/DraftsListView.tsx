import React from 'react';
import { MoreVertical, Edit, Trash2, ArrowRight } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { DraftProduct } from '@/types/vendor';
import { useRouter } from 'next/router';

interface DraftsListViewProps {
  products: DraftProduct[];
  selectedProducts: string[];
  onProductSelect: (productId: string, checked: boolean) => void;
  onSelectAll: (checked: boolean) => void;
  showContextMenu: string | null;
  setShowContextMenu: (productId: string | null) => void;
}

export default function DraftsListView({
  products,
  selectedProducts,
  onProductSelect,
  onSelectAll,
  showContextMenu,
  setShowContextMenu
}: DraftsListViewProps) {
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
            <th className="text-left p-4 font-medium text-gray-900">Product</th>
            <th className="text-left p-4 font-medium text-gray-900">Price</th>
            <th className="text-left p-4 font-medium text-gray-900">Last edited</th>
            <th className="text-left p-4"></th>
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
                    className="w-12 h-12 object-cover rounded"
                  />
                  <div>
                    <div className="font-medium text-gray-900">{product.name}</div>
                    <div className="text-sm text-gray-500">Product Name</div>
                  </div>
                </div>
              </td>
              <td className="p-4">
                <span className={`font-medium ${selectedProducts.includes(product._id) ? 'text-[#3475A6]' : 'text-gray-900'}`}>
                  ${product.price}
                </span>
              </td>
              <td className="p-4 text-sm text-gray-500">
                {product.lastEdited || '3D Product'}
              </td>
              <td className="p-4">
                <div className="flex items-center space-x-2">
                  <button 
                    onClick={() => handleEdit(product._id)}
                    className="p-1 hover:bg-gray-100 rounded"
                    title="Edit product"
                  >
                    <Edit className="h-4 w-4 text-gray-500" />
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
      
      {/* Pagination */}
      <div className="flex items-center justify-center p-4">
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