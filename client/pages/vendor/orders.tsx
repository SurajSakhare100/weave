import VendorLayout from '@/components/VendorLayout';
import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/router';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../store/store';
import { setOrders, setLoading, setError, updateOrder, clearError } from '../../features/vendor/vendorSlice';
import { getVendorOrders, updateOrderStatus } from '../../services/vendorService';
import { isVendorAuthenticated } from '../../utils/vendorAuth';
import { 
  ShoppingCart, 
  Search, 
  Filter, 
  Eye, 
  AlertCircle,
  Clock,
  CheckCircle,
  Truck,
  XCircle,
  Calendar,
  User,
  Package
} from 'lucide-react';
import Image from 'next/image';

interface Order {
  _id: string;
  orderId?: string;
  createdAt: string;
  status: string;
  totalPrice: number;
  totalAmount?: number;
  customer?: {
    name: string;
    email: string;
  };
  user?: {
    name: string;
    email: string;
  };
  customerName?: string;
  orderItems?: Array<{
    product: {
      name: string;
      files?: string[];
    };
    quantity: number;
    price: number;
  }>;
  items?: Array<{
    product: {
      name: string;
      files?: string[];
    };
    quantity: number;
    price: number;
  }>;
}

export default function VendorOrdersPage() {
  const router = useRouter();
  const dispatch = useDispatch();
  const { orders, loading, error } = useSelector((state: RootState) => state.vendor);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'>('all');

  const loadOrders = useCallback(async (page = 1) => {
    try {
      dispatch(setLoading(true));
      dispatch(clearError());
      
      const params = {
        page,
        limit: 20,
        search: searchTerm || undefined,
        status: statusFilter !== 'all' ? statusFilter : undefined
      };
      
      const data = await getVendorOrders(params);
      console.log(data)
      dispatch(setOrders(data));
    } catch (error: unknown) {
      console.error('Error loading orders:', error);
      const err = error as { response?: { data?: { message?: string } } };
      const errorMessage = err.response?.data?.message || 'Failed to load orders. Please try again.';
      dispatch(setError(errorMessage));
    } finally {
      dispatch(setLoading(false));
    }
  }, [dispatch, searchTerm, statusFilter]);

  useEffect(() => {
    // Check authentication and load orders only if authenticated
    if (!isVendorAuthenticated()) {
      router.push('/vendor/login');
      return;
    }
    loadOrders();
  }, [router, loadOrders]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    loadOrders(1);
  };

  const handleStatusUpdate = async (orderId: string, newStatus: string) => {
    try {
      dispatch(setLoading(true));
      await updateOrderStatus(orderId, newStatus);
      dispatch(updateOrder({ id: orderId, data: { status: newStatus } }));
      dispatch(clearError());
    } catch (error: unknown) {
      console.error('Error updating order status:', error);
      const err = error as { response?: { data?: { message?: string } } };
      const errorMessage = err.response?.data?.message || 'Failed to update order status. Please try again.';
      dispatch(setError(errorMessage));
    } finally {
      dispatch(setLoading(false));
    }
  };

  const handleStatusFilter = (status: 'all' | 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled') => {
    setStatusFilter(status);
    loadOrders(1);
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'shipped':
        return 'bg-purple-100 text-purple-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'pending':
        return <Clock className="h-4 w-4" />;
      case 'processing':
        return <Package className="h-4 w-4" />;
      case 'shipped':
        return <Truck className="h-4 w-4" />;
      case 'delivered':
        return <CheckCircle className="h-4 w-4" />;
      case 'cancelled':
        return <XCircle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const filteredOrders = (orders.items || []).filter((order: Order) => {
    if (statusFilter === 'all') return true;
    return order.status?.toLowerCase() === statusFilter;
  });

  return (
    <VendorLayout>
      <section className="py-16 bg-[#faf5f2] text-black min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">My Orders</h1>
            <p className="text-gray-600">Manage and track your customer orders</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center">
              <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
              <span className="text-red-700 text-sm">{error}</span>
              <button 
                onClick={() => dispatch(clearError())}
                className="ml-auto text-red-500 hover:text-red-700"
              >
                <XCircle className="h-4 w-4" />
              </button>
            </div>
          )}

          {/* Filters and Search */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 mb-8">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
              {/* Search */}
              <form onSubmit={handleSearch} className="flex-1 max-w-md">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search orders..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                  />
                </div>
              </form>

              {/* Status Filter */}
              <div className="flex items-center space-x-2">
                <Filter className="h-5 w-5 text-gray-400" />
                <select
                  value={statusFilter}
                  onChange={(e) => handleStatusFilter(e.target.value as 'all' | 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled')}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                >
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="processing">Processing</option>
                  <option value="shipped">Shipped</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            </div>
          </div>

          {/* Orders */}
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500"></div>
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="text-center py-20">
              <ShoppingCart className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No orders found</h3>
              <p className="text-gray-500">
                {searchTerm || statusFilter !== 'all' 
                  ? 'Try adjusting your search or filters'
                  : 'Orders will appear here once customers start purchasing your products'
                }
              </p>
            </div>
          ) : (
            <>
              {/* Orders List */}
              <div className="space-y-4">
                {filteredOrders.map((order: Order) => (
                  <div key={order._id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
                      {/* Order Info */}
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center space-x-3">
                            <h3 className="text-lg font-semibold text-gray-800">
                              Order #{order._id?.slice(-8)?.toUpperCase() || order.orderId || 'N/A'}
                            </h3>
                            <span className={`px-3 py-1 text-sm rounded-full flex items-center space-x-1 ${getStatusColor(order.status)}`}>
                              {getStatusIcon(order.status)}
                              <span className="capitalize">{order.status || 'Pending'}</span>
                            </span>
                          </div>
                          <div className="text-right">
                            <p className="text-lg font-bold text-gray-900">₹{order.totalPrice || order.totalAmount || 0}</p>
                            <p className="text-sm text-gray-500">
                              {order.orderItems?.length || order.items?.length || 0} items
                            </p>
                          </div>
                        </div>

                        {/* Customer Info */}
                        <div className="flex items-center space-x-4 mb-3 text-sm text-gray-600">
                          <div className="flex items-center">
                            <User className="h-4 w-4 mr-1" />
                            <span>{order.user?.name || order.customerName || 'Customer'}</span>
                          </div>
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 mr-1" />
                            <span>{new Date(order.createdAt).toLocaleDateString()}</span>
                          </div>
                        </div>

                        {/* Order Items */}
                        <div className="space-y-2">
                          {(order.orderItems || order.items || []).slice(0, 3).map((item: NonNullable<Order['orderItems']>[0], index: number) => (
                            <div key={index} className="flex items-center space-x-3 text-sm">
                              <Image
                                src={item.product?.files?.[0] || '/products/product.png'}
                                alt={item.product?.name || 'Product'}
                                width={32}
                                height={32}
                                className="rounded object-cover"
                              />
                              <span className="flex-1">{item.product?.name || 'Product'}</span>
                              <span className="text-gray-500">Qty: {item.quantity}</span>
                              <span className="font-medium">₹{item.price}</span>
                            </div>
                          ))}
                          {(order.orderItems || order.items || []).length > 3 && (
                            <p className="text-sm text-gray-500">
                              +{(order.orderItems || order.items || []).length - 3} more items
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex flex-col space-y-2 lg:ml-6">
                        <button
                          onClick={() => router.push(`/vendor/orders/${order._id}`)}
                          className="flex items-center justify-center px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </button>

                        {/* Status Update */}
                        {order.status !== 'delivered' && order.status !== 'cancelled' && (
                          <select
                            value={order.status || 'pending'}
                            onChange={(e) => handleStatusUpdate(order._id, e.target.value)}
                            className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                          >
                            <option value="pending">Mark as Pending</option>
                            <option value="processing">Mark as Processing</option>
                            <option value="shipped">Mark as Shipped</option>
                            <option value="delivered">Mark as Delivered</option>
                            <option value="cancelled">Mark as Cancelled</option>
                          </select>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {orders.pages > 1 && (
                <div className="mt-8 flex items-center justify-center">
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => loadOrders(orders.page - 1)}
                      disabled={orders.page === 1}
                      className="px-3 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                    >
                      Previous
                    </button>
                    
                    <span className="px-3 py-2 text-sm text-gray-600">
                      Page {orders.page} of {orders.pages}
                    </span>
                    
                    <button
                      onClick={() => loadOrders(orders.page + 1)}
                      disabled={orders.page === orders.pages}
                      className="px-3 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </section>
    </VendorLayout>
  );
} 