import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useGetPlatformSalesAnalyticsQuery, useGetVendorSalesOverviewQuery } from '@/services/adminApi';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { DollarSign, TrendingUp, Users, ShoppingCart } from 'lucide-react';

const AdminSalesDashboard = () => {
  const [filters, setFilters] = useState({ days: 30 });
  
  const { data: analytics, isLoading: analyticsLoading } = useGetPlatformSalesAnalyticsQuery(filters);
  const { data: salesOverview, isLoading: salesLoading } = useGetVendorSalesOverviewQuery({ limit: 20 });

  if (analyticsLoading || salesLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const summaryCards = [
    {
      title: 'Total Sales',
      value: `₹${analytics?.data?.summary?.totalSales?.toLocaleString() || 0}`,
      change: '+12.5%',
      icon: DollarSign
    },
    {
      title: 'Online Sales',
      value: `₹${analytics?.data?.summary?.totalOnlineSales?.toLocaleString() || 0}`,
      change: '+8.2%',
      icon: ShoppingCart
    },
    {
      title: 'Offline Sales',
      value: `₹${analytics?.data?.summary?.totalOfflineSales?.toLocaleString() || 0}`,
      change: '+18.7%',
      icon: TrendingUp
    },
    {
      title: 'Active Vendors',
      value: analytics?.data?.vendorPerformance?.length || 0,
      change: '+5.3%',
      icon: Users
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Sales Overview</h1>
        <p className="text-gray-600 mt-1">Monitor platform-wide sales performance</p>
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
                    <p className="text-2xl font-bold text-gray-900">{card.value}</p>
                    <p className="text-xs text-green-600 font-medium">{card.change}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-gray-50">
                    <Icon className="h-6 w-6 text-gray-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="vendors">Vendor Performance</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Sales Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>Online Sales</span>
                    <span className="font-semibold">
                      {analytics?.data?.summary?.onlinePercentage || 0}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="h-2 rounded-full bg-blue-500"
                      style={{ width: `${analytics?.data?.summary?.onlinePercentage || 0}%` }}
                    />
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Offline Sales</span>
                    <span className="font-semibold">
                      {analytics?.data?.summary?.offlinePercentage || 0}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="h-2 rounded-full bg-purple-500"
                      style={{ width: `${analytics?.data?.summary?.offlinePercentage || 0}%` }}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent Sales</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {salesOverview?.data?.sales?.slice(0, 5).map((sale: any, index: number) => (
                    <div key={index} className="flex justify-between items-center p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">{sale.vendorId?.businessName}</p>
                        <p className="text-sm text-gray-600">{sale.productId?.name}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">₹{sale.totalAmount}</p>
                        <p className="text-sm text-gray-600">{sale.saleType}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="vendors">
          <Card>
            <CardHeader>
              <CardTitle>Top Performing Vendors</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analytics?.data?.vendorPerformance?.map((vendor: any, index: number) => (
                  <div key={index} className="flex justify-between items-center p-4 border rounded-lg">
                    <div>
                      <h4 className="font-medium">{vendor.businessName || vendor.vendorName}</h4>
                      <p className="text-sm text-gray-600">{vendor.totalOrders} orders</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">₹{vendor.totalSales.toLocaleString()}</p>
                      <p className="text-sm text-gray-600">
                        Avg: ₹{Math.round(vendor.avgOrderValue)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trends">
          <Card>
            <CardHeader>
              <CardTitle>Sales Trends</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <p className="text-gray-600">Sales trend charts will be available soon</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminSalesDashboard;
