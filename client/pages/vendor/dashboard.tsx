import VendorLayout from '@/components/Vendor/VendorLayout';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../store/store';
import { setDashboard, setLoading, setError } from '../../features/vendor/vendorSlice';
import { getVendorToken } from '../../utils/vendorAuth';

import Image from 'next/image';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend } from 'recharts';

// Mock data for charts and widgets
const customerGrowthData = [
  { month: 'Jan', new: 8000, returning: 4000 },
  { month: 'Feb', new: 9000, returning: 4200 },
  { month: 'Mar', new: 9500, returning: 4300 },
  { month: 'Apr', new: 10000, returning: 4500 },
  { month: 'May', new: 12000, returning: 4700 },
  { month: 'Jun', new: 13000, returning: 4800 },
  { month: 'Jul', new: 14000, returning: 5000 },
  { month: 'Aug', new: 15000, returning: 5200 },
  { month: 'Sep', new: 16000, returning: 5400 },
  { month: 'Oct', new: 17000, returning: 5600 },
  { month: 'Nov', new: 18000, returning: 5800 },
  { month: 'Dec', new: 19000, returning: 6000 },
];
const salesCostData = [
  { month: 'Jan', sales: 8.1, cost: 6.1 },
  { month: 'Feb', sales: 7.2, cost: 5.2 },
  { month: 'Mar', sales: 6.8, cost: 4.8 },
  { month: 'Apr', sales: 7.5, cost: 5.5 },
  { month: 'May', sales: 8.4, cost: 6.4 },
  { month: 'Jun', sales: 7.9, cost: 5.9 },
  { month: 'Jul', sales: 8.7, cost: 6.7 },
  { month: 'Aug', sales: 7.3, cost: 5.3 },
  { month: 'Sep', sales: 8.8, cost: 6.8 },
  { month: 'Oct', sales: 7.6, cost: 5.6 },
  { month: 'Nov', sales: 8.2, cost: 6.2 },
  { month: 'Dec', sales: 7.8, cost: 5.8 },
];
const comments = [
  { name: 'Devon Lane', avatar: '/products/product.png', comment: 'Love the minimalist design.', date: 'Apr 11' },
  { name: 'Jenny Wilson', avatar: '/products/product.png', comment: 'Goes with literally everything.', date: 'Apr 11' },
];
const popularProducts = [
  { name: 'Bag name', earning: '₹3,250.13', image: '/products/product.png' },
  { name: 'Bag name', earning: '₹3,250.13', image: '/products/product.png' },
  { name: 'Bag name', earning: '₹3,250.13', image: '/products/product.png' },
];

export default function VendorDashboard() {
  const router = useRouter();
  const dispatch = useDispatch();
  const { } = useSelector((state: RootState) => state.vendor);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    // Check authentication using the new approach
    const token = getVendorToken();
    if (!token) {
      router.push('/vendor/login');
      return;
    }

    // Load dashboard data
    const loadDashboard = async () => {
      try {
        dispatch(setLoading(true));
        // For now, we'll use mock data since getVendorDashboard doesn't exist
        // You can replace this with actual API call when the endpoint is available
        const mockData = {
          totalCustomers: 68192,
          newCustomers: 291,
          salesGrowth: 37.8
        };
        dispatch(setDashboard(mockData));
      } catch (error: unknown) {
        const err = error as { response?: { data?: { message?: string } } };
        const errorMessage = err.response?.data?.message || 'Failed to load dashboard';
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
        <div className="min-h-screen vendor-bg-secondary flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 vendor-text-important"></div>
        </div>
      </VendorLayout>
    );
  }

  return (
    <VendorLayout>
      <div className="min-h-screen bg-[#f4f8fb] text-black">
        {/* Topbar */}
        <div className="sticky top-0 z-10 bg-[#5A9BD8] px-8 py-4 flex items-center justify-between shadow">
          <div className="flex items-center gap-4">
            <input type="text" placeholder="Search here" className="px-4 py-2 rounded-lg bg-white text-gray-700 w-72 focus:outline-none focus:ring-2 focus:ring-[#357ab8]" />
          </div>
          <div className="flex items-center gap-4">
            <button className="bg-white text-[#5A9BD8] font-semibold px-5 py-2 rounded-lg shadow hover:bg-blue-50 transition-colors">+ Add product</button>
            <div className="w-10 h-10 rounded-full bg-blue-200 flex items-center justify-center font-bold text-[#357ab8]">SD</div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto py-10 px-4 grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main dashboard content */}
          <div className="lg:col-span-2 space-y-8">
            <div>
              <h1 className="text-2xl font-bold text-[#357ab8] mb-6">Dashboard</h1>
              {/* Total customers */}
              <div className="bg-white rounded-2xl shadow p-6 mb-8">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <p className="text-sm text-gray-500 font-medium">Total customers</p>
                    <h2 className="text-3xl font-bold text-[#357ab8]">68,192 customers</h2>
                    <span className="text-green-500 font-semibold text-sm">↑ 37.8% vs. May 8, 2025</span>
                  </div>
                  <select className="bg-[#f4f8fb] border border-gray-200 rounded-lg px-3 py-2 text-sm">
                    <option>All time</option>
                  </select>
                </div>
                <div className="w-full h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={customerGrowthData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Line type="monotone" dataKey="new" stroke="#5A9BD8" strokeWidth={3} dot={false} />
                      <Line type="monotone" dataKey="returning" stroke="#b3d1f2" strokeWidth={3} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex items-center gap-2 mt-4">
                  <span className="text-sm text-gray-500">Welcome <span className="font-semibold text-[#357ab8]">291 customers</span> with a personal message</span>
                  <button className="ml-auto bg-[#5A9BD8] text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors">Send message</button>
                </div>
                <div className="flex items-center gap-4 mt-4">
                  <div className="flex -space-x-2">
                    <Image src="/products/product.png" alt="Customer avatar" width={40} height={40} className="rounded-full border-2 border-white" />
                    <Image src="/products/product.png" alt="Customer avatar" width={40} height={40} className="rounded-full border-2 border-white" />
                    <Image src="/products/product.png" alt="Customer avatar" width={40} height={40} className="rounded-full border-2 border-white" />
                  </div>
                  <span className="text-sm text-gray-500">Courtney Henry, Jenny Wilson, Cameron Williamson</span>
                  <button className="ml-auto text-[#5A9BD8] text-sm font-semibold">View all</button>
                </div>
              </div>
              {/* Month vs Sales & Cost */}
              <div className="bg-white rounded-2xl shadow p-6 mb-8">
                <div className="flex items-center justify-between mb-2">
                  <h2 className="text-lg font-semibold text-[#357ab8]">Month vs Sales & Cost</h2>
                  <select className="bg-[#f4f8fb] border border-gray-200 rounded-lg px-3 py-2 text-sm">
                    <option>All time</option>
                  </select>
                </div>
                <div className="w-full h-56">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={salesCostData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="sales" fill="#5A9BD8" barSize={30} />
                      <Bar dataKey="cost" fill="#b3d1f2" barSize={30} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
            {/* Refund requests */}
            <div className="bg-white rounded-2xl shadow p-6">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-lg font-semibold text-[#357ab8]">Refund requests</h2>
                <span className="text-sm text-gray-500">You have <span className="text-[#357ab8] font-semibold">52 open refund requests</span> to address. This includes <span className="text-[#357ab8] font-semibold">8 new ones</span>.</span>
              </div>
              <button className="mt-4 bg-[#5A9BD8] text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors">Review requests</button>
            </div>
          </div>
          {/* Side widgets */}
          <div className="space-y-8">
            {/* New customers donut */}
            <div className="bg-white rounded-2xl shadow p-6">
              <h2 className="text-lg font-semibold text-[#357ab8] mb-4">New customers</h2>
              <div className="flex flex-col items-center">
                <svg width="120" height="120" viewBox="0 0 120 120">
                  <circle cx="60" cy="60" r="54" fill="#f4f8fb" />
                  <circle cx="60" cy="60" r="54" fill="none" stroke="#5A9BD8" strokeWidth="12" strokeDasharray="339.292" strokeDashoffset="67" />
                  <text x="50%" y="50%" textAnchor="middle" dy=".3em" fontSize="22" fill="#357ab8">20k</text>
                </svg>
                <div className="flex justify-between w-full mt-2">
                  <span className="text-[#357ab8] font-semibold">New customers</span>
                  <span className="text-gray-400">Returning customers</span>
                </div>
              </div>
            </div>
            {/* Comments */}
            <div className="bg-white rounded-2xl shadow p-6">
              <h2 className="text-lg font-semibold text-[#357ab8] mb-4">Comments</h2>
              <div className="space-y-4">
                {comments.map((c, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <Image src={c.avatar} alt={`${c.name} avatar`} width={32} height={32} className="rounded-full" />
                    <div>
                      <span className="font-semibold text-gray-700 text-sm">{c.name}</span>
                      <p className="text-gray-500 text-sm">{c.comment}</p>
                      <span className="text-xs text-gray-400">{c.date}</span>
                    </div>
                  </div>
                ))}
                <button className="mt-2 text-[#5A9BD8] text-sm font-semibold">View all</button>
              </div>
            </div>
            {/* Popular products */}
            <div className="bg-white rounded-2xl shadow p-6">
              <h2 className="text-lg font-semibold text-[#357ab8] mb-4">Popular products</h2>
              <div className="space-y-3">
                {popularProducts.map((p, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <Image src={p.image} alt={`${p.name} product`} width={40} height={40} className="rounded-lg border" />
                    <div className="flex-1">
                      <span className="font-semibold text-gray-700 text-sm">{p.name}</span>
                    </div>
                    <span className="text-[#357ab8] font-semibold">{p.earning}</span>
                  </div>
                ))}
                <button className="mt-2 text-[#5A9BD8] text-sm font-semibold">All products</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </VendorLayout>
  );
} 