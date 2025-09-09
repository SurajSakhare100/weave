import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useGetVendorStockOverviewQuery, useGetAllStockMovementsQuery } from '@/services/adminApi';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Package, AlertTriangle, TrendingDown, Activity } from 'lucide-react';

const AdminStockDashboard = () => {
  const [filters, setFilters] = useState({ limit: 20 });
  
  const { data: stockOverview, isLoading: stockLoading } = useGetVendorStockOverviewQuery(filters);
  const { data: movements, isLoading: movementsLoading } = useGetAllStockMovementsQuery({ limit: 20 });

  if (stockLoading || movementsLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const stockSummary = stockOverview?.data?.stockSummary || [];
  const totalProducts = stockSummary.reduce((acc: number, vendor: any) => acc + vendor.totalProducts, 0);
  const totalLowStock = stockSummary.reduce((acc: number, vendor: any) => acc + vendor.lowStockCount, 0);
  const totalOutOfStock = stockSummary.reduce((acc: number, vendor: any) => acc + vendor.outOfStockCount, 0);
  const totalValue = stockSummary.reduce((acc: number, vendor: any) => acc + vendor.totalStockValue, 0);

  const summaryCards = [
    {
      title: 'Total Products',
      value: totalProducts,
      icon: Package,
      color: 'text-blue-600'
    },
    {
      title: 'Low Stock Items',
      value: totalLowStock,
      icon: AlertTriangle,
      color: 'text-orange-600'
    },
    {
      title: 'Out of Stock',
      value: totalOutOfStock,
      icon: TrendingDown,
      color: 'text-red-600'
    },
    {
      title: 'Total Stock Value',
      value: `₹${totalValue.toLocaleString()}`,
      icon: Activity,
      color: 'text-green-600'
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Stock Overview</h1>
        <p className="text-gray-600 mt-1">Monitor inventory across all vendors</p>
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

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="vendors">Vendor Stock</TabsTrigger>
          <TabsTrigger value="movements">Stock Movements</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Stock Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {stockSummary.slice(0, 5).map((vendor: any, index: number) => (
                    <div key={index} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">{vendor.businessName}</span>
                        <span className="text-sm text-gray-600">{vendor.totalProducts} products</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="h-2 rounded-full bg-blue-500"
                          style={{
                            width: `${(vendor.totalProducts / Math.max(...stockSummary.map((s: any) => s.totalProducts))) * 100}%`
                          }}
                        />
                      </div>
                      <div className="flex justify-between text-sm text-gray-600">
                        <span>Value: ₹{vendor.totalStockValue.toLocaleString()}</span>
                        <span>Low: {vendor.lowStockCount} | Out: {vendor.outOfStockCount}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Critical Stock Alerts</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {stockOverview?.data?.products?.filter((product: any) => 
                    product.stock <= (product.vendorId?.lowStockThreshold || 10)
                  ).slice(0, 5).map((product: any, index: number) => (
                    <div key={index} className="flex justify-between items-center p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">{product.name}</p>
                        <p className="text-sm text-gray-600">{product.vendorId?.businessName}</p>
                      </div>
                      <div className="text-right">
                        <Badge variant={product.stock === 0 ? "destructive" : "secondary"}>
                          {product.stock === 0 ? 'Out of Stock' : `${product.stock} left`}
                        </Badge>
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
              <CardTitle>Vendor Stock Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stockSummary.map((vendor: any, index: number) => (
                  <div key={index} className="flex justify-between items-center p-4 border rounded-lg">
                    <div>
                      <h4 className="font-medium">{vendor.businessName}</h4>
                      <p className="text-sm text-gray-600">{vendor.totalProducts} products</p>
                    </div>
                    <div className="flex gap-4 items-center">
                      <div className="text-center">
                        <p className="text-sm text-gray-600">Stock Value</p>
                        <p className="font-semibold">₹{vendor.totalStockValue.toLocaleString()}</p>
                      </div>
                      <div className="flex gap-2">
                        {vendor.lowStockCount > 0 && (
                          <Badge variant="secondary">{vendor.lowStockCount} Low</Badge>
                        )}
                        {vendor.outOfStockCount > 0 && (
                          <Badge variant="destructive">{vendor.outOfStockCount} Out</Badge>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="movements">
          <Card>
            <CardHeader>
              <CardTitle>Recent Stock Movements</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {movements?.data?.movements?.map((movement: any, index: number) => (
                  <div key={index} className="flex justify-between items-center p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">{movement.productId?.name}</p>
                      <p className="text-sm text-gray-600">
                        {movement.vendorId?.businessName} • {movement.reason}
                      </p>
                    </div>
                    <div className="text-right">
                      <Badge variant={movement.quantity > 0 ? "default" : "secondary"}>
                        {movement.movementType}
                      </Badge>
                      <p className="text-sm text-gray-600 mt-1">
                        {movement.quantity > 0 ? '+' : ''}{movement.quantity}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminStockDashboard;
