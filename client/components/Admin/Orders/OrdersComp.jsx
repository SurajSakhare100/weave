import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import LoadingSpinner from '../../ui/LoadingSpinner'
import { toast } from 'sonner'
import { 
    Search, 
    Eye, 
    ShoppingCart, 
    Calendar, 
    User, 
    DollarSign,
    CreditCard,
    Package
} from 'lucide-react'
import { useGetAllOrdersQuery } from '../../../services/adminApi'

function OrdersComp({ loaded, setLoaded }) {
    const [search, setSearch] = useState('')
    const [orders, setOrders] = useState([])
    const [total, setTotal] = useState(0)
    const [isLoading, setIsLoading] = useState(false)

    const navigate = useRouter()

    const { data, error, isLoading: queryLoading, refetch } = useGetAllOrdersQuery({ search, skip: 0 })

    const logOut = async () => {
        try {
            // Call logout endpoint to clear cookie
            await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/auth/admin/logout`, {
                method: 'POST',
                credentials: 'include'
            });
        } catch (error) {
            console.error('Logout error:', error);
        }
        navigate.push('/admin/login')
    }

    useEffect(() => {
        if (data) {
            setOrders(data.orders)
            setTotal(data.total)
            setLoaded(true)
        }
        if (isLoading) setLoaded(false)
        if (error) setLoaded(true)
    }, [data, isLoading, error, setLoaded])

    const handleLoadMore = () => {
        refetch()
    }

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

    const getPaymentColor = (payType) => {
        switch (payType?.toLowerCase()) {
            case 'online':
                return 'text-primary-600 bg-primary-50'
            case 'cod':
                return 'text-warning-600 bg-warning-50'
            default:
                return 'text-gray-600 bg-gray-50'
        }
    }

    if (!loaded) return <LoadingSpinner text="Loading orders..." />

    return (
        <div className="space-y-6">
                    
                    {/* Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                        <div className="card p-4">
                            <div className="flex items-center">
                                <Package className="h-5 w-5 text-primary-600 mr-3" />
                                <div>
                                    <p className="text-sm text-gray-600">Total Orders</p>
                                    <p className="text-2xl font-bold text-gray-900">{total}</p>
                                </div>
                            </div>
                        </div>
                        <div className="card p-4">
                            <div className="flex items-center">
                                <Calendar className="h-5 w-5 text-success-600 mr-3" />
                                <div>
                                    <p className="text-sm text-gray-600">This Month</p>
                                    <p className="text-2xl font-bold text-gray-900">
                                        {orders.filter(order => {
                                            const orderDate = new Date(order.date)
                                            const now = new Date()
                                            return orderDate.getMonth() === now.getMonth() && 
                                                   orderDate.getFullYear() === now.getFullYear()
                                        }).length}
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className="card p-4">
                            <div className="flex items-center">
                                <DollarSign className="h-5 w-5 text-warning-600 mr-3" />
                                <div>
                                    <p className="text-sm text-gray-600">Total Revenue</p>
                                    <p className="text-2xl font-bold text-gray-900">
                                        {formatCurrency(orders.reduce((sum, order) => sum + (order.price || 0), 0))}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                {/* Search Bar */}
                <div className="mb-6">
                    <div className="max-w-md">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Search by customer name..."
                                className="input-field pl-10"
                            />
                        </div>
                    </div>
                </div>

                {/* Orders Table */}
                <div className="card overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        <div className="flex items-center">
                                            <Calendar size={16} className="mr-2" />
                                            Date
                                        </div>
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        <div className="flex items-center">
                                            <User size={16} className="mr-2" />
                                            Customer
                                        </div>
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        <div className="flex items-center">
                                            <DollarSign size={16} className="mr-2" />
                                            Amount
                                        </div>
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        <div className="flex items-center">
                                            <CreditCard size={16} className="mr-2" />
                                            Payment
                                        </div>
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        <div className="flex items-center">
                                            <Package size={16} className="mr-2" />
                                            Status
                                        </div>
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
                                {orders.length > 0 ? (
                                    orders.map((order, key) => (
                                        <tr key={key} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {new Date(order.date).toLocaleDateString()}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {order.customer}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                {formatCurrency(order.price)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPaymentColor(order.payType)}`}>
                                                    {order.payType}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(order.OrderStatus)}`}>
                                                    {order.OrderStatus}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono">
                                                {order.secretOrderId}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                <button
                                                    onClick={() => navigate.push(`/admin/orders/${order.secretOrderId}/${order.userId}`)}
                                                    className="btn-outline text-xs flex items-center"
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
                                            <div className="flex flex-col items-center">
                                                <ShoppingCart className="h-12 w-12 text-gray-400 mb-4" />
                                                <p className="text-lg font-medium text-gray-900 mb-2">No orders found</p>
                                                <p className="text-gray-600">Orders will appear here once customers start placing them</p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Load More Button */}
                    {orders.length < total && (
                        <div className="px-6 py-4 border-t border-gray-200 text-center">
                            <button
                                onClick={handleLoadMore}
                                disabled={queryLoading}
                                className="btn-outline disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {queryLoading ? (
                                    <>
                                        <div className="spinner mr-2"></div>
                                        Loading...
                                    </>
                                ) : (
                                    'Load More Orders'
                                )}
                            </button>
                        </div>
                    )}
                </div>
        </div>
    )
}

export default OrdersComp