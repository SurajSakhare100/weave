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
import Link from 'next/link';

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

  if (loading) {
    return (
      <VendorLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#3475A6]"></div>
        </div>
      </VendorLayout>
    );
  }
  if (products.length === 0) {
    return (
      <VendorLayout>
        <div className="flex items-center justify-center h-64 flex-col gap-4">
          <h1 className="text-2xl font-bold text-[#3475A6]">no drafts found</h1>
          <Link href="/vendor/products" className="text-blue-500 hover:text-blue-700">Go to products</Link>
        </div>
      </VendorLayout>
    );
  }

  return (
    <VendorLayout>
      <div className="p-6 bg-[#f4f8fb] min-h-screen">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-[#3475A6]">Drafts</h1>
        </div>
        <ProductHeader
          // title="Drafts"
          // subtitle="Products"
          searchQuery={searchQuery}
          onSearchChange={handleSearchChange}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
        />

        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
            <p className="text-red-800">{error}</p>
          </div>
        )}

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

        <DraftsActionBar
          selectedCount={selectedProducts.length}
          onPublish={handlePublish}
          onDelete={handleDelete}
        />
      </div>
    </VendorLayout>
  );
} 