import VendorLayout from '@/components/Vendor/VendorLayout';
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
  Package,
  ArrowLeft,
  ArrowRight,
  Grid,
  List
} from 'lucide-react';
import Image from 'next/image';

// --- OrderCard Component ---
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
    firstName: string;
    lastName: string;
    email: string;
    number?: string;
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

type OrderCardProps = {
  order: Order;
  onView: (id: string) => void;
  onStatusUpdate: (id: string, status: string) => void;
  getStatusColor: (status: string) => string;
  getStatusIcon: (status: string) => React.ReactNode;
  getCustomerName: (order: Order) => string;
};

const OrderCard: React.FC<OrderCardProps> = ({
  order,
  onView,
  onStatusUpdate,
  getStatusColor,
  getStatusIcon,
  getCustomerName
}) => {
  const items = order.orderItems || order.items || [];
  return (
    <div className="rounded-xl border border-gray-200 bg-white shadow-sm hover:shadow-md transition-shadow duration-150">
      <div className="p-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        {/* Left: Order Info */}
        <div className="flex-1 min-w-0">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-2">
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-400">Order</span>
              <span className="font-semibold text-base text-gray-900 tracking-wide">
                #{order._id?.slice(-8)?.toUpperCase() || order.orderId || 'N/A'}
              </span>
              <span className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                {getStatusIcon(order.status)}
                <span className="capitalize">{order.status || 'Pending'}</span>
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <Calendar className="h-4 w-4" />
              {new Date(order.createdAt).toLocaleDateString()}
            </div>
          </div>
          <div className="flex items-center gap-4 mb-3">
            <div className="flex items-center gap-1 text-sm text-gray-700">
              <User className="h-4 w-4" />
              <span>{getCustomerName(order)}</span>
            </div>
            <div className="text-xs text-gray-400 hidden sm:block">|</div>
            <div className="text-sm text-gray-500">
              {items.length} item{items.length !== 1 ? 's' : ''}
            </div>
          </div>
          {/* Order Items Preview */}
          <div className="flex flex-wrap gap-3 mb-2">
            {items.slice(0, 3).map((item, idx) => (
              <div key={idx} className="flex items-center gap-2 bg-gray-50 rounded px-2 py-1">
                <Image
                  src={item.product?.files?.[0] || '/products/product.png'}
                  alt={item.product?.name || 'Product'}
                  width={28}
                  height={28}
                  className="rounded object-cover border border-gray-200"
                />
                <span className="text-xs text-gray-800 truncate max-w-[100px]">{item.product?.name || 'Product'}</span>
                <span className="text-xs text-gray-500">x{item.quantity}</span>
                <span className="text-xs font-medium text-gray-900">₹{item.price}</span>
              </div>
            ))}
            {items.length > 3 && (
              <span className="text-xs text-gray-400 self-center">+{items.length - 3} more</span>
            )}
          </div>
        </div>
        {/* Right: Actions & Total */}
        <div className="flex flex-col items-end gap-3 min-w-[160px]">
          <div className="text-right">
            <div className="text-lg font-bold text-gray-900">₹{order.totalPrice || order.totalAmount || 0}</div>
            <div className="text-xs text-gray-500">Total</div>
          </div>
          <div className="flex flex-col gap-2 w-full">
            <button
              onClick={() => onView(order._id)}
              className="inline-flex items-center justify-center gap-1 px-3 py-1.5 rounded-md border border-gray-200 text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition"
            >
              <Eye className="h-4 w-4" />
              View Details
            </button>
            {order.status !== 'delivered' && order.status !== 'cancelled' && (
              <select
                value={order.status || 'pending'}
                onChange={(e) => onStatusUpdate(order._id, e.target.value)}
                className="w-full px-2 py-1.5 rounded-md border border-gray-200 text-xs text-gray-700 bg-gray-50 focus:outline-none"
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
    </div>
  );
};

// --- Main Page ---
export default function VendorOrdersPage() {
  const router = useRouter();
  const dispatch = useDispatch();
  const { orders, loading, error } = useSelector((state: RootState) => state.vendor);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'>('all');
  const [viewMode, setViewMode] = useState<'card' | 'table'>('card');

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

      const response = await getVendorOrders(params);
      const ordersData = {
        items: response.data || [],
        total: response.pagination?.total || 0,
        page: response.pagination?.page || 1,
        limit: response.pagination?.limit || 20,
        pages: response.pagination?.pages || 0
      };
      dispatch(setOrders(ordersData));
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

  const getCustomerName = (order: Order) => {
    if (order.user?.firstName && order.user?.lastName) {
      return `${order.user.firstName} ${order.user.lastName}`;
    }
    return order.user?.firstName || order.user?.lastName || order.customerName || 'Customer';
  };

  return (
    <VendorLayout>
      <div className="bg-[#f4f8fb] min-h-screen">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-1">My Orders</h1>
            <p className="text-gray-500">Manage and track your customer orders</p>
          </div>

          {error && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 mb-6">
              <AlertCircle className="h-5 w-5" />
              <span className="text-sm">{error}</span>
              <button
                onClick={() => dispatch(clearError())}
                className="ml-auto text-red-400 hover:text-red-600"
              >
                <XCircle className="h-4 w-4" />
              </button>
            </div>
          )}

          {/* Filters and Search */}
          <div className="rounded-xl border border-gray-200 bg-white shadow-sm mb-8 p-4">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              {/* Search */}
              <form onSubmit={handleSearch} className="flex-1 max-w-md">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search orders..."
                    className="w-full pl-10 pr-3 py-2 rounded-md border border-gray-200 bg-gray-50 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-100"
                  />
                </div>
              </form>
              {/* Filters */}
              <div className="flex items-center gap-4">
                {/* Status Filter */}
                <div className="flex items-center gap-2">
                  <Filter className="h-5 w-5 text-gray-400" />
                  <select
                    value={statusFilter}
                    onChange={(e) => handleStatusFilter(e.target.value as 'all' | 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled')}
                    className="px-2 py-1.5 rounded-md border border-gray-200 bg-gray-50 text-sm text-gray-700 focus:outline-none"
                  >
                    <option value="all">All Status</option>
                    <option value="pending">Pending</option>
                    <option value="processing">Processing</option>
                    <option value="shipped">Shipped</option>
                    <option value="delivered">Delivered</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
                {/* View Mode Toggle */}
                <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
                  <button
                    type="button"
                    onClick={() => setViewMode('card')}
                    className={`p-2 rounded ${viewMode === 'card' ? 'bg-white shadow-sm' : 'text-gray-400'}`}
                  >
                    <Grid className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewMode('table')}
                    className={`p-2 rounded ${viewMode === 'table' ? 'bg-white shadow-sm' : 'text-gray-400'}`}
                  >
                    <List className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Orders */}
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="animate-spin rounded-full border-4 border-gray-200 border-t-blue-400 h-12 w-12"></div>
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="text-center py-20">
              <ShoppingCart className="h-16 w-16 text-gray-300 mx-auto mb-4" />
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
              {/* Table View */}
              {viewMode === 'table' ? (
                <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-100">
                      <thead>
                        <tr className="text-xs text-gray-500 uppercase bg-gray-50">
                          <th className="px-4 py-3 text-left font-semibold">Order ID</th>
                          <th className="px-4 py-3 text-left font-semibold">Customer</th>
                          <th className="px-4 py-3 text-left font-semibold">Date</th>
                          <th className="px-4 py-3 text-left font-semibold">Items</th>
                          <th className="px-4 py-3 text-left font-semibold">Total</th>
                          <th className="px-4 py-3 text-left font-semibold">Status</th>
                          <th className="px-4 py-3 text-left font-semibold">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {filteredOrders.map((order: Order) => (
                          <tr key={order._id} className="hover:bg-gray-50">
                            <td className="px-4 py-3 font-medium text-gray-900">
                              #{order._id?.slice(-8)?.toUpperCase() || order.orderId || 'N/A'}
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-2">
                                <User className="h-4 w-4 text-gray-400" />
                                <span className="text-gray-900">{getCustomerName(order)}</span>
                              </div>
                            </td>
                            <td className="px-4 py-3 text-gray-500">
                              {new Date(order.createdAt).toLocaleDateString()}
                            </td>
                            <td className="px-4 py-3 text-gray-500">
                              {order.orderItems?.length || order.items?.length || 0} items
                            </td>
                            <td className="px-4 py-3 font-semibold text-gray-900">
                              ₹{order.totalPrice || order.totalAmount || 0}
                            </td>
                            <td className="px-4 py-3">
                              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                                {getStatusIcon(order.status)}
                                <span className="capitalize">{order.status || 'Pending'}</span>
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => router.push(`/vendor/orders/${order._id}`)}
                                  className="inline-flex items-center gap-1 px-2 py-1 rounded border border-gray-200 text-xs text-gray-700 bg-white hover:bg-gray-50"
                                >
                                  <Eye className="h-3 w-3" />
                                  View
                                </button>
                                {order.status !== 'delivered' && order.status !== 'cancelled' && (
                                  <select
                                    value={order.status || 'pending'}
                                    onChange={(e) => handleStatusUpdate(order._id, e.target.value)}
                                    className="px-2 py-1 rounded border border-gray-200 text-xs text-gray-700 bg-gray-50"
                                  >
                                    <option value="pending">Pending</option>
                                    <option value="processing">Processing</option>
                                    <option value="shipped">Shipped</option>
                                    <option value="delivered">Delivered</option>
                                    <option value="cancelled">Cancelled</option>
                                  </select>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                // Card View
                <div className="space-y-4">
                  {filteredOrders.map((order: Order) => (
                    <OrderCard
                      key={order._id}
                      order={order}
                      onView={(id) => router.push(`/vendor/orders/${id}`)}
                      onStatusUpdate={handleStatusUpdate}
                      getStatusColor={getStatusColor}
                      getStatusIcon={getStatusIcon}
                      getCustomerName={getCustomerName}
                    />
                  ))}
                </div>
              )}

              {/* Pagination */}
              {orders.pages > 1 && (
                <div className="mt-8 flex items-center justify-center">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => loadOrders(orders.page - 1)}
                      disabled={orders.page === 1}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded border border-gray-200 text-sm text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ArrowLeft className="h-4 w-4" />
                      Previous
                    </button>
                    <span className="px-3 py-2 text-sm text-gray-500">
                      Page {orders.page} of {orders.pages}
                    </span>
                    <button
                      onClick={() => loadOrders(orders.page + 1)}
                      disabled={orders.page === orders.pages}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded border border-gray-200 text-sm text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </VendorLayout>
  );
}


