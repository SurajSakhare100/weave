import MainLayout from '@/components/layout/MainLayout';
import { useState, useEffect } from 'react';
import { getUserOrders } from '../../services/userService';
import Link from 'next/link';
import { useRequireUserAuth } from '../../hooks/useRequireUserAuth';
import { toast } from 'sonner';
import { Package, Calendar, MapPin, Truck, CheckCircle, Clock, XCircle, AlertCircle, ChevronRight } from 'lucide-react';
import Image from 'next/image';

interface OrderItem {
  product: {
    name: string;
    price: number;
    files?: string[];
  };
  quantity: number;
  variantSize?: string;
}

interface Order {
  _id: string;
  orderId?: string;
  createdAt: string;
  status: string;
  totalPrice: number;
  orderItems?: OrderItem[];
  shippingAddress?: {
    name: string;
    address: string[];
    city: string;
    state: string;
    pincode: string;
    phone: string;
  };
  paymentMethod?: string;
  deliveryFee?: number;
  discount?: number;
}

const getStatusInfo = (status: string) => {
  switch (status.toLowerCase()) {
    case 'pending':
      return {
        icon: Clock,
        color: 'text-yellow-600',
        bgColor: 'bg-yellow-50',
        borderColor: 'border-yellow-200',
        text: 'Pending'
      };
    case 'confirmed':
      return {
        icon: AlertCircle,
        color: 'text-blue-600',
        bgColor: 'bg-blue-50',
        borderColor: 'border-blue-200',
        text: 'Confirmed'
      };
    case 'shipped':
      return {
        icon: Truck,
        color: 'text-purple-600',
        bgColor: 'bg-purple-50',
        borderColor: 'border-purple-200',
        text: 'Shipped'
      };
    case 'delivered':
      return {
        icon: CheckCircle,
        color: 'text-green-600',
        bgColor: 'bg-green-50',
        borderColor: 'border-green-200',
        text: 'Delivered'
      };
    case 'cancelled':
      return {
        icon: XCircle,
        color: 'text-red-600',
        bgColor: 'bg-red-50',
        borderColor: 'border-red-200',
        text: 'Cancelled'
      };
    default:
      return {
        icon: Clock,
        color: 'text-gray-600',
        bgColor: 'bg-gray-50',
        borderColor: 'border-gray-200',
        text: status
      };
  }
};

export default function UserOrdersPage() {
  const loggedIn = useRequireUserAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        setError('');
        
        const response = await getUserOrders();
        
        // Handle different response formats
        if (response.success === false) {
          setError(response.message || 'Failed to load orders');
          setOrders([]);
        } else if (response.data) {
          setOrders(response.data);
        } else if (Array.isArray(response)) {
          setOrders(response);
        } else {
          setOrders([]);
        }
      } catch (error: unknown) {
        console.error('Error fetching orders:', error);
        
        // Handle specific error cases
        const err = error as { response?: { status?: number }; error?: string };
        if (err.response?.status === 401) {
          setError('Please login to view your orders.');
          toast.error('Please login to view your orders.');
        } else if (err.error === 'NETWORK_ERROR') {
          setError('Server is currently unavailable. Please try again later.');
          toast.error('Server is currently unavailable. Please try again later.');
        } else {
          setError('Failed to load orders. Please try again.');
          toast.error('Failed to load orders. Please try again.');
        }
        setOrders([]);
      } finally {
        setLoading(false);
      }
    };

    if (loggedIn) {
      fetchOrders();
    }
  }, [loggedIn]);

  if (loading) {
    return (
      <MainLayout>
        <div className="min-h-screen bg-[#faf9f7] flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#EE346C] mx-auto mb-4"></div>
            <p className="text-[#5E3A1C]">Loading your orders...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="min-h-screen bg-[#faf9f7]">
        <div className="max-w-6xl mx-auto px-4 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-[#5E3A1C] mb-2">My Orders</h1>
            <p className="text-[#6b7280]">Track and manage your orders</p>
          </div>
          
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600">{error}</p>
              {error.includes('login') && (
                <Link href="/login" className="text-red-500 underline mt-2 inline-block">Login here</Link>
              )}
              {!error.includes('login') && (
                <button 
                  onClick={() => window.location.reload()} 
                  className="text-red-500 underline mt-2 inline-block"
                >
                  Try Again
                </button>
              )}
            </div>
          )}
          
          {orders.length === 0 && !error ? (
            <div className="text-center py-20">
              <div className="w-24 h-24 bg-[#faf5f2] rounded-full flex items-center justify-center mx-auto mb-6">
                <Package className="w-12 h-12 text-[#EE346C]" />
              </div>
              <h2 className="text-2xl font-semibold text-[#5E3A1C] mb-2">No orders yet</h2>
              <p className="text-[#6b7280] mb-8">Start shopping to see your orders here</p>
              <Link 
                href="/products" 
                className="inline-flex items-center bg-[#EE346C] text-white px-6 py-3 rounded-lg hover:bg-[#c2185b] transition-colors font-medium"
              >
                Start Shopping
                <ChevronRight className="w-4 h-4 ml-2" />
              </Link>
            </div>
          ) : (
            <div className="space-y-6">
              {orders.map(order => {
                const statusInfo = getStatusInfo(order.status);
                const StatusIcon = statusInfo.icon;
                
                return (
                  <div key={order._id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    {/* Order Header */}
                    <div className="p-6 border-b border-gray-100">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div className="flex items-center gap-4">
                          <div className={`p-2 rounded-lg ${statusInfo.bgColor}`}>
                            <StatusIcon className={`w-5 h-5 ${statusInfo.color}`} />
                          </div>
                          <div>
                            <h3 className="font-semibold text-[#5E3A1C] text-lg">
                              Order #{order.orderId || order._id.slice(-8)}
                            </h3>
                            <div className="flex items-center gap-4 text-sm text-[#6b7280] mt-1">
                              <div className="flex items-center gap-1">
                                <Calendar className="w-4 h-4" />
                                {new Date(order.createdAt).toLocaleDateString('en-US', {
                                  year: 'numeric',
                                  month: 'long',
                                  day: 'numeric'
                                })}
                              </div>
                              <div className="flex items-center gap-1">
                                <Package className="w-4 h-4" />
                                {order.orderItems?.length || 0} items
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex flex-col items-end gap-2">
                          <span className={`px-3 py-1 rounded-full text-sm font-medium border ${statusInfo.bgColor} ${statusInfo.borderColor} ${statusInfo.color}`}>
                            {statusInfo.text}
                          </span>
                          <div className="text-right">
                            <p className="text-sm text-[#6b7280]">Total</p>
                            <p className="text-xl font-bold text-[#5E3A1C]">₹{order.totalPrice}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Order Items */}
                    {order.orderItems && order.orderItems.length > 0 && (
                      <div className="p-6">
                        <h4 className="font-semibold text-[#5E3A1C] mb-4">Order Items</h4>
                        <div className="space-y-4">
                          {order.orderItems.map((item, index) => (
                            <div key={index} className="flex items-center gap-4 p-4 bg-[#faf9f7] rounded-lg">
                              <div className="relative w-16 h-16 bg-white rounded-lg overflow-hidden flex-shrink-0">
                                <Image 
                                  src={item.product.files?.[0] ? `/uploads/${item.product.files[0]}` : "/products/product.png"}
                                  alt={item.product.name}
                                  fill
                                  className="object-cover"
                                />
                              </div>
                              <div className="flex-1 min-w-0">
                                <h5 className="font-medium text-[#5E3A1C] truncate">{item.product.name}</h5>
                                <p className="text-sm text-[#6b7280]">Qty: {item.quantity}</p>
                                {item.variantSize && (
                                  <p className="text-sm text-[#6b7280]">Size: {item.variantSize}</p>
                                )}
                              </div>
                              <div className="text-right">
                                <p className="font-medium text-[#5E3A1C]">₹{item.product.price * item.quantity}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Shipping Address */}
                    {order.shippingAddress && (
                      <div className="px-6 pb-6">
                        <div className="flex items-start gap-3 p-4 bg-[#faf9f7] rounded-lg">
                          <MapPin className="w-5 h-5 text-[#EE346C] mt-0.5 flex-shrink-0" />
                          <div>
                            <h4 className="font-medium text-[#5E3A1C] mb-1">Delivery Address</h4>
                            <div className="text-sm text-[#6b7280] space-y-1">
                              <p className="font-medium">{order.shippingAddress.name}</p>
                              {order.shippingAddress.address.map((line, index) => (
                                <p key={index}>{line}</p>
                              ))}
                              <p>{order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.pincode}</p>
                              <p>Phone: {order.shippingAddress.phone}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
} 