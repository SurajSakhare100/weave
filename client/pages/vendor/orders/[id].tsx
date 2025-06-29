import VendorLayout from '@/components/VendorLayout';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../../store/store';
import { setLoading, setError, clearError } from '../../../features/vendor/vendorSlice';
import { getVendorOrderById, updateOrderStatus } from '../../../services/vendorService';
import { requireVendorAuth } from '../../../utils/vendorAuth';
import { 
  ArrowLeft, 
  AlertCircle,
  Clock,
  CheckCircle,
  Truck,
  XCircle,
  Calendar,
  User,
  Package,
  MapPin,
  Phone,
  Mail
} from 'lucide-react';

interface OrderItem {
  product?: {
    name: string;
    files?: string[];
  };
  quantity: number;
  price: number;
}

interface Order {
  _id: string;
  orderId?: string;
  createdAt: string;
  status: string;
  orderItems?: OrderItem[];
  items?: OrderItem[];
  customer?: {
    name: string;
    email: string;
    phone: string;
  };
  shippingAddress?: {
    address: string;
    city: string;
    state: string;
    pincode: string;
  };
  totalPrice: number;
}

export default function VendorOrderDetailPage() {
  const router = useRouter();
  const { id } = router.query;
  const dispatch = useDispatch();
  const { loading, error } = useSelector((state: RootState) => state.vendor);
  const [order, setOrder] = useState<Order | null>(null);

  const loadOrderDetails = async () => {
    try {
      dispatch(setLoading(true));
      dispatch(clearError());
      
      const data = await getVendorOrderById(id as string);
      setOrder(data);
    } catch (error: unknown) {
      console.error('Error loading order details:', error);
      const err = error as { response?: { data?: { message?: string } } };
      const errorMessage = err.response?.data?.message || 'Failed to load order details. Please try again.';
      dispatch(setError(errorMessage));
    } finally {
      dispatch(setLoading(false));
    }
  };

  useEffect(() => {
    // Check authentication
    if (!requireVendorAuth(router)) {
      return;
    }

    // Load order details
    if (id) {
      loadOrderDetails();
    }
  }, [id, router, loadOrderDetails]);

  const handleStatusUpdate = async (newStatus: string) => {
    try {
      dispatch(setLoading(true));
      await updateOrderStatus(id as string, newStatus);
      setOrder(prev => prev ? { ...prev, status: newStatus } : null);
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

  if (loading) {
    return (
      <VendorLayout>
        <section className="py-16 bg-[#faf5f2] text-black min-h-screen">
          <div className="max-w-4xl mx-auto px-4">
            <div className="flex items-center justify-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500"></div>
            </div>
          </div>
        </section>
      </VendorLayout>
    );
  }

  if (!order) {
    return (
      <VendorLayout>
        <section className="py-16 bg-[#faf5f2] text-black min-h-screen">
          <div className="max-w-4xl mx-auto px-4">
            <div className="text-center py-20">
              <AlertCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Order not found</h3>
              <p className="text-gray-500 mb-4">The order you&apos;re looking for doesn&apos;t exist or you don&apos;t have permission to view it.</p>
              <button
                onClick={() => router.push('/vendor/orders')}
                className="bg-pink-500 text-white px-6 py-2 rounded-lg hover:bg-pink-600 transition-colors"
              >
                Back to Orders
              </button>
            </div>
          </div>
        </section>
      </VendorLayout>
    );
  }

  return (
    <VendorLayout>
      <section className="py-16 bg-[#faf5f2] text-black min-h-screen">
        <div className="max-w-4xl mx-auto px-4">
          {/* Header */}
          <div className="mb-8">
            <button
              onClick={() => router.push('/vendor/orders')}
              className="flex items-center text-gray-600 hover:text-gray-800 mb-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Orders
            </button>
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-800 mb-2">
                  Order #{order._id?.slice(-8)?.toUpperCase() || order.orderId || 'N/A'}
                </h1>
                <p className="text-gray-600">
                  Placed on {new Date(order.createdAt).toLocaleDateString()}
                </p>
              </div>
              <span className={`px-4 py-2 text-sm rounded-full flex items-center space-x-2 ${getStatusColor(order.status)}`}>
                {getStatusIcon(order.status)}
                <span className="capitalize font-medium">{order.status || 'Pending'}</span>
              </span>
            </div>
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

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Order Details */}
            <div className="lg:col-span-2 space-y-6">
              {/* Order Items */}
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Order Items</h2>
                <div className="space-y-4">
                  {(order.orderItems || order.items || []).map((item: any, index: number) => (
                    <div key={index} className="flex items-center space-x-4 p-4 border border-gray-100 rounded-lg">
                      <img
                        src={item.product?.files?.[0] || '/products/product.png'}
                        alt={item.product?.name || 'Product'}
                        className="w-16 h-16 rounded object-cover"
                        onError={(e) => {
                          e.currentTarget.src = '/products/product.png';
                        }}
                      />
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-800">{item.product?.name || item.name || 'Product'}</h3>
                        <p className="text-sm text-gray-500">Quantity: {item.quantity}</p>
                        <p className="text-sm text-gray-500">Price: ₹{item.price} each</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-800">₹{(item.price * item.quantity).toFixed(2)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Customer Information */}
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Customer Information</h2>
                <div className="space-y-3">
                  <div className="flex items-center">
                    <User className="h-5 w-5 text-gray-400 mr-3" />
                    <span className="text-gray-700">{order.customer?.name || 'Customer'}</span>
                  </div>
                  {order.customer?.email && (
                    <div className="flex items-center">
                      <Mail className="h-5 w-5 text-gray-400 mr-3" />
                      <span className="text-gray-700">{order.customer.email}</span>
                    </div>
                  )}
                  {order.customer?.phone && (
                    <div className="flex items-center">
                      <Phone className="h-5 w-5 text-gray-400 mr-3" />
                      <span className="text-gray-700">{order.customer.phone}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Shipping Address */}
              {order.shippingAddress && (
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <h2 className="text-xl font-semibold text-gray-800 mb-4">Shipping Address</h2>
                  <div className="flex items-start">
                    <MapPin className="h-5 w-5 text-gray-400 mr-3 mt-0.5" />
                    <div className="text-gray-700">
                      <p>{order.shippingAddress.address}</p>
                      <p>{order.shippingAddress.city}, {order.shippingAddress.state}</p>
                      <p>Pincode: {order.shippingAddress.pincode}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Order Summary */}
            <div className="space-y-6">
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Order Summary</h2>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal:</span>
                    <span className="font-medium">₹{order.totalPrice || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Shipping:</span>
                    <span className="font-medium">₹{order.shippingCost || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tax:</span>
                    <span className="font-medium">₹{order.tax || 0}</span>
                  </div>
                  <div className="border-t pt-3">
                    <div className="flex justify-between">
                      <span className="text-lg font-semibold text-gray-800">Total:</span>
                      <span className="text-lg font-bold text-gray-800">₹{order.totalPrice || 0}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Status Update */}
              {order.status !== 'delivered' && order.status !== 'cancelled' && (
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <h2 className="text-xl font-semibold text-gray-800 mb-4">Update Status</h2>
                  <select
                    value={order.status || 'pending'}
                    onChange={(e) => handleStatusUpdate(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                  >
                    <option value="pending">Pending</option>
                    <option value="processing">Processing</option>
                    <option value="shipped">Shipped</option>
                    <option value="delivered">Delivered</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </VendorLayout>
  );
} 