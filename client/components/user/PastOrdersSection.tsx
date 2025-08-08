import { useEffect, useState } from 'react';
import { Package, ChevronRight } from 'lucide-react';
import { getUserOrders } from '@/services/userService';
import Image from 'next/image';
import { toast } from 'sonner';

interface OrderItem {
  productId: {
    _id: string;
    name: string;
    price: number;
    files?: string[];
    images?: Array<{
      url: string;
      thumbnail_url?: string;
      is_primary?: boolean;
    }>;
    primaryImage?: string;
  };
  name: string;
  quantity: number;
  price: number;
  mrp: number;
  variantSize?: string;
  image?: string;
}

interface Order {
  _id: string;
  orderId?: string;
  createdAt: string;
  status: string;
  totalPrice: number;
  orderItems?: OrderItem[];
}

export default function PastOrdersSection() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
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

  const handleReorder = (order: Order) => {
    toast.success('Reorder functionality coming soon!');
  };

  if (loading) {
    return (
      <div className="rounded-2xl p-4 sm:p-6">
        <div className="flex items-center justify-center py-8 sm:py-12">
          <div className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-b-2 border-[#EE346C]"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl p-4 sm:p-6">
      <div className="mb-4 sm:mb-6">
        <h2 className="text-xl sm:text-2xl font-bold text-primary">Past Orders</h2>
      </div>

      {error && (
        <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-600 text-sm sm:text-base">{error}</p>
          {error.includes('login') && (
            <button
              onClick={() => window.location.href = '/login'}
              className="text-red-500 underline mt-2 inline-block text-sm sm:text-base"
            >
              Login here
            </button>
          )}
          {!error.includes('login') && (
            <button
              onClick={() => window.location.reload()}
              className="text-red-500 underline mt-2 inline-block text-sm sm:text-base"
            >
              Try Again
            </button>
          )}
        </div>
      )}

      {orders.length === 0 && !error ? (
        <div className="text-center py-12 sm:py-20 px-4">
          <div className="w-20 h-20 sm:w-24 sm:h-24 bg-[#faf5f2] rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
            <Package className="w-10 h-10 sm:w-12 sm:h-12 text-primary" />
          </div>
          <h3 className="text-lg sm:text-xl font-semibold text-primary mb-2">No orders yet</h3>
          <p className="text-[#6b7280] mb-6 sm:mb-8 text-sm sm:text-base">Start shopping to see your orders here</p>
          <button
            onClick={() => window.location.href = '/products'}
            className="inline-flex items-center bg-button text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg hover:bg-[#c2185b] transition-colors font-medium text-sm sm:text-base"
          >
            Start Shopping
            <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4 ml-2" />
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            const date = new Date(order.createdAt);
            const formattedDate = date.toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            });
            return (
              <div key={order._id} className="max-w-lg ">
                {order.orderItems && order.orderItems.map((item, index) => {
                  if (!item.productId) {
                    return null;
                  }

                  return (
                    <div key={index}>
                      <h1 className='text-primary mb-1 text-lg'>{formattedDate}</h1>
                      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-2 border border-border-tertiary rounded-lg ">
                        {/* Product Image */}
                        <div className="relative h-32 w-32 p-4 sm:h-40 sm:w-40 aspect-square bg-white rounded-lg rounded-tr-none rounded-br-none rounded-br-none overflow-hidden flex-shrink-0">
                          <Image
                            src={
                              item.productId.images?.[0]?.url ||
                              item.productId.primaryImage ||
                                "/products/product.png"
                            }
                            alt={item.productId.name || item.name || "Product"}
                            fill
                            className="w-20 h-20 h-full w-full"
                          />
                        </div>

                        {/* Product Details */}
                        <div className="flex-1 min-w-0 p-2">
                          <h4 className="font-bold mb-1 text-sm sm:text-base text-primary truncate">
                            {item.productId.name || item.name || "Bag name"}
                          </h4>
                          <p className="text-sm sm:text-base  font-semibold text-primary mb-2">
                            ₹{item.price || item.productId.price || 0}
                          </p>
                          <div className="space-y-1 text-xs  text-secondary text-[#6b7280]">
                            {item.variantSize && (
                              <p className=' text-secondary font-medium text-sm  sm:text-base  '>Size: {item.variantSize}</p>
                            )}
                            <p className=' text-secondary  font-medium text-sm  sm:text-base '>Color: Pink</p>
                            <p className=' text-secondary  font-medium text-sm sm:text-base  '>Quantity: {item.quantity || 1}</p>
                          </div>
                        </div>

                        <div className='p-2 self-end w-full sm:w-auto'>
                          {/* Reorder Button */}
                          <button
                            onClick={() => handleReorder(order)}
                            className="w-full sm:w-auto px-3 py-2 border border-[#EE346C] text-[#EE346C] rounded-md hover:bg-[#EE346C] hover:text-white transition-colors font-medium flex-shrink-0 bg-white text-sm sm:text-base"
                          >
                            Reorder
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )
          })}
        </div>
      )}
    </div>
  );
} 