import Layout from '@/components/Layout';
import { useState, useEffect } from 'react';
import { getUserOrders } from '../../services/userService';
import Link from 'next/link';
import { useRequireUserAuth } from '../../hooks/useRequireUserAuth';
import { toast } from 'sonner';

interface Order {
  _id: string;
  orderId?: string;
  createdAt: string;
  status: string;
  totalPrice: number;
  orderItems?: Array<{
    product: {
      name: string;
      price: number;
    };
    quantity: number;
  }>;
  shippingAddress?: {
    address: string;
    city: string;
  };
}

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

  console.log('Orders page render:', { loggedIn, ordersCount: orders.length });

  if (loading) {
    return (
      <Layout>
        <section className="py-16 bg-[#faf5f2] min-h-screen">
          <div className="max-w-3xl mx-auto px-4">
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500"></div>
            </div>
          </div>
        </section>
      </Layout>
    );
  }

  return (
    <Layout>
      <section className="py-16 bg-[#faf5f2] min-h-screen">
        <div className="max-w-3xl mx-auto px-4">
          <h1 className="text-3xl font-bold text-gray-800 mb-8 text-center">Order History</h1>
          
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
            <div className="flex flex-col items-center justify-center py-20">
              <span className="text-6xl mb-4">📦</span>
              <p className="text-lg text-gray-500 mb-4">No orders found.</p>
              <Link href="/products" className="bg-pink-500 text-white px-6 py-2 rounded hover:bg-pink-600 transition">Start Shopping</Link>
            </div>
          ) : (
            <div className="space-y-6">
              {orders.map(order => (
                <div key={order._id} className="bg-white rounded-2xl shadow p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <div className="font-semibold text-lg">Order #{order.orderId || order._id}</div>
                      <div className="text-sm text-gray-500">Date: {new Date(order.createdAt).toLocaleDateString()}</div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                      order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      order.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {order.status || 'Pending'}
                    </span>
                  </div>
                  <div className="mb-2">Total: <span className="font-bold">₹{order.totalPrice}</span></div>
                  <div className="text-sm text-gray-600">
                    Items: {order.orderItems?.length || 0} items
                  </div>
                  {order.shippingAddress && (
                    <div className="mt-2 text-sm text-gray-600">
                      <div>Shipping to: {order.shippingAddress.address}, {order.shippingAddress.city}</div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </Layout>
  );
} 