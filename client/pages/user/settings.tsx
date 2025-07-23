import MainLayout from '@/components/layout/MainLayout';
import { useState, useEffect } from 'react';
import { getUserOrders } from '../../services/userService';
import Link from 'next/link';
import { useRequireUserAuth } from '../../hooks/useRequireUserAuth';
import { toast } from 'sonner';
import { ChevronRight, Package, User, MapPin, CreditCard, ShoppingBag, Settings } from 'lucide-react';
import Image from 'next/image';

interface OrderItem {
  product: {
    name: string;
    price: number;
    files?: string[];
  };
  quantity: number;
  variantSize?: string;
  variantColor?: string;
}

interface Order {
  _id: string;
  orderId?: string;
  createdAt: string;
  status: string;
  totalPrice: number;
  orderItems?: OrderItem[];
}

export default function UserSettingsPage() {
  const loggedIn = useRequireUserAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeSection, setActiveSection] = useState('past-orders');

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        setError('');
        
        const response = await getUserOrders();
        
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

  const navigationItems = [
    { id: 'edit-profile', label: 'Edit Profile', icon: User, href: '/user/profile' },
    { id: 'my-account', label: 'My Account', icon: Settings, href: '/user/profile' },
    { id: 'addresses', label: 'Addresses', icon: MapPin, href: '/user/addresses' },
    { id: 'payments', label: 'Payments & Refunds', icon: CreditCard, href: '/user/profile' },
    { id: 'past-orders', label: 'Past Orders', icon: ShoppingBag, href: '/user/orders' },
  ];

  const handleReorder = (order: Order) => {
    // Add reorder functionality here
    toast.success('Reorder functionality coming soon!');
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="min-h-screen bg-[#faf9f7] flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#EE346C] mx-auto mb-4"></div>
            <p className="text-[#5E3A1C]">Loading your settings...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="min-h-screen bg-[#faf9f7]">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Sidebar Navigation */}
            <div className="lg:w-80 flex-shrink-0">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <h2 className="text-2xl font-bold text-[#5E3A1C] mb-6">Profile</h2>
                <nav className="space-y-2">
                  {navigationItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeSection === item.id;
                    
                    return (
                      <Link
                        key={item.id}
                        href={item.href}
                        className={`flex items-center justify-between p-3 rounded-lg transition-colors ${
                          isActive 
                            ? 'bg-[#faf5f2] text-[#5E3A1C] border border-[#EE346C]/20' 
                            : 'text-[#6b7280] hover:bg-gray-50 hover:text-[#5E3A1C]'
                        }`}
                        onClick={() => setActiveSection(item.id)}
                      >
                        <div className="flex items-center gap-3">
                          <Icon className="w-5 h-5" />
                          <span className="font-medium">{item.label}</span>
                        </div>
                        <ChevronRight className="w-4 h-4" />
                      </Link>
                    );
                  })}
                </nav>
              </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <h2 className="text-2xl font-bold text-[#5E3A1C] mb-6">Past Orders</h2>
                
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
                    <h3 className="text-xl font-semibold text-[#5E3A1C] mb-2">No orders yet</h3>
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
                  <div className="space-y-4">
                    {orders.slice(0, 2).map((order) => (
                      <div key={order._id} className="bg-[#faf9f7] rounded-lg p-4">
                        {order.orderItems && order.orderItems.map((item, index) => (
                          <div key={index} className="flex items-center gap-4">
                            {/* Product Image */}
                            <div className="relative w-20 h-20 bg-white rounded-lg overflow-hidden flex-shrink-0">
                              <Image 
                                src={item.product.files?.[0] ? `/uploads/${item.product.files[0]}` : "/products/product.png"}
                                alt={item.product.name}
                                fill
                                className="object-cover"
                              />
                            </div>
                            
                            {/* Product Details */}
                            <div className="flex-1 min-w-0">
                              <h4 className="font-medium text-[#5E3A1C] mb-1">
                                {item.product.name || "Bag name"}
                              </h4>
                              <p className="text-lg font-semibold text-[#5E3A1C] mb-1">
                                ₹{item.product.price}
                              </p>
                              <div className="space-y-1 text-sm text-[#6b7280]">
                                {item.variantSize && (
                                  <p>Size: {item.variantSize}</p>
                                )}
                                {item.variantColor && (
                                  <p>Color: {item.variantColor}</p>
                                )}
                                <p>Quantity: {item.quantity}</p>
                              </div>
                            </div>
                            
                            {/* Reorder Button */}
                            <button
                              onClick={() => handleReorder(order)}
                              className="px-4 py-2 border border-[#EE346C] text-[#EE346C] rounded-lg hover:bg-[#EE346C] hover:text-white transition-colors font-medium flex-shrink-0"
                            >
                              Reorder
                            </button>
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
} 