import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  ShoppingCart, 
  Store,
  Calendar,
  Filter,
  Download,
  Plus
} from 'lucide-react';
import { getSalesAnalytics, getVendorSales } from '@/services/vendorService';
import SimpleSalesChart from './SimpleSalesChart';
import SimpleSalesFilters from './SimpleSalesFilters';
import SimpleSalesTable from './SimpleSalesTable';
import SimpleRecordOfflineSaleModal from './SimpleRecordOfflineSaleModal';
import EmptyState from '@/components/ui/EmptyState';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import SalesChart from './SalesChart';


const SalesDashboard = () => {
  const [analytics, setAnalytics] = useState<any>(null);
  const [sales, setSales] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [salesLoading, setSalesLoading] = useState(false);
  const [showRecordModal, setShowRecordModal] = useState(false);
  const [filters, setFilters] = useState({
    saleType: 'all',
    startDate: '',
    endDate: '',
    page: 1,
    limit: 20
  });

  const fetchAnalytics = async () => {
    try {
      const response = await getSalesAnalytics({ days: 30 });
      setAnalytics(response.data);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    }
  };

  const fetchSales = async () => {
    setSalesLoading(true);
    try {
      const response = await getVendorSales(filters as any);
      setSales(response.data.sales || []);
    } catch (error) {
      console.error('Error fetching sales:', error);
    } finally {
      setSalesLoading(false);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchAnalytics(), fetchSales()]);
      setLoading(false);
    };
    
    loadData();
  }, []);

  useEffect(() => {
    fetchSales();
  }, [filters]);

  const handleFilterChange = (newFilters: any) => {
    setFilters(prev => ({ ...prev, ...newFilters, page: 1 }));
  };

  const handleSaleRecorded = () => {
    fetchAnalytics();
    fetchSales();
    setShowRecordModal(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const summaryCards = [
    {
      title: 'Total Sales',
      value: (analytics?.summary?.find((s: any) => s._id === 'online')?.totalSales || 0 )+ 
             (analytics?.summary?.find((s: any) => s._id === 'offline')?.totalSales || 0),
      change: '+12.5%',
      icon: DollarSign,
      color: 'text-green-600'
    },
    {
      title: 'Online Sales',
      value: analytics?.summary?.find((s: any) => s._id === 'online')?.totalSales || 0,
      change: '+8.2%',
      icon: ShoppingCart,
      color: 'text-blue-600'
    },
    {
      title: 'Offline Sales',
      value: analytics?.summary?.find((s: any) => s._id === 'offline')?.totalSales || 0,
      change: '+18.7%',
      icon: Store,
      color: 'text-purple-600'
    },
    {
      title: 'Total Orders',
      value: (analytics?.summary?.find((s: any) => s._id === 'online')?.salesCount || 0) + 
            (analytics?.summary?.find((s: any) => s._id === 'offline')?.salesCount || 0),
      change: '+15.3%',
      icon: Calendar,
      color: 'text-orange-600'
    }
  ];

  return (
    <div className="space-y-6 p-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Sales Management</h1>
          <p className="text-gray-600 mt-1">Track and manage your online and offline sales</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            Export
          </Button>
          <Button onClick={() => setShowRecordModal(true)} className="gap-2 bg-blue-500">
            <Plus className="h-4 w-4" />
            Record Offline Sale
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {summaryCards.map((card, index) => {
          const Icon = card.icon;
          return (
            <Card key={index}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{card.title}</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {typeof card.value === 'number' 
                        ? `₹${card.value.toLocaleString()}` 
                        : card.value
                      }
                    </p>
                    <div className="flex items-center gap-1 mt-1">
                      <TrendingUp className="h-3 w-3 text-green-500" />
                      <span className="text-xs text-green-600 font-medium">{card.change}</span>
                    </div>
                  </div>
                  <div className={`p-3 rounded-lg bg-gray-50 ${card.color}`}>
                    <Icon className="h-6 w-6" />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Main Content */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="sales">Sales History</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Sales Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Sales Trend (Last 30 Days)</CardTitle>
            </CardHeader>
            <CardContent>
              <SalesChart data={analytics?.dailySales || []} />
            </CardContent>
          </Card>

          {/* Top Products */}
          <Card>
            <CardHeader>
              <CardTitle>Top Selling Products</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analytics?.topProducts?.slice(0, 5).map((product: any, index: number) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h4 className="font-medium">{product.productName}</h4>
                      <p className="text-sm text-gray-600">{product.salesCount} sales</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">₹{product.totalRevenue.toLocaleString()}</p>
                      <p className="text-sm text-gray-600">{product.totalQuantity} units</p>
                    </div>
                  </div>
                ))}
                {(!analytics?.topProducts || analytics.topProducts.length === 0) && (
                  <EmptyState
                    title="No sales data"
                    description="Start recording sales to see your top products"
                  />
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sales" className="space-y-6">
          {/* Filters */}
          <Card>
            <CardContent className="p-6">
          <SimpleSalesFilters 
            filters={filters} 
            onFilterChange={handleFilterChange}
          />
            </CardContent>
          </Card>

          {/* Sales Table */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Sales History</CardTitle>
                <Badge variant="outline">
                  {sales.length} sales
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <SimpleSalesTable 
                sales={sales}
                loading={salesLoading}
                onRefresh={fetchSales}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Online vs Offline Comparison */}
            <Card>
              <CardHeader>
                <CardTitle>Sales Channel Comparison</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analytics?.summary?.map((item: any) => (
                    <div key={item._id} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="capitalize font-medium">{item._id} Sales</span>
                        <span className="font-semibold">₹{item.totalSales.toLocaleString()}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${
                            item._id === 'online' ? 'bg-blue-500' : 'bg-purple-500'
                          }`}
                          style={{
                            width: `${(item.totalSales / Math.max(...analytics.summary.map((s: any) => s.totalSales))) * 100}%`
                          }}
                        />
                      </div>
                      <div className="flex justify-between text-sm text-gray-600">
                        <span>{item.salesCount} orders</span>
                        <span>Avg: ₹{item?.avgSaleValue?.toFixed(0)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Performance Metrics */}
            <Card>
              <CardHeader>
                <CardTitle>Performance Metrics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="font-medium">Average Order Value</span>
                    <span className="text-lg font-semibold">
                      ₹{analytics?.summary?.reduce((acc: number, item: any) => 
                        acc + item.avgSaleValue, 0) / (analytics?.summary?.length || 1) || 0}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="font-medium">Total Revenue</span>
                    <span className="text-lg font-semibold text-green-600">
                      ₹{analytics?.summary?.reduce((acc: number, item: any) => 
                        acc + item.totalSales, 0) || 0}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="font-medium">Growth Rate</span>
                    <span className="text-lg font-semibold text-green-600">+12.5%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sales Trend Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Sales Trend (Last 30 Days)</CardTitle>
            </CardHeader>
            <CardContent>
              <SimpleSalesChart 
                data={analytics?.dailySales || []}
                type="line"
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports">
          <Card>
            <CardHeader>
              <CardTitle>Sales Reports</CardTitle>
              <p className="text-gray-600">Generate detailed sales reports</p>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Reports Coming Soon</h3>
                <p className="text-gray-600">
                  Advanced reporting features will be available in the next update
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Record Sale Modal */}
      <SimpleRecordOfflineSaleModal
        open={showRecordModal}
        onClose={() => setShowRecordModal(false)}
        onSaleRecorded={handleSaleRecorded}
      />
    </div>
  );
};

export default SalesDashboard;
