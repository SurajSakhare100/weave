import VendorLayout from '@/components/VendorLayout';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../store/store';
import { setDashboard, setLoading, setError } from '../../features/vendor/vendorSlice';
import { getVendorDashboard } from '../../services/vendorService';
import { isVendorAuthenticated } from '../../utils/vendorAuth';
import { 
  Package, 
  ShoppingCart, 
  DollarSign, 
  TrendingUp, 
  Clock, 
  CheckCircle,
  AlertCircle,
  Plus,
  Eye
} from 'lucide-react';

// Product interface
interface Product {
  _id: string;
  name: string;
  slug: string;
  price: number;
  mrp: number;
  discount: number;
  vendorId: string; // ObjectId reference to Vendor
  vendor: boolean;
  available: string;
  category: string;
  categorySlug?: string;
  srtDescription?: string;
  description?: string;
  seoDescription?: string;
  seoKeyword?: string;
  seoTitle?: string;
  pickup_location?: string;
  return: boolean;
  cancellation: boolean;
  uni_id_1?: string;
  uni_id_2?: string;
  files: string[];
  variant: boolean;
  variantDetails: Array<{
    size: string;
    price: number;
    mrp: number;
    stock: number;
  }>;
  currVariantSize?: string;
  createdAt: string;
  updatedAt: string;
}

export default function VendorDashboard() {
  const router = useRouter();
  const dispatch = useDispatch();
  const { profile, dashboard, loading, error } = useSelector((state: RootState) => state.vendor);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    // Check authentication
    if (!isVendorAuthenticated()) {
      router.push('/vendor/login');
      return;
    }

    // Load dashboard data
    const loadDashboard = async () => {
      try {
        dispatch(setLoading(true));
        const data = await getVendorDashboard();
        dispatch(setDashboard(data?.data || {}));
      } catch (error: any) {
        const errorMessage = error.response?.data?.message || 'Failed to load dashboard';
        dispatch(setError(errorMessage));
      } finally {
        dispatch(setLoading(false));
        setIsInitialized(true);
      }
    };

    loadDashboard();
  }, [dispatch, router]);

  if (!isInitialized) {
    return (
      <VendorLayout>
        <div className="min-h-screen bg-[#faf5f2] flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500"></div>
        </div>
      </VendorLayout>
    );
  }

  // if (!profile) {
  //   return (
  //     <VendorLayout>
  //       <div className="min-h-screen bg-[#faf5f2] flex items-center justify-center">
  //         <div className="text-center">
  //           <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
  //           <p className="text-gray-600">Please log in to access your dashboard.</p>
  //           <button
  //             onClick={() => router.push('/vendor/login')}
  //             className="mt-4 bg-pink-500 text-white px-6 py-2 rounded-lg hover:bg-pink-600 transition-colors"
  //           >
  //             Go to Login
  //           </button>
  //         </div>
  //       </div>
  //     </VendorLayout>
  //   );
  // }

  // Safe access to dashboard data with fallbacks
  const productStats = dashboard?.productStats || {
    totalProducts: 0,
    activeProducts: 0,
    inactiveProducts: 0
  };
  const orderStats = dashboard?.orderStats || {
    totalOrders: 0,
    totalRevenue: 0,
    pendingOrders: 0,
    completedOrders: 0
  };
  const recentProducts = (dashboard?.recentProducts || []) as Product[];
  const recentOrders = dashboard?.recentOrders || [];

  const getImageUrl = (files: string[], index: number = 0) => {
    if (files && files.length > index) {
      return `http://localhost:5000/uploads/${files[index]}`;
    }
    return '/products/product.png';
  };

  return (
    <VendorLayout>
      <section className="py-16 bg-[#faf5f2] min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              Welcome back, {profile?.name || 'Vendor'}!
            </h1>
            <p className="text-gray-600">Here's what's happening with your business today.</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center">
              <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
              <span className="text-red-700 text-sm">{error}</span>
            </div>
          )}

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Package className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Products</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {productStats?.totalProducts || 0}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <ShoppingCart className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Orders</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {orderStats?.totalOrders || 0}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <div className="flex items-center">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <DollarSign className="h-6 w-6 text-yellow-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                  <p className="text-2xl font-bold text-gray-900">
                    ₹{(orderStats?.totalRevenue || 0).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <TrendingUp className="h-6 w-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Active Products</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {productStats?.activeProducts || 0}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Order Status Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-800">Order Status</h3>
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Clock className="h-5 w-5 text-yellow-500 mr-2" />
                    <span className="text-gray-600">Pending Orders</span>
                  </div>
                  <span className="font-semibold text-gray-900">
                    {orderStats?.pendingOrders || 0}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                    <span className="text-gray-600">Completed Orders</span>
                  </div>
                  <span className="font-semibold text-gray-900">
                    {orderStats?.completedOrders || 0}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-800">Product Status</h3>
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                    <span className="text-gray-600">Active Products</span>
                  </div>
                  <span className="font-semibold text-gray-900">
                    {productStats?.activeProducts || 0}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
                    <span className="text-gray-600">Inactive Products</span>
                  </div>
                  <span className="font-semibold text-gray-900">
                    {productStats?.inactiveProducts || 0}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Products */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 mb-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-800">Recent Products</h3>
              <button
                onClick={() => router.push('/vendor/products')}
                className="flex items-center text-pink-600 hover:text-pink-700 font-medium"
              >
                <Plus className="h-4 w-4 mr-1" />
                Add Product
              </button>
            </div>
            
            {recentProducts.length === 0 ? (
              <div className="text-center py-8">
                <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 mb-4">No products yet</p>
                <button
                  onClick={() => router.push('/vendor/products')}
                  className="bg-pink-500 text-white px-4 py-2 rounded-lg hover:bg-pink-600 transition-colors"
                >
                  Add Your First Product
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {recentProducts.slice(0, 6).map((product) => (
                  <div key={product._id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-center space-x-3">
                      <img
                        src={getImageUrl(product.files)}
                        alt={product.name}
                        className="w-12 h-12 object-cover rounded-lg"
                        onError={(e) => {
                          e.currentTarget.src = '/products/product.png';
                        }}
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-medium text-gray-900 truncate">{product.name}</h4>
                        <p className="text-sm text-gray-500">₹{product.price}</p>
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          product.available === 'true' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {product.available === 'true' ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                      <button
                        onClick={() => router.push(`/products/${product._id}`)}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent Orders */}
          {recentOrders.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-800">Recent Orders</h3>
                <button
                  onClick={() => router.push('/vendor/orders')}
                  className="text-pink-600 hover:text-pink-700 font-medium"
                >
                  View All Orders
                </button>
              </div>
              
              <div className="space-y-4">
                {recentOrders.slice(0, 5).map((order: any) => (
                  <div key={order._id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">Order #{order.orderId}</p>
                      <p className="text-sm text-gray-500">₹{order.totalAmount}</p>
                    </div>
                    <div className="text-right">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        order.status === 'completed' 
                          ? 'bg-green-100 text-green-800'
                          : order.status === 'pending'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {order.status}
                      </span>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>
    </VendorLayout>
  );
} 