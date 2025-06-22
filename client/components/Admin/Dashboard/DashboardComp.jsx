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
    TrendingUp
} from 'lucide-react'
import { useGetDashboardQuery } from '../../../services/adminApi';

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
    const [isLoading, setIsLoading] = useState(true)

    const navigate = useRouter()
    const { data, error, isLoading: queryLoading } = useGetDashboardQuery();

    const logOut = () => {
        localStorage.removeItem("adminToken");
        navigate.push('/admin/login');
    };

    useEffect(() => {
        if (data) {
            if (data.login) {
                logOut();
            } else {
                setResponse(data)
            }
            setIsLoading(false)
        }
        if (queryLoading) setIsLoading(true)
        if (error) setIsLoading(false)
    }, [])

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
                return 'text-success-600 bg-success-50'
            case 'pending':
                return 'text-warning-600 bg-warning-50'
            case 'cancelled':
                return 'text-error-600 bg-error-50'
            case 'return':
                return 'text-secondary-600 bg-secondary-50'
            default:
                return 'text-gray-600 bg-gray-50'
        }
    }

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="flex items-center space-x-3">
                    <div className="spinner"></div>
                    <span className="text-gray-600">Loading dashboard...</span>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Page Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
                    <p className="text-gray-600">Overview of your e-commerce platform</p>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <div className="card p-6">
                        <div className="flex items-center">
                            <div className="p-3 bg-success-100 rounded-lg">
                                <Package className="h-6 w-6 text-success-600" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">Delivered</p>
                                <p className="text-2xl font-bold text-gray-900">{response.total.totalDelivered}</p>
                            </div>
                        </div>
                    </div>

                    <div className="card p-6">
                        <div className="flex items-center">
                            <div className="p-3 bg-error-100 rounded-lg">
                                <XCircle className="h-6 w-6 text-error-600" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">Cancelled</p>
                                <p className="text-2xl font-bold text-gray-900">{response.total.totalCancelled}</p>
                            </div>
                        </div>
                    </div>

                    <div className="card p-6">
                        <div className="flex items-center">
                            <div className="p-3 bg-secondary-100 rounded-lg">
                                <RotateCcw className="h-6 w-6 text-secondary-600" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">Returns</p>
                                <p className="text-2xl font-bold text-gray-900">{response.total.totalReturn}</p>
                            </div>
                        </div>
                    </div>

                    <div className="card p-6">
                        <div className="flex items-center">
                            <div className="p-3 bg-primary-100 rounded-lg">
                                <DollarSign className="h-6 w-6 text-primary-600" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                                <p className="text-2xl font-bold text-gray-900">{formatCurrency(response.total.totalAmount)}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Recent Orders */}
                <div className="card">
                    <div className="px-6 py-4 border-b border-gray-200">
                        <div className="flex items-center justify-between">
                            <h2 className="text-lg font-semibold text-gray-900">Recent Orders</h2>
                            <Link 
                                href="/admin/orders"
                                className="btn-outline text-sm"
                            >
                                View All Orders
                            </Link>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Date
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Customer
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Amount
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Payment
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Order ID
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Action
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {response.Orders.length > 0 ? (
                                    response.Orders.map((obj, key) => (
                                        <tr key={key} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {obj.date}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {obj.customer}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                {formatCurrency(obj.price)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {obj.payType}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(obj.OrderStatus)}`}>
                                                    {obj.OrderStatus}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono">
                                                {obj.secretOrderId}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                <button
                                                    onClick={() => navigate.push(`/admin/orders/${obj.secretOrderId}/${obj.userId}`)}
                                                    className="btn-outline text-xs"
                                                >
                                                    <Eye size={14} className="mr-1" />
                                                    View
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="7" className="px-6 py-8 text-center text-gray-500">
                                            No orders found
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