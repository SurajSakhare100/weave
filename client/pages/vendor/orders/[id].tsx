import VendorLayout from '@/components/Vendor/VendorLayout';
import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/router';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../../store/store';
import { setLoading, setError, clearError } from '../../../features/vendor/vendorSlice';
import { getVendorOrderById, updateOrderStatus } from '../../../services/vendorService';
import { isVendorAuthenticated } from '../../../utils/vendorAuth';
import {
  ArrowLeft,
  AlertCircle,
  Clock,
  CheckCircle,
  Truck,
  XCircle,
  User,
  Package,
  MapPin,
  Phone,
  Mail,
  Calendar,
  DollarSign,
  ShoppingCart,
  CreditCard,
} from 'lucide-react';
import Image from 'next/image';

interface OrderItem {
  product?: {
    name: string;
    files?: string[];
    price?: number;
    mrp?: number;
  };
  quantity: number;
  price: number;
  mrp?: number;
  status?: string;
}

interface Order {
  _id: string;
  orderId?: string;
  createdAt: string;
  status: string;
  orderItems?: OrderItem[];
  items?: OrderItem[];
  user?: {
    firstName: string;
    lastName: string;
    email: string;
    number?: string;
  };
  customer?: {
    name: string;
    email: string;
    phone: string;
  };
  shippingAddress?: {
    name?: string;
    address: string;
    city: string;
    state: string;
    pincode: string;
    phone?: string;
  };
  paymentMethod?: string;
  itemsPrice?: number;
  taxPrice?: number;
  shippingPrice?: number;
  discountAmount?: number;
  totalPrice: number;
  shippingCost?: number;
  tax?: number;
}

const STATUS_OPTIONS = [
  { value: 'pending', label: 'Pending', color: 'bg-yellow-100 text-yellow-800', icon: <Clock className="h-4 w-4" /> },
  { value: 'processing', label: 'Processing', color: 'bg-blue-100 text-blue-800', icon: <Package className="h-4 w-4" /> },
  { value: 'shipped', label: 'Shipped', color: 'bg-purple-100 text-purple-800', icon: <Truck className="h-4 w-4" /> },
  { value: 'delivered', label: 'Delivered', color: 'bg-green-100 text-green-800', icon: <CheckCircle className="h-4 w-4" /> },
  { value: 'cancelled', label: 'Cancelled', color: 'bg-red-100 text-red-800', icon: <XCircle className="h-4 w-4" /> },
];

function getStatusMeta(status: string) {
  const found = STATUS_OPTIONS.find(
    (s) => s.value === status?.toLowerCase()
  );
  return (
    found || {
      value: 'pending',
      label: 'Pending',
      color: 'bg-gray-100 text-gray-800',
      icon: <Clock className="h-4 w-4" />,
    }
  );
}

function getPaymentMethodIcon(method: string) {
  switch (method?.toLowerCase()) {
    case 'credit card':
    case 'debit card':
      return <CreditCard className="h-4 w-4" />;
    case 'cash on delivery':
    case 'cod':
      return <DollarSign className="h-4 w-4" />;
    default:
      return <CreditCard className="h-4 w-4" />;
  }
}

export default function VendorOrderDetailPage() {
  const router = useRouter();
  const { id } = router.query;
  const dispatch = useDispatch();
  const { loading, error } = useSelector((state: RootState) => state.vendor);
  const [order, setOrder] = useState<Order | null>(null);

  const loadOrderDetails = useCallback(async () => {
    try {
      dispatch(setLoading(true));
      dispatch(clearError());
      const response = await getVendorOrderById(id as string);
      setOrder(response.data || response);
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      const errorMessage = err.response?.data?.message || 'Failed to load order details. Please try again.';
      dispatch(setError(errorMessage));
    } finally {
      dispatch(setLoading(false));
    }
  }, [id, dispatch]);

  useEffect(() => {
    if (!isVendorAuthenticated()) {
      router.push('/vendor/login');
      return;
    }
    if (id) {
      loadOrderDetails();
    }
  }, [id, router, loadOrderDetails]);

  const handleStatusUpdate = async (newStatus: string) => {
    try {
      dispatch(setLoading(true));
      await updateOrderStatus(id as string, newStatus);
      setOrder((prev) => (prev ? { ...prev, status: newStatus } : null));
      dispatch(clearError());
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      const errorMessage = err.response?.data?.message || 'Failed to update order status. Please try again.';
      dispatch(setError(errorMessage));
    } finally {
      dispatch(setLoading(false));
    }
  };

  if (loading) {
    return (
      <VendorLayout>
        <div className="bg-white min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </VendorLayout>
    );
  }

  if (!order && !loading) {
    return (
      <VendorLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-800 mb-2">Order not found</h3>
            <p className="text-gray-500 mb-6">The order you're looking for doesn't exist or you don't have permission to view it.</p>
            <button
              onClick={() => router.push('/vendor/orders')}
              className="inline-flex items-center px-4 py-2 rounded-md border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 transition"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Orders
            </button>
          </div>
        </div>
      </VendorLayout>
    );
  }

  const orderItems = order?.orderItems || order?.items || [];
  const customerName =
    order?.user?.firstName && order?.user?.lastName
      ? `${order.user.firstName} ${order.user.lastName}`
      : order?.user?.firstName ||
        order?.user?.lastName ||
        order?.customer?.name ||
        'Customer';

  const statusMeta = getStatusMeta(order?.status || '');

  return (
    <VendorLayout>
      <div className="bg-white min-h-screen">
        <div className="max-w-5xl mx-auto px-2 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <button
              onClick={() => router.push('/vendor/orders')}
              className="inline-flex items-center px-3 py-1.5 rounded-md border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 transition mb-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Orders
            </button>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
              <div>
                <h1 className="text-2xl font-bold text-gray-800 mb-1">
                  Order #{order?._id?.slice(-8)?.toUpperCase() || order?.orderId || 'N/A'}
                </h1>
                <p className="text-gray-500 text-sm">
                  Placed on {order?.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'N/A'}
                </p>
              </div>
              <div className="mt-2 md:mt-0">
                <span
                  className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium ${statusMeta.color}`}
                >
                  {statusMeta.icon}
                  <span className="capitalize">{statusMeta.label}</span>
                </span>
              </div>
            </div>
          </div>

          {error && (
            <div className="flex items-center bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
              <AlertCircle className="h-5 w-5 mr-2" />
              <span className="text-sm">{error}</span>
              <button
                onClick={() => dispatch(clearError())}
                className="ml-auto text-red-400 hover:text-red-600"
              >
                <XCircle className="h-4 w-4" />
              </button>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Order Details */}
            <div className="md:col-span-2 space-y-6">
              {/* Order Items */}
              <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
                <div className="border-b border-gray-100 px-5 py-3 flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-gray-800">Order Items</h2>
                  <span className="text-xs text-gray-500">{orderItems.length} items</span>
                </div>
                <div className="px-5 py-4">
                  <div className="space-y-4">
                    {orderItems.length === 0 ? (
                      <div className="text-center py-8">
                        <ShoppingCart className="h-12 w-12 text-gray-200 mx-auto mb-4" />
                        <p className="text-gray-400">No items found in this order</p>
                      </div>
                    ) : (
                      orderItems.map((item: OrderItem, index: number) => (
                        <div
                          key={index}
                          className="flex items-center gap-4 p-3 border border-gray-100 rounded-lg bg-gray-50"
                        >
                          <div className="flex-shrink-0">
                            <Image
                              src={
                                item.product?.files?.[0]
                                  ? `http://localhost:5000/uploads/${item.product.files[0]}`
                                  : '/products/product.png'
                              }
                              alt={item.product?.name || 'Product'}
                              width={64}
                              height={64}
                              className="object-cover rounded-md border border-gray-200"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-medium text-gray-800 text-base mb-0.5">
                              {item.product?.name || 'Product'}
                            </h3>
                            <div className="flex items-center gap-4 text-xs text-gray-500">
                              <span>Qty: {item.quantity}</span>
                              <span>Price: ₹{item.price}</span>
                              {item.mrp && item.mrp > item.price && (
                                <span className="line-through">MRP: ₹{item.mrp}</span>
                              )}
                            </div>
                            {item.status && (
                              <div className="mt-1">
                                <span
                                  className={`px-2 py-0.5 text-xs rounded-full ${getStatusMeta(item.status).color}`}
                                >
                                  {getStatusMeta(item.status).label}
                                </span>
                              </div>
                            )}
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-gray-800 text-base">
                              ₹{(item.price * item.quantity).toFixed(2)}
                            </p>
                            {item.mrp && item.mrp > item.price && (
                              <p className="text-xs text-gray-400 line-through">
                                ₹{(item.mrp * item.quantity).toFixed(2)}
                              </p>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>

              {/* Customer Information */}
              <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
                <div className="border-b border-gray-100 px-5 py-3">
                  <h2 className="text-lg font-semibold text-gray-800">Customer Information</h2>
                </div>
                <div className="px-5 py-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <div className="flex items-center">
                        <User className="h-5 w-5 text-gray-400 mr-3" />
                        <div>
                          <p className="font-medium text-gray-800">{customerName}</p>
                          <p className="text-xs text-gray-500">Customer</p>
                        </div>
                      </div>
                      {(order?.user?.email || order?.customer?.email) && (
                        <div className="flex items-center">
                          <Mail className="h-5 w-5 text-gray-400 mr-3" />
                          <div>
                            <p className="text-gray-800">{order?.user?.email || order?.customer?.email}</p>
                            <p className="text-xs text-gray-500">Email</p>
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="space-y-3">
                      {(order?.user?.number || order?.customer?.phone) && (
                        <div className="flex items-center">
                          <Phone className="h-5 w-5 text-gray-400 mr-3" />
                          <div>
                            <p className="text-gray-800">{order?.user?.number || order?.customer?.phone}</p>
                            <p className="text-xs text-gray-500">Phone</p>
                          </div>
                        </div>
                      )}
                      <div className="flex items-center">
                        <Calendar className="h-5 w-5 text-gray-400 mr-3" />
                        <div>
                          <p className="text-gray-800">
                            {order?.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'N/A'}
                          </p>
                          <p className="text-xs text-gray-500">Order Date</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Shipping Address */}
              {order?.shippingAddress && (
                <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
                  <div className="border-b border-gray-100 px-5 py-3">
                    <h2 className="text-lg font-semibold text-gray-800">Shipping Address</h2>
                  </div>
                  <div className="px-5 py-4">
                    <div className="flex items-start">
                      <MapPin className="h-5 w-5 text-gray-400 mr-3 mt-0.5" />
                      <div className="text-gray-800">
                        {order.shippingAddress.name && (
                          <p className="font-medium mb-1">{order.shippingAddress.name}</p>
                        )}
                        <p>{order.shippingAddress.address}</p>
                        <p>
                          {order.shippingAddress.city}, {order.shippingAddress.state}
                        </p>
                        <p>Pincode: {order.shippingAddress.pincode}</p>
                        {order.shippingAddress.phone && (
                          <p className="mt-1">Phone: {order.shippingAddress.phone}</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Payment Information */}
              {order?.paymentMethod && (
                <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
                  <div className="border-b border-gray-100 px-5 py-3">
                    <h2 className="text-lg font-semibold text-gray-800">Payment Information</h2>
                  </div>
                  <div className="px-5 py-4">
                    <div className="flex items-center">
                      {getPaymentMethodIcon(order.paymentMethod)}
                      <div className="ml-3">
                        <p className="font-medium text-gray-800 capitalize">{order.paymentMethod}</p>
                        <p className="text-xs text-gray-500">Payment Method</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Order Summary */}
            <div className="space-y-6">
              <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
                <div className="border-b border-gray-100 px-5 py-3">
                  <h2 className="text-lg font-semibold text-gray-800">Order Summary</h2>
                </div>
                <div className="px-5 py-4">
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Subtotal:</span>
                      <span className="font-medium text-gray-800">
                        ₹{order?.itemsPrice || order?.totalPrice || 0}
                      </span>
                    </div>
                    {order?.taxPrice && order.taxPrice > 0 && (
                      <div className="flex justify-between">
                        <span className="text-gray-500">Tax:</span>
                        <span className="font-medium text-gray-800">₹{order.taxPrice}</span>
                      </div>
                    )}
                    {order?.shippingPrice && order.shippingPrice > 0 && (
                      <div className="flex justify-between">
                        <span className="text-gray-500">Shipping:</span>
                        <span className="font-medium text-gray-800">₹{order.shippingPrice}</span>
                      </div>
                    )}
                    {order?.discountAmount && order.discountAmount > 0 && (
                      <div className="flex justify-between">
                        <span className="text-gray-500">Discount:</span>
                        <span className="font-medium text-green-600">-₹{order.discountAmount}</span>
                      </div>
                    )}
                    <hr className="border-gray-200" />
                    <div className="flex justify-between text-base font-bold">
                      <span className="text-gray-800">Total:</span>
                      <span className="text-gray-800">₹{order?.totalPrice || 0}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Status Update */}
              <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
                <div className="border-b border-gray-100 px-5 py-3">
                  <h2 className="text-lg font-semibold text-gray-800">Update Status</h2>
                </div>
                <div className="px-5 py-4">
                  <select
                    value={order?.status || 'pending'}
                    onChange={(e) => handleStatusUpdate(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {STATUS_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </VendorLayout>
  );
}