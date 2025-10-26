import { useRouter } from 'next/router'
import Link from 'next/link'
import React, { useEffect, useState } from 'react'
import { 
    Package, 
    Truck, 
    XCircle, 
    RotateCcw, 
    DollarSign,
    Eye,
    TrendingUp,
    Users,
    AlertCircle,
    CheckCircle,
    ShoppingCart,
    Clock,
    Activity,
    BarChart3,
    ArrowUpRight,
    ArrowDownRight,
    Calendar,
    Star
} from 'lucide-react'
import { useGetDashboardStatsQuery } from '../../../services/adminApi'
import { useAdminLogout } from '../../../hooks/useAdminLogout'
import { formatCurrency, getOrderStatusColor } from '../../../utils/adminUtils'
import LoadingSpinner from '../../ui/LoadingSpinner'

interface DashboardStats {
    totalOrders: number
    totalRevenue: number
    deliveredOrders: number
    cancelledOrders: number
    returnedOrders: number
    pendingOrders: number
    processingOrders: number
    shippedOrders: number
    recentOrders: number
    recentRevenue: number
    totalVendors: number
    approvedVendors: number
    pendingVendors: number
    totalProducts: number
    approvedProducts: number
    pendingProducts: number
    recentOrdersList: any[]
    dailyRevenue: any[]
    topProducts: any[]
}

function DashboardComp() {
    const navigate = useRouter()
    const { logout } = useAdminLogout()

    // RTK Query hooks
    const { data: dashboardData, isLoading, error, refetch } = useGetDashboardStatsQuery({})

    const stats: DashboardStats = dashboardData || {
        totalOrders: 0,
        totalRevenue: 0,
        deliveredOrders: 0,
        cancelledOrders: 0,
        returnedOrders: 0,
        pendingOrders: 0,
        processingOrders: 0,
        shippedOrders: 0,
        recentOrders: 0,
        recentRevenue: 0,
        totalVendors: 0,
        approvedVendors: 0,
        pendingVendors: 0,
        totalProducts: 0,
        approvedProducts: 0,
        pendingProducts: 0,
        recentOrdersList: [],
        dailyRevenue: [],
        topProducts: []
    }

   

  

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <LoadingSpinner text="Loading dashboard..." />
            </div>
        )
    }

    // Calculate growth percentages (mock data for now)
    const orderGrowth = stats.recentOrders > 0 ? 12.5 : 0
    const revenueGrowth = stats.recentRevenue > 0 ? 8.3 : 0
    const vendorGrowth = stats.totalVendors > 0 ? 5.2 : 0
    const productGrowth = stats.totalProducts > 0 ? 15.7 : 0

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
                    <p className="text-gray-600">Welcome back! Here's what's happening with your platform.</p>
                </div>
                <div className="flex items-center space-x-3">
                    <button
                        onClick={() => refetch()}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors flex items-center"
                    >
                        <Activity className="h-4 w-4 mr-2" />
                        Refresh
                    </button>
                </div>
            </div>

            {/* Key Metrics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Total Orders */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Total Orders</p>
                            <p className="text-3xl font-bold text-gray-900">{stats.totalOrders.toLocaleString()}</p>
                            <div className="flex items-center mt-2">
                                <ArrowUpRight className="h-4 w-4 text-green-500" />
                                <span className="text-sm font-medium text-green-600">+{orderGrowth}%</span>
                                <span className="text-sm text-gray-500 ml-2">vs last month</span>
                            </div>
                        </div>
                        <div className="p-3 bg-blue-100 rounded-lg">
                            <ShoppingCart className="h-6 w-6 text-blue-600" />
                        </div>
                    </div>
                </div>

                {/* Total Revenue */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                            <p className="text-3xl font-bold text-gray-900">{formatCurrency(stats.totalRevenue)}</p>
                            <div className="flex items-center mt-2">
                                <ArrowUpRight className="h-4 w-4 text-green-500" />
                                <span className="text-sm font-medium text-green-600">+{revenueGrowth}%</span>
                                <span className="text-sm text-gray-500 ml-2">vs last month</span>
                            </div>
                        </div>
                        <div className="p-3 bg-green-100 rounded-lg">
                            <DollarSign className="h-6 w-6 text-green-600" />
                        </div>
                    </div>
                </div>

                {/* Total Vendors */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Active Vendors</p>
                            <p className="text-3xl font-bold text-gray-900">{stats.approvedVendors.toLocaleString()}</p>
                            <div className="flex items-center mt-2">
                                <ArrowUpRight className="h-4 w-4 text-green-500" />
                                <span className="text-sm font-medium text-green-600">+{vendorGrowth}%</span>
                                <span className="text-sm text-gray-500 ml-2">vs last month</span>
                            </div>
                        </div>
                        <div className="p-3 bg-purple-100 rounded-lg">
                            <Users className="h-6 w-6 text-purple-600" />
                        </div>
                    </div>
                </div>

                {/* Total Products */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Live Products</p>
                            <p className="text-3xl font-bold text-gray-900">{stats.approvedProducts.toLocaleString()}</p>
                            <div className="flex items-center mt-2">
                                <ArrowUpRight className="h-4 w-4 text-green-500" />
                                <span className="text-sm font-medium text-green-600">+{productGrowth}%</span>
                                <span className="text-sm text-gray-500 ml-2">vs last month</span>
                            </div>
                        </div>
                        <div className="p-3 bg-orange-100 rounded-lg">
                            <Package className="h-6 w-6 text-orange-600" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Order Status Overview */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Order Status Cards */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                        <BarChart3 className="h-5 w-5 mr-2 text-gray-600" />
                        Order Status Overview
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
                            <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
                            <p className="text-2xl font-bold text-green-900">{stats.deliveredOrders}</p>
                            <p className="text-sm text-green-700">Delivered</p>
                        </div>
                        <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
                            <Truck className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                            <p className="text-2xl font-bold text-blue-900">{stats.shippedOrders}</p>
                            <p className="text-sm text-blue-700">Shipped</p>
                        </div>
                        <div className="text-center p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                            <Clock className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
                            <p className="text-2xl font-bold text-yellow-900">{stats.processingOrders}</p>
                            <p className="text-sm text-yellow-700">Processing</p>
                        </div>
                        <div className="text-center p-4 bg-red-50 rounded-lg border border-red-200">
                            <XCircle className="h-8 w-8 text-red-600 mx-auto mb-2" />
                            <p className="text-2xl font-bold text-red-900">{stats.cancelledOrders}</p>
                            <p className="text-sm text-red-700">Cancelled</p>
                        </div>
                    </div>
                </div>

                {/* Pending Approvals */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                        <AlertCircle className="h-5 w-5 mr-2 text-gray-600" />
                        Pending Approvals
                    </h3>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-orange-50 rounded-lg border border-orange-200">
                            <div className="flex items-center">
                                <Users className="h-6 w-6 text-orange-600 mr-3" />
                                <div>
                                    <p className="font-medium text-orange-900">Pending Vendors</p>
                                    <p className="text-sm text-orange-700">Awaiting approval</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-2xl font-bold text-orange-900">{stats.pendingVendors}</p>
                                <Link 
                                    href="/admin/vendors" 
                                    className="text-sm text-orange-600 hover:text-orange-800 flex items-center"
                                >
                                    Review <ArrowUpRight className="h-3 w-3 ml-1" />
                                </Link>
                            </div>
                        </div>
                        
                        <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border border-blue-200">
                            <div className="flex items-center">
                                <Package className="h-6 w-6 text-blue-600 mr-3" />
                                <div>
                                    <p className="font-medium text-blue-900">Pending Products</p>
                                    <p className="text-sm text-blue-700">Awaiting approval</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-2xl font-bold text-blue-900">{stats.pendingProducts}</p>
                                <Link 
                                    href="/admin/products" 
                                    className="text-sm text-blue-600 hover:text-blue-800 flex items-center"
                                >
                                    Review <ArrowUpRight className="h-3 w-3 ml-1" />
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Link 
                        href="/admin/orders"
                        className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors group"
                    >
                        <div className="p-2 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors">
                            <ShoppingCart className="h-5 w-5 text-blue-600" />
                        </div>
                        <div className="ml-3">
                            <p className="font-medium text-gray-900">Manage Orders</p>
                            <p className="text-sm text-gray-500">{stats.pendingOrders} pending</p>
                        </div>
                    </Link>

                    <Link 
                        href="/admin/products"
                        className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors group"
                    >
                        <div className="p-2 bg-green-100 rounded-lg group-hover:bg-green-200 transition-colors">
                            <Package className="h-5 w-5 text-green-600" />
                        </div>
                        <div className="ml-3">
                            <p className="font-medium text-gray-900">Manage Products</p>
                            <p className="text-sm text-gray-500">{stats.pendingProducts} pending</p>
                        </div>
                    </Link>

                    <Link 
                        href="/admin/vendors"
                        className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors group"
                    >
                        <div className="p-2 bg-purple-100 rounded-lg group-hover:bg-purple-200 transition-colors">
                            <Users className="h-5 w-5 text-purple-600" />
                        </div>
                        <div className="ml-3">
                            <p className="font-medium text-gray-900">Manage Vendors</p>
                            <p className="text-sm text-gray-500">{stats.pendingVendors} pending</p>
                        </div>
                    </Link>

                    <Link 
                        href="/admin/categories"
                        className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors group"
                    >
                        <div className="p-2 bg-orange-100 rounded-lg group-hover:bg-orange-200 transition-colors">
                            <BarChart3 className="h-5 w-5 text-orange-600" />
                        </div>
                        <div className="ml-3">
                            <p className="font-medium text-gray-900">Categories</p>
                            <p className="text-sm text-gray-500">Manage catalog</p>
                        </div>
                    </Link>
                </div>
            </div>

            {/* Recent Orders & Top Products */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Orders */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                                <Clock className="h-5 w-5 mr-2 text-gray-600" />
                                Recent Orders
                            </h3>
                            <Link 
                                href="/admin/orders"
                                className="text-sm text-blue-600 hover:text-blue-800 flex items-center"
                            >
                                View All <ArrowUpRight className="h-3 w-3 ml-1" />
                            </Link>
                        </div>
                    </div>
                    <div className="divide-y divide-gray-200">
                        {stats.recentOrdersList.length > 0 ? (
                            stats.recentOrdersList.slice(0, 5).map((order, index) => (
                                <div key={index} className="p-4 hover:bg-gray-50">
                                    <div className="flex items-center justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center space-x-3">
                                                <div className="flex-shrink-0">
                                                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                                        <ShoppingCart className="h-4 w-4 text-blue-600" />
                                                    </div>
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-medium text-gray-900 truncate">
                                                        {order.customer}
                                                    </p>
                                                    <p className="text-sm text-gray-500">
                                                        {order.itemCount} items • {order.vendorName}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="text-right ml-4">
                                            <p className="text-sm font-medium text-gray-900">
                                                {formatCurrency(order.totalPrice)}
                                            </p>
                                            <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full border ${getOrderStatusColor(order.status)}`}>
                                                {order.status}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="p-8 text-center">
                                <ShoppingCart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                <p className="text-gray-500">No recent orders</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Top Products */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                                <Star className="h-5 w-5 mr-2 text-gray-600" />
                                Top Products
                            </h3>
                            <Link 
                                href="/admin/products"
                                className="text-sm text-blue-600 hover:text-blue-800 flex items-center"
                            >
                                View All <ArrowUpRight className="h-3 w-3 ml-1" />
                            </Link>
                        </div>
                    </div>
                    <div className="divide-y divide-gray-200">
                        {stats.topProducts.length > 0 ? (
                            stats.topProducts.map((product, index) => (
                                <div key={index} className="p-4 hover:bg-gray-50">
                                    <div className="flex items-center space-x-3">
                                        <div className="flex-shrink-0">
                                            <img 
                                                className="w-10 h-10 rounded-lg object-cover border border-gray-200" 
                                                src={product.image || '/products/product.png'} 
                                                alt={product.name}
                                            />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-gray-900 truncate">
                                                {product.name}
                                            </p>
                                            <p className="text-sm text-gray-500">
                                                {product.totalSold} sold
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm font-medium text-gray-900">
                                                {formatCurrency(product.totalRevenue)}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="p-8 text-center">
                                <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                <p className="text-gray-500">No product data available</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default DashboardComp