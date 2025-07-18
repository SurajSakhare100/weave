import React, { useState, useEffect } from 'react';
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend } from 'recharts';
import { 
  TrendingUp, 
  Clock, 
  ShoppingCart, 
  ChevronDown, 
  RefreshCw
} from 'lucide-react';
import VendorLayout from '@/components/VendorLayout';
import LoadingSpinner from '@/components/LoadingSpinner';
import ErrorBoundary from '@/components/ErrorBoundary';
import { getVendorEarnings } from '@/services/vendorService';
import { useRequireVendorAuth } from '@/hooks/useRequireVendorAuth';
import Image from 'next/image';

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

// Country Item Component
const CountryItem: React.FC<{ country: { country: string; total: number }; index: number }> = ({ country }) => {
  const [flagUrl, setFlagUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const getCountryCode = (countryName: string) => {
    const countryMap: { [key: string]: string } = {
      'United States': 'us',
      'Germany': 'de',
      'Netherlands': 'nl',
      'United Kingdom': 'gb',
      'Italy': 'it',
      'Vietnam': 'vn',
      'Canada': 'ca',
      'France': 'fr',
      'Spain': 'es',
      'Australia': 'au',
      'Japan': 'jp',
      'China': 'cn',
      'India': 'in',
      'Brazil': 'br',
      'Mexico': 'mx',
      'NY': 'ny',
      'CA': 'us'
    };
    return countryMap[countryName] || 'un';
  };

  const getFlagEmoji = async (countryCode: string): Promise<string | null> => {
    try {
      // Use a more reliable flag API with better error handling
      const url = `https://flagcdn.com/w40/${countryCode.toLowerCase()}.png`;
      
      // Check if the image exists by trying to load it
      return new Promise<string | null>((resolve) => {
        const img = new window.Image();
        img.onload = () => resolve(url);
        img.onerror = () => {
          console.warn(`Flag not found for country code: ${countryCode}`);
          resolve(null);
        };
        img.src = url;
      });
    } catch (error) {
      console.error('Error fetching flag:', error);
      return null;
    }
  };

  useEffect(() => {
    const fetchFlag = async () => {
      try {
        setIsLoading(true);
        const countryCode = getCountryCode(country.country);
        const url = await getFlagEmoji(countryCode);
        setFlagUrl(url);
      } catch (error) {
        console.error('Error fetching flag for', country.country, error);
        setFlagUrl(null);
      } finally {
        setIsLoading(false);
      }
    };
    fetchFlag();
  }, [country.country]);

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-3">
        <div className="w-8 h-6 bg-gray-100 rounded flex items-center justify-center overflow-hidden">
          {isLoading ? (
            <div className="w-4 h-4 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin"></div>
          ) : flagUrl ? (
            <Image 
              src={flagUrl} 
              alt={`${country.country} flag`}
              width={32}
              height={24}
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-lg">🌍</span>
          )}
        </div>
        <span className="text-sm font-medium text-gray-900">{country.country}</span>
      </div>
      <span className="text-sm font-semibold text-gray-900">
        ${country.total.toLocaleString()}
      </span>
    </div>
  );
};

const VendorRevenueEarnings: React.FC = () => {
  const { isAuthenticated, isInitialized } = useRequireVendorAuth();
  const [earningsData, setEarningsData] = useState<EarningsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [timePeriod, setTimePeriod] = useState('all');



  // Function to generate all months in a date range
  const generateMonthRange = (startDate: Date, endDate: Date) => {
    const months = [];
    const current = new Date(startDate);
    
    while (current <= endDate) {
      months.push(new Date(current));
      current.setMonth(current.getMonth() + 1);
    }
    
    return months;
  };

  // Function to filter data based on time period
  const getFilteredData = () => {
    if (!earningsData) return null;

    const now = new Date();
    let startDate: Date;
    const endDate = now;

    switch (timePeriod) {
      case '1month':
        startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        break;
      case '3months':
        startDate = new Date(now.getFullYear(), now.getMonth() - 3, 1);
        break;
      case '6months':
        startDate = new Date(now.getFullYear(), now.getMonth() - 6, 1);
        break;
      case '1year':
        startDate = new Date(now.getFullYear() - 1, now.getMonth(), 1);
        break;
      default:
        return earningsData;
    }

    // Generate all months in the range
    const allMonths = generateMonthRange(startDate, endDate);
    
    // Create a map of existing monthly sales
    const existingSalesMap = new Map();
    earningsData.monthlySales.forEach(item => {
      try {
        const itemDate = new Date(item.month);
        if (itemDate >= startDate && itemDate <= endDate) {
          const monthKey = itemDate.toLocaleString('default', { month: 'short', year: 'numeric' });
          existingSalesMap.set(monthKey, item);
        }
      } catch {
        console.error('Error parsing date:', item.month);
      }
    });

    // Create complete monthly sales array with 0 for missing months
    const completeMonthlySales = allMonths.map(date => {
      const monthKey = date.toLocaleString('default', { month: 'short', year: 'numeric' });
      const existingData = existingSalesMap.get(monthKey);
      
      return existingData || {
        month: monthKey,
        totalSales: 0,
        customerCost: 0
      };
    });

    // Filter earnings table
    const filteredEarningsTable = earningsData.earningsTable.filter(item => {
      try {
        const itemDate = new Date(item.date);
        return itemDate >= startDate && itemDate <= endDate;
      } catch {
        return true; // Keep item if date parsing fails
      }
    });



    // Recalculate totals based on filtered data
    const filteredTotalEarnings = filteredEarningsTable
      .filter(item => item.status === 'Paid')
      .reduce((sum, item) => sum + item.earnings, 0);

    const filteredBalance = filteredEarningsTable
      .filter(item => item.status === 'Pending')
      .reduce((sum, item) => sum + item.earnings, 0);

    const filteredTotalSalesValue = filteredEarningsTable
      .reduce((sum, item) => sum + item.earnings, 0);

    return {
      ...earningsData,
      totalEarnings: filteredTotalEarnings,
      balance: filteredBalance,
      totalSalesValue: filteredTotalSalesValue,
      monthlySales: completeMonthlySales,
      earningsTable: filteredEarningsTable
    };
  };

  const filteredData = getFilteredData();

  useEffect(() => {
    if (isInitialized && isAuthenticated) {
      fetchEarningsData();
    }
  }, [isInitialized, isAuthenticated]);



  const fetchEarningsData = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setIsRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);
      
      const response = await getVendorEarnings();
      
      if (response && response.success && response.data) {
        setEarningsData(response.data);
      } else {
        throw new Error('Failed to load earnings data');
      }
    } catch (error: unknown) {
      console.error('Failed to fetch earnings data:', error);
      setError('Failed to load earnings data. Please try again.');
    } finally {
      setLoading(false);
      setIsRefreshing(false);
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

  if (!isInitialized || !isAuthenticated) {
    return null;
  }

  if (loading) {
    return (
      <VendorLayout>
        <div className="flex justify-center items-center h-64">
          <LoadingSpinner size="lg" text="Loading earnings data..." />
        </div>
      </VendorLayout>
    );
  }

  return (
    <ErrorBoundary>
      <VendorLayout>
        <div className="p-6 bg-[#f4f8fb] min-h-screen">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-[#5A9BD8]">Earnings</h1>
            {error && (
              <p className="text-red-600 text-sm mt-1">{error}</p>
            )}

          </div>
          <div className="flex items-center space-x-4">
            <button 
              onClick={() => fetchEarningsData(true)}
              disabled={isRefreshing}
              className="bg-[#5A9BD8] text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-[#5A9BD8] transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span>{isRefreshing ? 'Refreshing...' : 'Refresh'}</span>
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
                    {filteredData ? formatCurrency(filteredData.totalEarnings) : 'Loading...'}
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
                    {filteredData ? formatCurrency(filteredData.balance) : 'Loading...'}
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
                    {filteredData ? formatCurrency(filteredData.totalSalesValue) : 'Loading...'}
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
              <h3 className="text-lg font-semibold text-[#5A9BD8]">Month vs Sales & Cost</h3>
              <div className="relative">
                <select 
                  className="appearance-none text-sm border rounded-lg px-4 py-2 pr-8 focus:outline-none focus:ring-2 focus:ring-[#5A9BD8] border-[#5A9BD8]  text-[#5A9BD8] bg-white hover:border-gray-400 transition-colors cursor-pointer "
                  value={timePeriod}
                  onChange={(e) => {
                    setTimePeriod(e.target.value);
                  }}
                >
                  <option value="all">All time</option>
                  <option value="1year">Last 1 year</option>
                  <option value="6months">Last 6 months</option>
                  <option value="3months">Last 3 months</option>
                  <option value="1month">Last month</option>
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                  <ChevronDown className="h-4 w-4 text-gray-400" />
                </div>
              </div>
            </div>
            <div className="h-64">
              {filteredData?.monthlySales && filteredData.monthlySales.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={filteredData.monthlySales}>
                    <CartesianGrid stroke="#f0f0f0" strokeWidth={0} />
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
                      tickFormatter={(value) => {
                        if (value >= 1000000) {
                          return `$${(value / 1000000).toFixed(1)}M`;
                        } else if (value >= 1000) {
                          return `$${(value / 1000).toFixed(0)}K`;
                        } else {
                          return `$${value.toLocaleString()}`;
                        }
                      }}
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
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                      }}
                      formatter={(value, name) => [
                        name === 'totalSales' ? `$${value.toLocaleString()}` : value,
                        name === 'totalSales' ? 'Total Sales' : 'Customer Cost'
                      ]}
                    />
                    <Legend />
                    <Bar 
                      yAxisId="left"
                      dataKey="totalSales" 
                      fill="#5A9BD8" 
                      radius={[8, 8, 0, 0]}
                      name="Total Sales"
                      width={40}
                    />
                    <Bar 
                      yAxisId="right"
                      dataKey="customerCost" 
                      fill="#BFD5EA"    
                      radius={[8,  8, 0, 0]}
                      name="Customer Cost"
                      width={20}
                    />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-gray-500">
                  <p>No monthly sales data available</p>
                </div>
              )}
            </div>
          </div>

          {/* Top Countries */}
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-[#5A9BD8] mb-6">Top countries</h3>
            <div className="space-y-4">
              {filteredData?.topCountries && filteredData.topCountries.length > 0 ? (
                filteredData.topCountries.map((country, index) => (
                  <CountryItem key={index} country={country} index={index} />
                ))
              ) : (
                <div className="text-center text-gray-500 py-8">
                  <p>No country data available</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Earnings Table */}
        <div className="bg-white rounded-xl shadow-sm">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-[#5A9BD8]">Earnings</h3>
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
                {filteredData?.earningsTable && filteredData.earningsTable.length > 0 ? (
                  filteredData.earningsTable.slice(0, 7).map((row, index) => (
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
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                      No earnings data available
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <div className="p-4 border-t border-gray-200">
            <button 
              onClick={() => fetchEarningsData(true)}
              disabled={isRefreshing}
              className="flex items-center space-x-2 text-[#5A9BD8] hover:text-[#5A9BD8] transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span>{isRefreshing ? 'Refreshing...' : 'Refresh data'}</span>
            </button>
          </div>
        </div>
              </div>
      </VendorLayout>
    </ErrorBoundary>
  );
};

export default VendorRevenueEarnings; 