import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import VendorLayout from '@/components/Vendor/VendorLayout';
import DraftsListView from '@/components/Vendor/ProductManagement/DraftsListView';
import DraftsGridView from '@/components/Vendor/ProductManagement/DraftsGridView';
import DraftsActionBar from '@/components/Vendor/ProductManagement/DraftsActionBar';
import ProductHeader from '@/components/Vendor/ProductManagement/ProductHeader';
import { getVendorDraftProducts, publishVendorProducts, deleteVendorProducts } from '@/services/vendorService';
import { DraftProduct } from '@/types/vendor';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';

export default function VendorDraftsPage() {
  const router = useRouter();
  const [products, setProducts] = useState<DraftProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showContextMenu, setShowContextMenu] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0
  });

  const loadProducts = async (page = 1, search = '') => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await getVendorDraftProducts({
        page,
        limit: pagination.limit,
        search
      });

      if (response.success) {
        setProducts(response.data);
        setPagination(response.pagination);
      } else {
        setError(response.message || 'Failed to load products');
        toast.error(response.message || 'Failed to load products');
      }
    } catch (error: any) {
      console.error('Error loading products:', error);
      if (error.response?.status === 404) {
        router.push('/vendor/404');
        return;
      }
      setError(error.response?.data?.message || 'Failed to load products');
      toast.error(error.response?.data?.message || 'Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  useEffect(() => {
    // Debounce search
    const timeoutId = setTimeout(() => {
      if (searchQuery !== '') {
        loadProducts(1, searchQuery);
      } else {
        loadProducts(1, '');
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  const handleProductSelect = (productId: string, checked: boolean) => {
    if (checked) {
      setSelectedProducts([...selectedProducts, productId]);
    } else {
      setSelectedProducts(selectedProducts.filter(id => id !== productId));
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedProducts(products.map(p => p._id));
    } else {
      setSelectedProducts([]);
    }
  };

  const handlePublish = async () => {
    try {
      const response = await publishVendorProducts(selectedProducts);
      
      if (response.success) {
        toast.success(response.message || `${selectedProducts.length} products published successfully`);
        setSelectedProducts([]);
        // Reload products after publishing
        loadProducts(pagination.page, searchQuery);
      } else {
        toast.error(response.message || 'Failed to publish products');
      }
    } catch (error: any) {
      console.error('Error publishing products:', error);
      toast.error(error.response?.data?.message || 'Failed to publish products');
    }
  };

  const handleDelete = async () => {
    if (!confirm(`Are you sure you want to delete ${selectedProducts.length} products? This action cannot be undone.`)) {
      return;
    }

    try {
      const response = await deleteVendorProducts(selectedProducts);
      
      if (response.success) {
        toast.success(response.message || `${selectedProducts.length} products deleted successfully`);
        setSelectedProducts([]);
        // Reload products after deletion
        loadProducts(pagination.page, searchQuery);
      } else {
        toast.error(response.message || 'Failed to delete products');
      }
    } catch (error: any) {
      console.error('Error deleting products:', error);
      toast.error(error.response?.data?.message || 'Failed to delete products');
    }
  };

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
  };

  if (loading ) {
    return (
      <VendorLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#3475A6]"></div>
        </div>
      </VendorLayout>
    );
  }

  if (error && products.length === 0) {
    return (  
      <VendorLayout>
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-[#3475A6]">Drafts</h1>
          </div>
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="text-center">
              <p className="text-red-600 mb-4">{error}</p>
              <Button 
                variant="vendorPrimary"
                onClick={() => loadProducts()}
              >
                Try Again
              </Button>
            </div>
          </div>
        </div>
      </VendorLayout>
    );
  }

  return (
    <VendorLayout>
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-[#3475A6]">Drafts</h1>
        </div>

        {/* Products Section */}
        <div className="bg-white rounded-lg shadow-sm border">
          <ProductHeader
            searchQuery={searchQuery}
            onSearchChange={handleSearchChange}
            viewMode={viewMode}
            onViewModeChange={setViewMode}
          />

          {/* Products Display */}
          <div className="p-6">
            {loading ? (
              <div className="flex items-center justify-center h-32">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#3475A6]"></div>
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg">You don&apos;t have any draft products.</p>
                <p className="text-gray-400 mt-2">Create a new product to get started.</p>
              </div>
            ) : (
              <>
                {viewMode === 'list' ? (
                  <DraftsListView
                    products={products}
                    selectedProducts={selectedProducts}
                    onProductSelect={handleProductSelect}
                    onSelectAll={handleSelectAll}
                    showContextMenu={showContextMenu}
                    setShowContextMenu={setShowContextMenu}
                  />
                ) : (
                  <DraftsGridView
                    products={products}
                    selectedProducts={selectedProducts}
                    onProductSelect={handleProductSelect}
                    showContextMenu={showContextMenu}
                    setShowContextMenu={setShowContextMenu}
                  />
                )}
              </>
            )}
          </div>

          {/* Action Bar */}
          <DraftsActionBar
            selectedCount={selectedProducts.length}
            onDelete={handleDelete}
            onPublish={handlePublish}
          />
        </div>
      </div>
    </VendorLayout>
  );
} 