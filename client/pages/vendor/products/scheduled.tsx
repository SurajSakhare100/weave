import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { toast } from 'react-hot-toast';
import { 
  Calendar, 
  Clock, 
  Search, 
  Plus, 
  Edit, 
  Trash2, 
  ArrowRight,
  Check,
  X,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import VendorLayout from '@/components/Vendor/VendorLayout';
import SchedulingModal from '@/components/Vendor/SchedulingModal';
import { 
  getVendorScheduledProducts, 
  getVendorDraftProducts,
  scheduleVendorProducts, 
  rescheduleVendorProducts, 
  cancelScheduledProducts, 
  publishScheduledProducts
} from '@/services/vendorService';
import { Product } from '@/types';
import { DraftProduct } from '@/types/vendor';

interface ScheduledProduct extends Product {
  scheduledDate: string;
  lastEdited: string;
  primaryImage?: string;
}

interface PaginationData {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export default function VendorScheduledPage() {
  const router = useRouter();
  const { isAuthenticated } = useSelector((state: RootState) => state.vendor);
  const [isInitialized, setIsInitialized] = useState(false);
  const [scheduledProducts, setScheduledProducts] = useState<ScheduledProduct[]>([]);
  const [draftProducts, setDraftProducts] = useState<DraftProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [pagination, setPagination] = useState<PaginationData>({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0
  });

  // Modal states
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [scheduledDate, setScheduledDate] = useState('');
  const [scheduledTime, setScheduledTime] = useState('12:00 PM');
  const [schedulingLoading, setSchedulingLoading] = useState(false);
  const [reschedulingLoading, setReschedulingLoading] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/vendor/login');
      return;
    }
    setIsInitialized(true);
    loadProducts();
  }, [isAuthenticated, router]);

  // Update time remaining every minute for scheduled products
  useEffect(() => {
    const interval = setInterval(() => {
      // Force re-render to update time remaining
      setScheduledProducts(prev => [...prev]);
    }, 60000); // Update every minute

    return () => clearInterval(interval);
  }, []);

  const loadProducts = async (page = 1, search = '') => {
    try {
      setLoading(true);
      
      // Load both scheduled and draft products
      const [scheduledResponse, draftResponse] = await Promise.all([
        getVendorScheduledProducts({
          page,
          limit: pagination.limit,
          search
        }),
        getVendorDraftProducts({
          page: 1,
          limit: 100, // Load all drafts
          search
        })
      ]);
      
      if (scheduledResponse.success) {
        setScheduledProducts(scheduledResponse.data.products);
        setPagination(scheduledResponse.data.pagination);
      }
      
      if (draftResponse.success) {
        setDraftProducts(draftResponse.data);
      }
    } catch (error: any) {
      console.error('Error loading products:', error);
      toast.error(error.response?.data?.message || 'Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const handleProductSelect = (productId: string, checked: boolean) => {
    if (checked) {
      setSelectedProducts(prev => [...prev, productId]);
    } else {
      setSelectedProducts(prev => prev.filter(id => id !== productId));
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const allProductIds = [
        ...scheduledProducts.map(p => p._id),
        ...draftProducts.map(p => p._id)
      ];
      setSelectedProducts(allProductIds);
    } else {
      setSelectedProducts([]);
    }
  };

  const handleSchedule = async (date: string, time: string) => {
    if (selectedProducts.length === 0) {
      toast.error('Please select products to schedule');
      return;
    }

    try {
      setSchedulingLoading(true);
      const response = await scheduleVendorProducts({
        productIds: selectedProducts,
        scheduledDate: date,
        scheduledTime: time
      });
      
      if (response.success) {
        toast.success(response.message || `${selectedProducts.length} products scheduled successfully`);
        setSelectedProducts([]);
        setShowScheduleModal(false);
        setScheduledDate('');
        setScheduledTime('12:00 PM');
        // Reload products and stay on schedule page
        loadProducts(pagination.page, searchQuery);
      } else {
        toast.error(response.message || 'Failed to schedule products');
      }
    } catch (error: any) {
      console.error('Error scheduling products:', error);
      toast.error(error.response?.data?.message || 'Failed to schedule products');
    } finally {
      setSchedulingLoading(false);
    }
  };

  const handleReschedule = async (date: string, time: string) => {
    if (selectedProducts.length === 0) {
      toast.error('Please select products to reschedule');
      return;
    }

    try {
      setReschedulingLoading(true);
      const response = await rescheduleVendorProducts({
        productIds: selectedProducts,
        scheduledDate: date,
        scheduledTime: time
      });
      
      if (response.success) {
        toast.success(response.message || `${selectedProducts.length} products rescheduled successfully`);
        setSelectedProducts([]);
        setShowRescheduleModal(false);
        setScheduledDate('');
        setScheduledTime('12:00 PM');
        // Reload products and stay on schedule page
        loadProducts(pagination.page, searchQuery);
      } else {
        toast.error(response.message || 'Failed to reschedule products');
      }
    } catch (error: any) {
      console.error('Error rescheduling products:', error);
      toast.error(error.response?.data?.message || 'Failed to reschedule products');
    } finally {
      setReschedulingLoading(false);
    }
  };

  const handleCancelSchedule = async () => {
    if (!confirm(`Are you sure you want to cancel scheduling for ${selectedProducts.length} products?`)) {
      return;
    }

    try {
      const response = await cancelScheduledProducts(selectedProducts);
      
      if (response.success) {
        toast.success(response.message || `${selectedProducts.length} scheduled products cancelled successfully`);
        setSelectedProducts([]);
        loadProducts(pagination.page, searchQuery);
      } else {
        toast.error(response.message || 'Failed to cancel scheduled products');
      }
    } catch (error: any) {
      console.error('Error cancelling scheduled products:', error);
      toast.error(error.response?.data?.message || 'Failed to cancel scheduled products');
    }
  };

  const handlePublishNow = async () => {
    try {
      const response = await publishScheduledProducts(selectedProducts);
      
      if (response.success) {
        toast.success(response.message || `${selectedProducts.length} scheduled products published successfully`);
        setSelectedProducts([]);
        loadProducts(pagination.page, searchQuery);
      } else {
        toast.error(response.message || 'Failed to publish scheduled products');
      }
    } catch (error: any) {
      console.error('Error publishing scheduled products:', error);
      toast.error(error.response?.data?.message || 'Failed to publish scheduled products');
    }
  };

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    setPagination(prev => ({ ...prev, page: 1 }));
    loadProducts(1, query);
  };

  const handlePageChange = (page: number) => {
    setPagination(prev => ({ ...prev, page }));
    loadProducts(page, searchQuery);
  };

  const handleEdit = (productId: string) => {
    router.push(`/vendor/products/${productId}`);
  };

  const handleDelete = async (productId: string) => {
    if (!confirm('Are you sure you want to delete this product? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await cancelScheduledProducts([productId]);
      
      if (response.success) {
        toast.success('Product deleted successfully');
        loadProducts(pagination.page, searchQuery);
      } else {
        toast.error(response.message || 'Failed to delete product');
      }
    } catch (error: any) {
      console.error('Error deleting product:', error);
      toast.error(error.response?.data?.message || 'Failed to delete product');
    }
  };

  const openRescheduleModal = () => {
    if (selectedProducts.length === 0) {
      toast.error('Please select products to reschedule');
      return;
    }
    
    // Find the first selected scheduled product to get current schedule
    const selectedScheduledProduct = scheduledProducts.find(p => selectedProducts.includes(p._id));
    if (selectedScheduledProduct) {
      setScheduledDate(selectedScheduledProduct.scheduledPublishDate || '');
      setScheduledTime(selectedScheduledProduct.scheduledPublishTime || '12:00 PM');
    }
    
    setShowRescheduleModal(true);
  };

  const openScheduleModal = () => {
    if (selectedProducts.length === 0) {
      toast.error('Please select products to schedule');
      return;
    }
    setShowScheduleModal(true);
  };



  // Format scheduled date for display
  const formatScheduledDate = (date: string) => {
    if (!date) return '-';
    try {
      // Handle different date formats
      let dateObj: Date;
      if (date.includes('T')) {
        // ISO format
        dateObj = new Date(date);
      } else {
        // YYYY-MM-DD format
        dateObj = new Date(date + 'T00:00:00');
      }
      
      if (isNaN(dateObj.getTime())) {
        return date; // Return original if invalid
      }
      
      return dateObj.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (error) {
      return date;
    }
  };

  // Format scheduled time for display
  const formatScheduledTime = (time: string) => {
    if (!time) return '-';
    try {
      // Handle different time formats
      let timeStr = time.trim();
      
      // If already in 12-hour format (contains AM/PM), return as is
      if (timeStr.includes('AM') || timeStr.includes('PM')) {
        return timeStr;
      }
      
      // Convert 24-hour format to 12-hour format
      const [hours, minutes] = timeStr.split(':');
      const hour = parseInt(hours);
      const minute = parseInt(minutes);
      
      if (isNaN(hour) || isNaN(minute)) {
        return timeStr; // Return original if invalid
      }
      
      const ampm = hour >= 12 ? 'PM' : 'AM';
      const displayHour = hour % 12 || 12;
      const displayMinute = minute.toString().padStart(2, '0');
      
      return `${displayHour}:${displayMinute} ${ampm}`;
    } catch (error) {
      return time;
    }
  };

  // Calculate time remaining until publication (using IST)
  const getTimeRemaining = (date: string, time: string) => {
    if (!date || !time) return null;
    try {
      // Parse the date and time properly
      let scheduledDateTime: Date;
      
      if (date.includes('T')) {
        // ISO format - convert to IST
        const utcDate = new Date(date);
        const istOffset = 5.5 * 60 * 60 * 1000; // IST is UTC+5:30
        scheduledDateTime = new Date(utcDate.getTime() + istOffset);
      } else {
        // YYYY-MM-DD format, need to parse time
        let timeStr = time.trim();
        
        // If time is in 12-hour format, convert to 24-hour
        if (timeStr.includes('AM') || timeStr.includes('PM')) {
          const [timePart, ampm] = timeStr.split(' ');
          const [hours, minutes] = timePart.split(':');
          let hour = parseInt(hours);
          const minute = parseInt(minutes);
          
          if (ampm === 'PM' && hour !== 12) hour += 12;
          if (ampm === 'AM' && hour === 12) hour = 0;
          
          timeStr = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        }
        
        // Create date in IST
        const [year, month, day] = date.split('-').map(Number);
        const [hour, minute] = timeStr.split(':').map(Number);
        scheduledDateTime = new Date(year, month - 1, day, hour, minute, 0);
      }
      
      if (isNaN(scheduledDateTime.getTime())) {
        return null;
      }
      
      // Get current time in IST
      const now = new Date();
      const istOffset = 5.5 * 60 * 60 * 1000; // IST is UTC+5:30
      const istNow = new Date(now.getTime() + istOffset);
      
      const diff = scheduledDateTime.getTime() - istNow.getTime();
      
      if (diff <= 0) return 'Due now';
      
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      
      if (days > 0) return `${days}d ${hours}h`;
      if (hours > 0) return `${hours}h ${minutes}m`;
      return `${minutes}m`;
    } catch (error) {
      return null;
    }
  };

  // Combine scheduled and draft products for display
  const allProducts = [
    ...scheduledProducts.map(p => ({ 
      ...p, 
      type: 'scheduled' as const,
      primaryImage: p.primaryImage || '/products/product.png'
    })),
    ...draftProducts.map(p => ({ 
      ...p, 
      type: 'draft' as const, 
      scheduledDate: '', 
      lastEdited: p.lastEdited || '',
      primaryImage: p.primaryImage || '/products/product.png'
    }))
  ];

  if (!isInitialized) {
    return null;
  }

  if (loading) {
    return (
      <VendorLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#3475A6]"></div>
        </div>
      </VendorLayout>
    );
  }

  return (
    <VendorLayout>
      <div className="p-6 bg-[#f4f8fb] min-h-screen">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-[#357ab8]">Scheduled</h1>
            <p className="text-gray-600 mt-1">Products</p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Search product"
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5A9BD8]"
              />
            </div>
            <button 
              onClick={() => router.push('/vendor/products/add')}
              className="bg-[#5A9BD8] text-white px-4 py-2 rounded-lg flex items-center space-x-2"
            >
              <Plus className="h-4 w-4" />
              <span>Add product</span>
            </button>

          </div>
        </div>

        {/* Products Table */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={selectedProducts.length === allProducts.length && allProducts.length > 0}
                      onChange={(e) => handleSelectAll(e.target.checked)}
                      className="rounded border-gray-300 text-[#5A9BD8] focus:ring-[#5A9BD8]"
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Product
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Price
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Scheduled Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Scheduled Time
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Time Remaining
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Last edited
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {allProducts.map((product) => (
                  <tr key={product._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="checkbox"
                        checked={selectedProducts.includes(product._id)}
                        onChange={(e) => handleProductSelect(product._id, e.target.checked)}
                        className="rounded border-gray-300 text-[#5A9BD8] focus:ring-[#5A9BD8]"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <img
                          src={product.primaryImage || '/products/product.png'}
                          alt={product.name}
                          className="w-10 h-10 rounded-lg object-cover mr-3"
                        />
                        <div>
                          <div className="text-sm font-medium text-gray-900">{product.name}</div>
                          <div className="text-sm text-gray-500">Product Name</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ${product.price}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        product.type === 'scheduled' 
                          ? 'bg-blue-100 text-blue-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {product.type === 'scheduled' ? 'Scheduled' : 'Draft'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {product.type === 'scheduled' ? (
                        <span className="flex items-center space-x-1">
                          <Calendar className="h-3 w-3 text-gray-400" />
                          <span>{formatScheduledDate(product.scheduledPublishDate || '')}</span>
                        </span>
                      ) : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {product.type === 'scheduled' && product.scheduledPublishTime ? (
                        <span className="flex items-center space-x-1">
                          <Clock className="h-3 w-3 text-gray-400" />
                          <span>{formatScheduledTime(product.scheduledPublishTime)}</span>
                        </span>
                      ) : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {product.type === 'scheduled' && product.scheduledPublishDate && product.scheduledPublishTime ? (
                        (() => {
                          const timeRemaining = getTimeRemaining(product.scheduledPublishDate, product.scheduledPublishTime);
                          if (!timeRemaining) return '-';
                          
                          const isDueSoon = timeRemaining === 'Due now' || timeRemaining.includes('m');
                          return (
                            <span className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${
                              isDueSoon 
                                ? 'bg-red-100 text-red-800' 
                                : 'bg-green-100 text-green-800'
                            }`}>
                              {timeRemaining}
                            </span>
                          );
                        })()
                      ) : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {product.lastEdited}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => handleEdit(product._id)}
                          className="text-gray-400 hover:text-gray-600"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(product._id)}
                          className="text-gray-400 hover:text-red-600"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                        <button className="text-gray-400 hover:text-gray-600">
                          <ArrowRight className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Empty State */}
          {allProducts.length === 0 && !loading && (
            <div className="text-center py-12">
              <Calendar className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No products</h3>
              <p className="mt-1 text-sm text-gray-500">
                Get started by creating some products and scheduling them for future publication.
              </p>
              <div className="mt-6">
                <button
                  onClick={() => router.push('/vendor/products/add')}
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-[#5A9BD8] hover:bg-[#4A8BC8]"
                >
                  <Plus className="-ml-1 mr-2 h-4 w-4" />
                  Add Product
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="flex items-center justify-between mt-6">
            <div className="flex items-center space-x-2">
              <button
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={pagination.page === 1}
                className="p-2 border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <span className="text-sm text-gray-700">
                Page {pagination.page} of {pagination.pages}
              </span>
              <button
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={pagination.page === pagination.pages}
                className="p-2 border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {/* Bulk Actions Bar */}
        {selectedProducts.length > 0 && (
          <div className="  border-t border-gray-200 p-4 z-50">
            <div className="max-w-7xl mx-auto flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Check className="h-5 w-5 text-green-600" />
                <span className="text-sm font-medium text-gray-900">
                  {selectedProducts.length} products selected
                </span>
              </div>
              <div className="flex items-center space-x-3">
                <button
                  onClick={openScheduleModal}
                  className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  <Calendar className="h-4 w-4" />
                  <span>Schedule</span>
                </button>
                <button
                  onClick={openRescheduleModal}
                  className="flex items-center space-x-2 px-4 py-2 bg-vendor-secondary border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  <Calendar className="h-4 w-4" />
                  <span>Reschedule</span>
                </button>
                <button
                  onClick={handlePublishNow}
                  className="flex items-center space-x-2 px-4 py-2 bg-[#5A9BD8] text-white rounded-md text-sm font-medium hover:bg-[#4A8BC8]"
                >
                  <Check className="h-4 w-4" />
                  <span>Publish Now</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Schedule Modal */}
        <SchedulingModal
          isOpen={showScheduleModal}
          onClose={() => setShowScheduleModal(false)}
          onSubmit={handleSchedule}
          title="Schedule Products"
          description="Please select a future date and time when you'd like your products to be published."
          submitText="Schedule"
          loading={schedulingLoading}
        />

        {/* Reschedule Modal */}
        <SchedulingModal
          isOpen={showRescheduleModal}
          onClose={() => setShowRescheduleModal(false)}
          onSubmit={handleReschedule}
          title="Reschedule Products"
          description="Please select a new future date and time when you'd like your products to be published."
          submitText="Reschedule"
          initialDate={scheduledDate}
          initialTime={scheduledTime}
          loading={reschedulingLoading}
        />
      </div>
    </VendorLayout>
  );
} 