import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { 
  TrendingUp, 
  Clock, 
  ShoppingCart, 
  MessageSquare,
  Bell,
  Search,
  Plus,
  ChevronDown,
  RefreshCw
} from 'lucide-react';
import VendorLayout from '@/components/Vendor/VendorLayout';
import { getVendorEarnings, getMockVendorEarnings } from '@/services/vendorService';

interface EarningsData {
  totalEarnings: number;
  balance: number;
  totalSalesValue: number;
  monthlySales: Array<{
    month: string;
    totalSales: number;
    customerCost: number;
  }>;
  topCountries: Array<{
    country: string;
    total: number;
  }>;
  earningsTable: Array<{
    date: string;
    status: string;
    productSalesCount: number;
    earnings: number;
  }>;
}

const VendorEarnings: React.FC = () => {
  const router = useRouter();
  const { isAuthenticated } = useSelector((state: RootState) => state.vendor);
  const [isInitialized, setIsInitialized] = useState(false);
  const [earningsData, setEarningsData] = useState<EarningsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/vendor/login');
      return;
    }
    setIsInitialized(true);
    fetchEarningsData();
  }, [isAuthenticated, router]);

  const fetchEarningsData = async () => {
    try {
      setLoading(true);
      const response = await getVendorEarnings();
      setEarningsData(response.data);
    } catch {
      // Use mock data as fallback for development
      const mockResponse = getMockVendorEarnings();
      setEarningsData(mockResponse.data);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    if (amount >= 1000000) {
      return `$${(amount / 1000000).toFixed(1)}m`;
    } else if (amount >= 1000) {
      return `$${(amount / 1000).toFixed(0)}k`;
    }
    return `$${amount.toFixed(2)}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  if (!isInitialized) {
    return null;
  }

  if (loading) {
    return (
      <VendorLayout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#5A9BD8]"></div>
        </div>
      </VendorLayout>
    );
  }

  return (
    <VendorLayout>
      <div className="p-6 bg-[#f4f8fb] min-h-screen">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-[#357ab8]">Scheduled</h1>
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Search here"
                className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5A9BD8]"
              />
            </div>
            <button className="bg-[#5A9BD8] text-white px-4 py-2 rounded-lg flex items-center space-x-2">
              <Plus className="h-4 w-4" />
              <span>Add product</span>
            </button>
            <button className="text-gray-500 hover:text-gray-700">
              <MessageSquare className="h-5 w-5" />
            </button>
            <button className="text-gray-500 hover:text-gray-700">
              <Bell className="h-5 w-5" />
            </button>
            <div className="w-8 h-8 bg-[#5A9BD8] rounded-full flex items-center justify-center text-white font-semibold">
              SD
            </div>
          </div>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Earning Card */}
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <TrendingUp className="h-6 w-6 text-yellow-600" />
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-600">Earning</h3>
                  <p className="text-2xl font-bold text-gray-900">
                    {earningsData ? formatCurrency(earningsData.totalEarnings) : '$128k'}
                  </p>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2 text-green-600">
              <TrendingUp className="h-4 w-4" />
              <span className="text-sm font-medium">37.8% this week</span>
            </div>
          </div>

          {/* Balance Card */}
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                  <Clock className="h-6 w-6 text-red-600" />
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-600">Balance</h3>
                  <p className="text-2xl font-bold text-gray-900">
                    {earningsData ? formatCurrency(earningsData.balance) : '$512.64'}
                  </p>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2 text-red-600">
              <TrendingUp className="h-4 w-4 transform rotate-180" />
              <span className="text-sm font-medium">37.8% this week</span>
            </div>
          </div>

          {/* Total Sales Card */}
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <ShoppingCart className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-600">Total value of sales</h3>
                  <p className="text-2xl font-bold text-gray-900">
                    {earningsData ? formatCurrency(earningsData.totalSalesValue) : '$64k'}
                  </p>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2 text-green-600">
              <TrendingUp className="h-4 w-4" />
              <span className="text-sm font-medium">37.8% this week</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Month vs Sales & Cost Chart */}
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-[#357ab8]">Month vs Sales & Cost</h3>
              <div className="flex items-center space-x-2">
                <select className="text-sm border border-gray-200 rounded-lg px-3 py-1 focus:outline-none focus:ring-2 focus:ring-[#5A9BD8]">
                  <option>All time</option>
                </select>
                <ChevronDown className="h-4 w-4 text-gray-400" />
              </div>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={earningsData?.monthlySales || []}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis 
                    dataKey="month" 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fill: '#6b7280' }}
                  />
                  <YAxis 
                    yAxisId="left"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fill: '#6b7280' }}
                    tickFormatter={(value) => `$${(value / 1000000).toFixed(1)}m`}
                  />
                  <YAxis 
                    yAxisId="right"
                    orientation="right"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fill: '#6b7280' }}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'white', 
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px'
                    }}
                  />
                  <Legend />
                  <Bar 
                    yAxisId="left"
                    dataKey="totalSales" 
                    fill="#1e40af" 
                    radius={[4, 4, 0, 0]}
                    name="Total Sales"
                  />
                  <Bar 
                    yAxisId="right"
                    dataKey="customerCost" 
                    fill="#3b82f6" 
                    radius={[4, 4, 0, 0]}
                    name="Customer Cost"
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Top Countries */}
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-[#357ab8] mb-6">Top countries</h3>
            <div className="space-y-4">
              {earningsData?.topCountries.map((country, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-6 bg-gray-200 rounded flex items-center justify-center text-xs font-medium">
                      {country.country === 'United States' ? 'US' : 
                       country.country === 'Germany' ? 'DE' :
                       country.country === 'Netherlands' ? 'NL' :
                       country.country === 'United Kingdom' ? 'UK' :
                       country.country === 'Italy' ? 'IT' :
                       country.country === 'Vietnam' ? 'VN' : '??'}
                    </div>
                    <span className="text-sm font-medium text-gray-900">{country.country}</span>
                  </div>
                  <span className="text-sm font-semibold text-gray-900">
                    ${country.total.toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Earnings Table */}
        <div className="bg-white rounded-xl shadow-sm">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-[#357ab8]">Earnings</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Product sales count
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Earnings
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {earningsData?.earningsTable.slice(0, 7).map((row, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatDate(row.date)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        row.status === 'Paid' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {row.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {row.productSalesCount.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                      ${row.earnings.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="p-4 border-t border-gray-200">
            <button 
              onClick={fetchEarningsData}
              className="flex items-center space-x-2 text-[#5A9BD8] hover:text-[#357ab8] transition-colors"
            >
              <RefreshCw className="h-4 w-4" />
              <span>Load more</span>
            </button>
          </div>
        </div>
      </div>
    </VendorLayout>
  );
};

export default VendorEarnings; 