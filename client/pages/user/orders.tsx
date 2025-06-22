import Layout from '@/components/Layout';
import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../store/store';
import { getUserOrders } from '../../services/userService';
import Link from 'next/link';

export default function UserOrdersPage() {
  const { isAuthenticated } = useSelector((state: RootState) => state.user);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        if (isAuthenticated) {
          const userOrders = await getUserOrders();
          setOrders(userOrders);
        }
      } catch (error) {
        console.error('Error fetching orders:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    return (
      <Layout>
        <section className="py-16 bg-[#faf5f2] min-h-screen">
          <div className="max-w-3xl mx-auto px-4">
            <div className="flex flex-col items-center justify-center py-20">
              <span className="text-6xl mb-4">🔒</span>
              <p className="text-lg text-gray-500 mb-4">Please login to view your orders.</p>
              <Link href="/login" className="bg-pink-500 text-white px-6 py-2 rounded hover:bg-pink-600 transition">Login</Link>
            </div>
          </div>
        </section>
      </Layout>
    );
  }

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
          {orders.length === 0 ? (
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
                      order.status === 'completed' ? 'bg-green-100 text-green-800' :
                      order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      order.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {order.status}
                    </span>
                  </div>
                  <div className="mb-2">Total: <span className="font-bold">₹{order.totalAmount}</span></div>
                  <div className="text-sm text-gray-600">
                    Items: {order.items?.length || 0} items
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