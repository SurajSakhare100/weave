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
    CheckCircle
} from 'lucide-react'
import { getApprovalStats, getDashboardStats } from '../../../services/adminApi';

function DashboardComp() {
    const [response, setResponse] = useState({
        total: {
            totalDelivered: 0,
            totalCancelled: 0,
            totalReturn: 0,
            totalAmount: 0
        },
        Orders: []
    })
    const [approvalStats, setApprovalStats] = useState({
        pendingVendors: 0,
        pendingProducts: 0,
        totalVendors: 0,
        totalProducts: 0,
        approvalRate: 0
    })
    const [isLoading, setIsLoading] = useState(true)

    const navigate = useRouter()

    const logOut = async () => {
        try {
            await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/auth/admin/logout`, {
                method: 'POST',
                credentials: 'include',
            });
            navigate.push('/admin/login');
        } catch (error) {
            console.error('Logout error:', error);
            navigate.push('/admin/login');
        }
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch approval stats
                const approvalResponse = await getApprovalStats();
                if (approvalResponse.success) {
                    setApprovalStats(approvalResponse.stats);
                }
            } catch (error) {
                console.error('Error fetching approval stats:', error);
            }
        };

        fetchData();
    }, []);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const dashboardResponse = await getDashboardStats();
                if (dashboardResponse.success) {
                    setResponse({
                        total: {
                            totalDelivered: dashboardResponse.stats.totalOrders || 0,
                            totalCancelled: 0,
                            totalReturn: 0,
                            totalAmount: dashboardResponse.stats.totalRevenue || 0
                        },
                        Orders: []
                    });
                }
            } catch (error) {
                console.error('Error fetching dashboard data:', error);
                // Use fallback data
                setResponse({
                    total: {
                        totalDelivered: 0,
                        totalCancelled: 0,
                        totalReturn: 0,
                        totalAmount: 0
                    },
                    Orders: []
                });
            } finally {
                setIsLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(amount)
    }

    const getStatusColor = (status) => {
        switch (status?.toLowerCase()) {
            case 'delivered':
                return 'admin-badge-success'
            case 'pending':
                return 'admin-badge-warning'
            case 'cancelled':
                return 'admin-badge-danger'
            case 'return':
                return 'admin-badge-info'
            default:
                return 'admin-badge-info'
        }
    }

    if (isLoading) {
        return (
            <div className="min-h-screen admin-bg-secondary flex items-center justify-center">
                <div className="flex items-center space-x-3">
                    <div className="admin-spinner h-6 w-6"></div>
                    <span className="admin-text-secondary">Loading dashboard...</span>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen admin-bg-secondary">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Page Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold admin-text-primary mb-2">Dashboard</h1>
                    <p className="admin-text-secondary">Overview of your e-commerce platform</p>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <div className="admin-card p-6">
                        <div className="flex items-center">
                            <div className="p-3 admin-bg-success-light rounded-lg">
                                <Package className="h-6 w-6 admin-text-success-dark" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium admin-text-secondary">Delivered</p>
                                <p className="text-2xl font-bold admin-text-primary">{response.total.totalDelivered}</p>
                            </div>
                        </div>
                    </div>

                    <div className="admin-card p-6">
                        <div className="flex items-center">
                            <div className="p-3 admin-bg-danger-light rounded-lg">
                                <XCircle className="h-6 w-6 admin-text-danger-dark" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium admin-text-secondary">Cancelled</p>
                                <p className="text-2xl font-bold admin-text-primary">{response.total.totalCancelled}</p>
                            </div>
                        </div>
                    </div>

                    <div className="admin-card p-6">
                        <div className="flex items-center">
                            <div className="p-3 bg-purple-100 rounded-lg">
                                <RotateCcw className="h-6 w-6 text-purple-600" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium admin-text-secondary">Returns</p>
                                <p className="text-2xl font-bold admin-text-primary">{response.total.totalReturn}</p>
                            </div>
                        </div>
                    </div>

                    <div className="admin-card p-6">
                        <div className="flex items-center">
                            <div className="p-3 admin-bg-primary-lighter rounded-lg">
                                <DollarSign className="h-6 w-6 admin-text-primary" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium admin-text-secondary">Total Revenue</p>
                                <p className="text-2xl font-bold admin-text-primary">{formatCurrency(response.total.totalAmount)}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Approval Stats */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <div className="admin-card p-6">
                        <div className="flex items-center">
                            <div className="p-3 admin-bg-warning-light rounded-lg">
                                <AlertCircle className="h-6 w-6 admin-text-warning-dark" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium admin-text-secondary">Pending Vendors</p>
                                <p className="text-2xl font-bold admin-text-primary">{approvalStats.pendingVendors}</p>
                            </div>
                        </div>
                        <Link href="/admin/pending-vendors" className="mt-3 inline-flex items-center text-sm admin-text-primary hover:admin-text-important">
                            <Eye className="h-4 w-4 mr-1" />
                            View Details
                        </Link>
                    </div>

                    <div className="admin-card p-6">
                        <div className="flex items-center">
                            <div className="p-3 admin-bg-warning-light rounded-lg">
                                <Package className="h-6 w-6 admin-text-warning-dark" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium admin-text-secondary">Pending Products</p>
                                <p className="text-2xl font-bold admin-text-primary">{approvalStats.pendingProducts}</p>
                            </div>
                        </div>
                        <Link href="/admin/pending-products" className="mt-3 inline-flex items-center text-sm admin-text-primary hover:admin-text-important">
                            <Eye className="h-4 w-4 mr-1" />
                            View Details
                        </Link>
                    </div>

                    <div className="admin-card p-6">
                        <div className="flex items-center">
                            <div className="p-3 admin-bg-success-light rounded-lg">
                                <Users className="h-6 w-6 admin-text-success-dark" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium admin-text-secondary">Total Vendors</p>
                                <p className="text-2xl font-bold admin-text-primary">{approvalStats.totalVendors}</p>
                            </div>
                        </div>
                    </div>

                    <div className="admin-card p-6">
                        <div className="flex items-center">
                            <div className="p-3 admin-bg-primary-lighter rounded-lg">
                                <CheckCircle className="h-6 w-6 admin-text-primary" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium admin-text-secondary">Approval Rate</p>
                                <p className="text-2xl font-bold admin-text-primary">{approvalStats.approvalRate}%</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="admin-card p-6 mb-8">
                    <h3 className="text-lg font-medium admin-text-primary mb-4">Quick Actions</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Link href="/admin/pending-vendors" className="flex items-center p-4 admin-border-primary border rounded-lg hover:admin-bg-secondary transition-colors">
                            <Users className="h-8 w-8 admin-text-primary mr-3" />
                            <div>
                                <p className="font-medium admin-text-primary">Review Vendors</p>
                                <p className="text-sm admin-text-secondary">{approvalStats.pendingVendors} pending</p>
                            </div>
                        </Link>
                        <Link href="/admin/pending-products" className="flex items-center p-4 admin-border-primary border rounded-lg hover:admin-bg-secondary transition-colors">
                            <Package className="h-8 w-8 admin-text-primary mr-3" />
                            <div>
                                <p className="font-medium admin-text-primary">Review Products</p>
                                <p className="text-sm admin-text-secondary">{approvalStats.pendingProducts} pending</p>
                            </div>
                        </Link>
                        <Link href="/admin/vendors" className="flex items-center p-4 admin-border-primary border rounded-lg hover:admin-bg-secondary transition-colors">
                            <TrendingUp className="h-8 w-8 admin-text-primary mr-3" />
                            <div>
                                <p className="font-medium admin-text-primary">Manage Vendors</p>
                                <p className="text-sm admin-text-secondary">View all vendors</p>
                            </div>
                        </Link>
                    </div>
                </div>

                {/* Recent Orders */}
                <div className="admin-card">
                    <div className="admin-card-header">
                        <div className="flex items-center justify-between">
                            <h2 className="text-lg font-semibold admin-text-primary">Recent Orders</h2>
                            <Link 
                                href="/admin/orders"
                                className="admin-btn admin-btn-outline"
                            >
                                View All Orders
                            </Link>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="admin-table">
                            <thead>
                                <tr>
                                    <th>Date</th>
                                    <th>Customer</th>
                                    <th>Amount</th>
                                    <th>Payment</th>
                                    <th>Status</th>
                                    <th>Order ID</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {response.Orders.length > 0 ? (
                                    response.Orders.map((obj, key) => (
                                        <tr key={key}>
                                            <td className="admin-text-primary">
                                                {obj.date}
                                            </td>
                                            <td className="admin-text-primary">
                                                {obj.customer}
                                            </td>
                                            <td className="admin-text-primary font-medium">
                                                {formatCurrency(obj.price)}
                                            </td>
                                            <td className="admin-text-primary">
                                                {obj.payType}
                                            </td>
                                            <td>
                                                <span className={`admin-badge ${getStatusColor(obj.OrderStatus)}`}>
                                                    {obj.OrderStatus}
                                                </span>
                                            </td>
                                            <td className="admin-text-tertiary font-mono">
                                                {obj.secretOrderId}
                                            </td>
                                            <td>
                                                <button
                                                    onClick={() => navigate.push(`/admin/orders/${obj.secretOrderId}/${obj.userId}`)}
                                                    className="admin-btn admin-btn-outline"
                                                >
                                                    <Eye size={14} className="mr-1" />
                                                    View
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="7" className="text-center py-8">
                                            <div className="flex flex-col items-center">
                                                <Truck className="h-12 w-12 admin-text-tertiary mb-4" />
                                                <p className="text-lg font-medium admin-text-primary mb-2">
                                                    No orders found
                                                </p>
                                                <p className="admin-text-secondary">
                                                    Recent orders will appear here
                                                </p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default DashboardComp