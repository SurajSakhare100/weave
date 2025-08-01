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
    Package,
    Edit,
    Filter,
    X,
    CheckCircle,
    XCircle
} from 'lucide-react'
import { useGetAllOrdersQuery, useUpdateOrderStatusMutation } from '../../../services/adminApi'
import BaseModal from '../../ui/BaseModal'

function OrdersComp({ loaded, setLoaded }) {
    const [search, setSearch] = useState('')
    const [orders, setOrders] = useState([])
    const [total, setTotal] = useState(0)
    const [isLoading, setIsLoading] = useState(false)
    const [statusFilter, setStatusFilter] = useState('all')
    const [vendorFilter, setVendorFilter] = useState('all')
    const [editModal, setEditModal] = useState({ active: false, order: null })
    const [rejectionReason, setRejectionReason] = useState('')
    const [selectedStatus, setSelectedStatus] = useState('')

    const navigate = useRouter()

    const { data, error, isLoading: queryLoading, refetch } = useGetAllOrdersQuery({ 
        search, 
        status: statusFilter !== 'all' ? statusFilter : undefined,
        vendor: vendorFilter !== 'all' ? vendorFilter : undefined,
        skip: 0 
    })
    const [updateOrderStatus, { isLoading: updateLoading }] = useUpdateOrderStatusMutation()

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

    const handleEditOrder = (order) => {
        setEditModal({ active: true, order })
        setRejectionReason('')
        setSelectedStatus('')
    }

    const handleCloseEditModal = () => {
        setEditModal({ active: false, order: null })
        setRejectionReason('')
        setSelectedStatus('')
    }

    const handleUpdateOrderStatus = async (orderId, newStatus) => {
        try {
            const updateData = { id: orderId, status: newStatus }
            if (newStatus === 'rejected' && rejectionReason.trim()) {
                updateData.rejectionReason = rejectionReason.trim()
            }
            
            await updateOrderStatus(updateData).unwrap()
            toast.success(`Order status updated to ${newStatus}`)
            handleCloseEditModal()
            refetch()
        } catch (error) {
            console.error('Error updating order status:', error)
            toast.error('Failed to update order status')
        }
    }

    // Get unique vendors from orders
    const vendors = [...new Set(orders.map(order => order.vendorName || order.vendor).filter(Boolean))]

    // Get unique statuses from orders
    const statuses = [...new Set(orders.map(order => order.OrderStatus).filter(Boolean))]

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
            {/* Edit Order Modal */}
            {editModal.active && editModal.order && (
                <BaseModal
                    isOpen={editModal.active}
                    onClose={handleCloseEditModal}
                    title="Edit Order Status"
                    size="md"
                >
                    <div className="space-y-4">
                        <div>
                            <h4 className="font-medium text-gray-900 mb-2">Order Details</h4>
                            <div className="bg-gray-50 p-3 rounded-lg space-y-2">
                                <p><span className="font-medium">Order ID:</span> {editModal.order.secretOrderId}</p>
                                <p><span className="font-medium">Customer:</span> {editModal.order.customer}</p>
                                <p><span className="font-medium">Amount:</span> {formatCurrency(editModal.order.price)}</p>
                                <p><span className="font-medium">Current Status:</span> 
                                    <span className={`ml-2 inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(editModal.order.OrderStatus)}`}>
                                        {editModal.order.OrderStatus}
                                    </span>
                                </p>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Update Status
                            </label>
                            <select 
                                id="statusSelect"
                                value={selectedStatus}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                onChange={(e) => {
                                    setSelectedStatus(e.target.value)
                                    if (e.target.value === 'rejected') {
                                        setRejectionReason('')
                                    }
                                }}
                            >
                                <option value="">Select new status</option>
                                <option value="pending">Pending</option>
                                <option value="processing">Processing</option>
                                <option value="shipped">Shipped</option>
                                <option value="delivered">Delivered</option>
                                <option value="cancelled">Cancelled</option>
                                <option value="rejected">Rejected</option>
                                <option value="return">Return</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Rejection Reason (if rejecting)
                            </label>
                            <textarea
                                value={rejectionReason}
                                onChange={(e) => setRejectionReason(e.target.value)}
                                rows={3}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                                placeholder="Enter reason for rejection..."
                            />
                        </div>

                        <div className="flex gap-3 pt-4 border-t border-gray-200">
                            <button
                                type="button"
                                onClick={handleCloseEditModal}
                                className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => {
                                    if (selectedStatus) {
                                        handleUpdateOrderStatus(editModal.order._id, selectedStatus)
                                    } else {
                                        toast.error('Please select a status')
                                    }
                                }}
                                disabled={updateLoading}
                                className="flex-1 px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
                            >
                                {updateLoading ? (
                                    <>
                                        <div className="spinner mr-2"></div>
                                        Updating...
                                    </>
                                ) : (
                                    'Update Status'
                                )}
                            </button>
                        </div>
                    </div>
                </BaseModal>
            )}
                    
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

                {/* Search and Filters */}
                <div className="mb-6 space-y-4">
                    <div className="flex flex-col sm:flex-row gap-4">
                        {/* Search Bar */}
                        <div className="flex-1 max-w-md">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                                <input
                                    type="text"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    placeholder="Search by customer name or order ID..."
                                    className="w-full px-3 py-2 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>
                        </div>

                        {/* Status Filter */}
                        <div className="flex-1 max-w-xs">
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            >
                                <option value="all">All Statuses</option>
                                {statuses.map(status => (
                                    <option key={status} value={status}>{status}</option>
                                ))}
                            </select>
                        </div>

                        {/* Vendor Filter */}
                        <div className="flex-1 max-w-xs">
                            <select
                                value={vendorFilter}
                                onChange={(e) => setVendorFilter(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            >
                                <option value="all">All Vendors</option>
                                {vendors.map(vendor => (
                                    <option key={vendor} value={vendor}>{vendor}</option>
                                ))}
                            </select>
                        </div>

                        {/* Clear Filters */}
                        {(statusFilter !== 'all' || vendorFilter !== 'all' || search) && (
                            <button
                                onClick={() => {
                                    setStatusFilter('all')
                                    setVendorFilter('all')
                                    setSearch('')
                                }}
                                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors flex items-center"
                            >
                                <X className="h-4 w-4 mr-2" />
                                Clear
                            </button>
                        )}
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
                                            <User size={16} className="mr-2" />
                                            Vendor
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
                                        Actions
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
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {order.vendorName || order.vendor || 'N/A'}
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
                                                <div className="flex items-center space-x-2">
                                                    <button
                                                        onClick={() => navigate.push(`/admin/orders/${order.secretOrderId}/${order.userId}`)}
                                                        className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50 transition-colors"
                                                        title="View Details"
                                                    >
                                                        <Eye size={16} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleEditOrder(order)}
                                                        className="text-green-600 hover:text-green-900 p-1 rounded hover:bg-green-50 transition-colors"
                                                        title="Edit Order"
                                                    >
                                                        <Edit size={16} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="8" className="px-6 py-8 text-center text-gray-500">
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