import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Package, AlertTriangle, TrendingDown, Activity, Plus, Download } from 'lucide-react';
import { getStockAnalytics, getStockMovements } from '@/services/vendorService';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { EmptyState } from '@/components/ui/EmptyState';
import StockUpdateModal from './StockUpdateModal';
import StockMovementsTable from './StockMovementsTable';
import ProductStockValue from './ProductStockValue';

const StockDashboard: React.FC = () => {
  const [analytics, setAnalytics] = useState<any>(null);
  const [movements, setMovements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showUpdateModal, setShowUpdateModal] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [analyticsRes, movementsRes] = await Promise.all([
        getStockAnalytics({ days: 30 }),
        getStockMovements({ limit: 20 })
      ]);
      setAnalytics(analyticsRes.data);
      setMovements(movementsRes.data.movements || []);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
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
      title: 'Total Products',
      value: analytics?.summary?.totalProducts || 0,
      icon: Package,
      color: 'text-blue-600'
    },
    {
      title: 'Low Stock',
      value: analytics?.summary?.lowStockProducts || 0,
      icon: AlertTriangle,
      color: 'text-orange-600'
    },
    {
      title: 'Out of Stock',
      value: analytics?.summary?.outOfStockProducts || 0,
      icon: TrendingDown,
      color: 'text-red-600'
    },
    {
      title: 'Stock Value',
      value: `₹${(analytics?.summary?.totalStockValue || 0).toLocaleString()}`,
      icon: Activity,
      color: 'text-green-600'
    }
  ];

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Stock Management</h1>
          <p className="text-gray-600 mt-1">Monitor and manage your inventory levels</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            Export
          </Button>
          <Button onClick={() => setShowUpdateModal(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            Update Stock
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

      {/* Main Content */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="low-stock">Low Stock</TabsTrigger>
          <TabsTrigger value="movements">Stock Movements</TabsTrigger>
          <TabsTrigger value="stock-value">Stock Values</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Low Stock Products */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-orange-500" />
                  Low Stock Alert
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {analytics?.lowStockProducts?.slice(0, 5).map((product: any, index: number) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <h4 className="font-medium">{product.name}</h4>
                        <p className="text-sm text-gray-600">{product.category}</p>
                      </div>
                      <div className="text-right">
                        <Badge variant="destructive">{product.stock} left</Badge>
                        <p className="text-sm text-gray-600 mt-1">₹{product.price}</p>
                      </div>
                    </div>
                  ))}
                  {(!analytics?.lowStockProducts || analytics.lowStockProducts.length === 0) && (
                    <EmptyState
                      title="No low stock items"
                      description="All products have sufficient stock"
                    />
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Out of Stock Products */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingDown className="h-5 w-5 text-red-500" />
                  Out of Stock
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {analytics?.outOfStockProducts?.slice(0, 5).map((product: any, index: number) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <h4 className="font-medium">{product.name}</h4>
                        <p className="text-sm text-gray-600">{product.category}</p>
                      </div>
                      <div className="text-right">
                        <Badge variant="destructive">Out of Stock</Badge>
                        <p className="text-sm text-gray-600 mt-1">₹{product.price}</p>
                      </div>
                    </div>
                  ))}
                  {(!analytics?.outOfStockProducts || analytics.outOfStockProducts.length === 0) && (
                    <EmptyState
                      title="No out of stock items"
                      description="All products are currently in stock"
                    />
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Stock Movements */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Stock Movements</CardTitle>
            </CardHeader>
            <CardContent>
              <StockMovementsTable movements={movements.slice(0, 10)} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="low-stock">
          <Card>
            <CardHeader>
              <CardTitle>Low Stock Products</CardTitle>
              <p className="text-gray-600">
                Products below threshold of {analytics?.summary?.lowStockThreshold || 10} units
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {analytics?.lowStockProducts?.map((product: any, index: number) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      {product.images?.[0] && (
                        <img
                          src={product.images[0]}
                          alt={product.name}
                          className="w-12 h-12 object-cover rounded"
                        />
                      )}
                      <div>
                        <h4 className="font-medium">{product.name}</h4>
                        <p className="text-sm text-gray-600">{product.category}</p>
                        <p className="text-sm font-medium">₹{product.price}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant="destructive">{product.stock} left</Badge>
                      <Button size="sm" variant="outline">
                        Update Stock
                      </Button>
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
              <CardTitle>Stock Movements History</CardTitle>
            </CardHeader>
            <CardContent>
              <StockMovementsTable movements={movements} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="stock-value">
          <ProductStockValue />
        </TabsContent>

        <TabsContent value="reports">
          <Card>
            <CardHeader>
              <CardTitle>Stock Reports</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Reports Coming Soon</h3>
                <p className="text-gray-600">
                  Advanced stock reporting features will be available soon
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <StockUpdateModal
        open={showUpdateModal}
        onClose={() => setShowUpdateModal(false)}
        onStockUpdated={loadData}
      />
    </div>
  );
};

export default StockDashboard;
