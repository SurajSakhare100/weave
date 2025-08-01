import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { 
  Package, 
  CheckCircle, 
  XCircle, 
  Eye, 
  User,
  Calendar,
  AlertCircle,
  DollarSign,
  Tag
} from 'lucide-react';
import { Button } from '../../ui/button';
import { toast } from 'sonner';
import { getPendingProducts, approveProduct, rejectProduct } from '../../../services/adminApi';
import Image from 'next/image';

function PendingProducts({ loaded, setLoaded }) {
  const router = useRouter();
  const [products, setProducts] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [rejectModal, setRejectModal] = useState({ show: false, product: null, reason: '' });

  useEffect(() => {
    fetchPendingProducts();
  }, []);

  const fetchPendingProducts = async () => {
    setLoading(true);
    try {
      const response = await getPendingProducts({ skip: 0, limit: 50 });
      if (response.success) {
        setProducts(response.products);
        setTotal(response.total);
      }
    } catch (error) {
      console.error('Error fetching pending products:', error);
      toast.error('Failed to load pending products');
    } finally {
      setLoading(false);
      setLoaded(true);
    }
  };

  const handleApproveProduct = async (product) => {
    try {
      const response = await approveProduct(product._id);
      if (response.success) {
        toast.success('Product approved successfully');
        fetchPendingProducts(); // Refresh the list
      }
    } catch (error) {
      console.error('Error approving product:', error);
      toast.error('Failed to approve product');
    }
  };

  const handleRejectProduct = async () => {
    if (!rejectModal.reason.trim()) {
      toast.error('Please provide a rejection reason');
      return;
    }

    try {
      const response = await rejectProduct(rejectModal.product._id, rejectModal.reason);
      if (response.success) {
        toast.success('Product rejected successfully');
        setRejectModal({ show: false, product: null, reason: '' });
        fetchPendingProducts(); // Refresh the list
      }
    } catch (error) {
      console.error('Error rejecting product:', error);
      toast.error('Failed to reject product');
    }
  };

  const openRejectModal = (product) => {
    setRejectModal({ show: true, product, reason: '' });
  };

  const closeRejectModal = () => {
    setRejectModal({ show: false, product: null, reason: '' });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  if (!loaded) {
    return (
      <div className="min-h-screen admin-bg-secondary flex items-center justify-center">
        <div className="flex items-center space-x-3">
          <div className="admin-spinner h-6 w-6"></div>
          <span className="admin-text-secondary">Loading pending products...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen admin-bg-secondary">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-4">
            <Package className="h-8 w-8 text-[#5A9BD8]" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Pending Product Approvals</h1>
              <p className="text-gray-600">Review and approve new product submissions</p>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center">
                <div className="p-3 bg-orange-100 rounded-lg">
                  <AlertCircle className="h-6 w-6 text-orange-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Pending Approvals</p>
                  <p className="text-2xl font-bold text-gray-900">{total}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Products Grid */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Product Submissions</h3>
          </div>

          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#5A9BD8] mx-auto"></div>
              <p className="mt-2 text-gray-600">Loading products...</p>
            </div>
          ) : products.length === 0 ? (
            <div className="p-8 text-center">
              <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No pending products</h3>
              <p className="text-gray-600">All product submissions have been processed.</p>
            </div>
          ) : (
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map((product) => (
                  <div key={product._id} className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                    {/* Product Image */}
                    <div className="aspect-square bg-gray-100 relative">
                      {product.files && product.files.length > 0 ? (
                        <Image
                          src={product.files[0].url}
                          alt={product.name}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full">
                          <Package className="h-12 w-12 text-gray-400" />
                        </div>
                      )}
                    </div>

                    {/* Product Details */}
                    <div className="p-4">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                        {product.name}
                      </h3>
                      
                      <div className="space-y-2 mb-4">
                        <div className="flex items-center text-sm text-gray-600">
                          <User size={14} className="mr-2 text-gray-400" />
                          <span className="font-medium">{product.vendorId?.businessName || product.vendorId?.name}</span>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center text-sm text-gray-600">
                            <Tag size={14} className="mr-2 text-gray-400" />
                            {product.category}
                          </div>
                          <div className="flex items-center text-sm text-gray-600">
                            <Calendar size={14} className="mr-2 text-gray-400" />
                            {new Date(product.createdAt).toLocaleDateString()}
                          </div>
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center text-sm text-gray-600">
                            <DollarSign size={14} className="mr-2 text-gray-400" />
                            {formatCurrency(product.price)}
                          </div>
                          {product.mrp > product.price && (
                            <div className="text-sm text-gray-500 line-through">
                              {formatCurrency(product.mrp)}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex space-x-2">
                        <Button
                          onClick={() => handleApproveProduct(product)}
                          className="flex-1 bg-green-600 hover:bg-green-700 text-white text-sm"
                        >
                          <CheckCircle size={14} className="mr-1" />
                          Approve
                        </Button>
                        <Button
                          onClick={() => openRejectModal(product)}
                          className="flex-1 bg-red-600 hover:bg-red-700 text-white text-sm"
                        >
                          <XCircle size={14} className="mr-1" />
                          Reject
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Reject Modal */}
      {rejectModal.show && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Reject Product Submission</h3>
              <p className="text-sm text-gray-600 mb-4">
                Are you sure you want to reject <strong>{rejectModal.product?.name}</strong>?
              </p>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Rejection Reason *
                </label>
                <textarea
                  value={rejectModal.reason}
                  onChange={(e) => setRejectModal({ ...rejectModal, reason: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#5A9BD8]"
                  rows={3}
                  placeholder="Please provide a reason for rejection..."
                  required
                />
              </div>
              <div className="flex justify-end space-x-3">
                <Button
                  onClick={closeRejectModal}
                  className="bg-gray-300 hover:bg-gray-400 text-gray-700"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleRejectProduct}
                  className="bg-red-600 hover:bg-red-700 text-white"
                >
                  Reject
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default PendingProducts; 