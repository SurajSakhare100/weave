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
    X
} from 'lucide-react'
import { useGetAllOrdersQuery, useUpdateOrderStatusMutation, useGetAdminOrderStatsQuery } from '../../../services/adminApi'
import BaseModal from '../../ui/BaseModal'
import OrderDetails from './OrderDetails'
import Select from '../../ui/select'
import { useAdminLogout } from '../../../hooks/useAdminLogout'
import {
    formatCurrency,
    getOrderStatusColor,
    handleAdminError,
    confirmAction
} from '../../../utils/adminUtils'

function OrdersComp({ loaded, setLoaded }) {
    const [search, setSearch] = useState('')
    const [orders, setOrders] = useState([])
    const [total, setTotal] = useState(0)
    const [currentPage, setCurrentPage] = useState(1)
    const [isLoading, setIsLoading] = useState(false)
    const [statusFilter, setStatusFilter] = useState('all')
    const [vendorFilter, setVendorFilter] = useState('all')
    const [editModal, setEditModal] = useState({ active: false, order: null })
    const [orderDetailsModal, setOrderDetailsModal] = useState({ active: false, order: null })
    const [rejectionReason, setRejectionReason] = useState('')
    const [selectedStatus, setSelectedStatus] = useState('')

    const navigate = useRouter()
    const { logout } = useAdminLogout()

    const limit = 10 // Orders per page

    const { data, error, isLoading: queryLoading, refetch } = useGetAllOrdersQuery({
        search,
        status: statusFilter !== 'all' ? statusFilter : undefined,
        vendor: vendorFilter !== 'all' ? vendorFilter : undefined,
        page: currentPage,
        limit: limit
    })
    const { data: statsData, error: statsError, isLoading: statsLoading } = useGetAdminOrderStatsQuery()
    const [updateOrderStatus, { isLoading: updateLoading }] = useUpdateOrderStatusMutation()

    useEffect(() => {
        if (data) {
            setOrders(data.orders || [])
            setTotal(data.total || 0)
            setLoaded(true)
        }
        if (queryLoading) setLoaded(false)
        if (error) {
            setLoaded(true)
            if (error?.status === 401) {
                logout()
            }
        }
    }, [data, queryLoading, error, setLoaded, logout])

    // Reset page when filters change
    useEffect(() => {
        setCurrentPage(1)
    }, [search, statusFilter, vendorFilter])

    // Pagination handlers
    const totalPages = Math.ceil(total / limit)

    const handlePageChange = (page) => {
        setCurrentPage(page)
    }

    const handlePrevPage = () => {
        if (currentPage > 1) {
            setCurrentPage(prev => prev - 1)
        }
    }

    const handleNextPage = () => {
        if (currentPage < totalPages) {
            setCurrentPage(prev => prev + 1)
        }
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

    const handleViewOrderDetails = (order) => {
        setOrderDetailsModal({ active: true, order })
    }

    const handleCloseOrderDetails = () => {
        setOrderDetailsModal({ active: false, order: null })
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

    // Get unique vendors from orders (with null check)
    const vendors = orders && orders.length > 0
        ? [...new Set(orders.map(order => order.vendorName || order.vendor).filter(Boolean))]
        : []

    // Get unique statuses from orders (with null check)
    const statuses = orders && orders.length > 0
        ? [...new Set(orders.map(order => order.OrderStatus).filter(Boolean))]
        : []



    const getPaymentColor = (payType) => {
        switch (payType?.toLowerCase()) {
            case 'online':
            case 'card':
            case 'upi':
            case 'netbanking':
                return 'bg-green-100 text-green-800 border-green-200'
            case 'cod':
            case 'cash on delivery':
                return 'bg-orange-100 text-orange-800 border-orange-200'
            case 'wallet':
                return 'bg-blue-100 text-blue-800 border-blue-200'
            default:
                return 'bg-gray-100 text-gray-800 border-gray-200'
        }
    }

    if (!loaded || queryLoading) return <LoadingSpinner text="Loading orders..." />

    // Show error state if there's an error
    if (error) {
        return (
            <div className="text-center py-8">
                <p className="text-red-600 mb-4">Error loading orders: {error?.message || 'Unknown error'}</p>
                <button
                    onClick={() => refetch()}
                    className="btn-primary"
                >
                    Retry
                </button>
            </div>
        )
    }

    // Show empty state if no orders
    if (!orders || orders.length === 0) {
        return (
            <div className="text-center py-8">
                <ShoppingCart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 mb-4">No orders found</p>
                <button
                    onClick={() => refetch()}
                    className="btn-primary"
                >
                    Refresh
                </button>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Order Details Modal */}
            {orderDetailsModal.active && orderDetailsModal.order && (
                <OrderDetails
                    order={orderDetailsModal.order}
                    onClose={handleCloseOrderDetails}
                />
            )}

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
                                    <span className={`ml-2 inline-flex items-center px-2.5 py-0.5 text-xs font-medium rounded-full border ${getOrderStatusColor(editModal.order.OrderStatus)}`}>
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
                                {orders ? orders.filter(order => {
                                    const orderDate = new Date(order.date)
                                    const now = new Date()
                                    return orderDate.getMonth() === now.getMonth() &&
                                        orderDate.getFullYear() === now.getFullYear()
                                }).length : 0}
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
                                {formatCurrency(orders ? orders.reduce((sum, order) => sum + (order.price || 0), 0) : 0)}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Status Tabs */}
            {statsData && (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Status Overview</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-2">
                        {[
                            { key: 'all', label: 'All Orders', count: statsData.statusCounts?.all || 0, color: 'bg-gray-100 text-gray-800 border-gray-200' },
                            { key: 'pending', label: 'Pending', count: statsData.statusCounts?.pending || 0, color: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
                            { key: 'processing', label: 'Processing', count: statsData.statusCounts?.processing || 0, color: 'bg-orange-100 text-orange-800 border-orange-200' },
                            { key: 'shipped', label: 'Shipped', count: statsData.statusCounts?.shipped || 0, color: 'bg-blue-100 text-blue-800 border-blue-200' },
                            { key: 'delivered', label: 'Delivered', count: statsData.statusCounts?.delivered || 0, color: 'bg-green-100 text-green-800 border-green-200' },
                            { key: 'cancelled', label: 'Cancelled', count: statsData.statusCounts?.cancelled || 0, color: 'bg-red-100 text-red-800 border-red-200' },
                            { key: 'returned', label: 'Returned', count: statsData.statusCounts?.returned || 0, color: 'bg-purple-100 text-purple-800 border-purple-200' },
                            { key: 'refunded', label: 'Refunded', count: statsData.statusCounts?.refunded || 0, color: 'bg-indigo-100 text-indigo-800 border-indigo-200' }
                        ].map((status) => (
                            <button
                                key={status.key}
                                onClick={() => setStatusFilter(status.key)}
                                className={`p-3 rounded-lg text-center transition-all duration-200 border-2 ${statusFilter === status.key
                                        ? `${status.color} border-current shadow-md transform scale-105`
                                        : 'bg-white border-gray-200 hover:border-gray-300 hover:shadow-sm'
                                    }`}
                            >
                                <div className={`text-2xl font-bold ${statusFilter === status.key ? '' : 'text-gray-900'}`}>
                                    {status.count}
                                </div>
                                <div className={`text-xs font-medium mt-1 ${statusFilter === status.key ? '' : 'text-gray-600'}`}>
                                    {status.label}
                                </div>
                            </button>
                        ))}
                    </div>
                </div>
            )}

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
                        <Select
                            value={statusFilter}
                            onChange={setStatusFilter}
                            options={[
                                { value: 'all', label: 'All Statuses', count: statsData?.statusCounts?.all },
                                ...statuses.map(status => ({
                                    value: status,
                                    label: status,
                                    count: statsData?.statusCounts?.[status.toLowerCase()]
                                }))
                            ]}
                            showCounts={true}
                            placeholder="Select Status"
                        />
                    </div>

                    {/* Vendor Filter */}
                    <div className="flex-1 max-w-xs">
                        <Select
                            value={vendorFilter}
                            onChange={setVendorFilter}
                            options={[
                                { value: 'all', label: 'All Vendors' },
                                ...vendors.map(vendor => ({
                                    value: vendor,
                                    label: vendor
                                }))
                            ]}
                            placeholder="Select Vendor"
                        />
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
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                        <Package className="h-5 w-5 mr-2 text-gray-600" />
                        Orders ({total})
                    </h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                    <div className="flex items-center space-x-1">
                                        <Calendar size={14} className="text-gray-500" />
                                        <span>Date</span>
                                    </div>
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                    <div className="flex items-center space-x-1">
                                        <User size={14} className="text-gray-500" />
                                        <span>Customer</span>
                                    </div>
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                    <div className="flex items-center space-x-1">
                                        <User size={14} className="text-gray-500" />
                                        <span>Vendor</span>
                                    </div>
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                    <div className="flex items-center space-x-1">
                                        <DollarSign size={14} className="text-gray-500" />
                                        <span>Amount</span>
                                    </div>
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                    <div className="flex items-center space-x-1">
                                        <CreditCard size={14} className="text-gray-500" />
                                        <span>Payment</span>
                                    </div>
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                    <div className="flex items-center space-x-1">
                                        <Package size={14} className="text-gray-500" />
                                        <span>Status</span>
                                    </div>
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                    Order ID
                                </th>
                                <th className="px-6 py-4 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {orders && orders.length > 0 ? (
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
                                            <span className={`inline-flex items-center px-2.5 py-0.5 text-xs font-medium rounded-full border ${getPaymentColor(order.payType)}`}>
                                                {order.payType}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 text-xs font-medium rounded-full border ${getOrderStatusColor(order.OrderStatus)}`}>
                                                {order.OrderStatus}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono">
                                            {order.secretOrderId}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            <div className="flex items-center justify-center space-x-2">
                                                <button
                                                    onClick={() => handleViewOrderDetails(order)}
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

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                        <div className="flex items-center text-sm text-gray-700">
                            <span>
                                Showing {((currentPage - 1) * limit) + 1} to {Math.min(currentPage * limit, total)} of {total} orders
                            </span>
                        </div>

                        <div className="flex items-center space-x-2">
                            <button
                                onClick={handlePrevPage}
                                disabled={currentPage === 1 || queryLoading}
                                className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Previous
                            </button>

                            <div className="flex items-center space-x-1">
                                {/* Page numbers */}
                                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                    let pageNum;
                                    if (totalPages <= 5) {
                                        pageNum = i + 1;
                                    } else if (currentPage <= 3) {
                                        pageNum = i + 1;
                                    } else if (currentPage >= totalPages - 2) {
                                        pageNum = totalPages - 4 + i;
                                    } else {
                                        pageNum = currentPage - 2 + i;
                                    }

                                    return (
                                        <button
                                            key={pageNum}
                                            onClick={() => handlePageChange(pageNum)}
                                            disabled={queryLoading}
                                            className={`px-3 py-1 text-sm border rounded ${currentPage === pageNum
                                                    ? 'bg-blue-600 text-white border-blue-600'
                                                    : 'border-gray-300 hover:bg-gray-50'
                                                } disabled:opacity-50 disabled:cursor-not-allowed`}
                                        >
                                            {pageNum}
                                        </button>
                                    );
                                })}
                            </div>

                            <button
                                onClick={handleNextPage}
                                disabled={currentPage === totalPages || queryLoading}
                                className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Next
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

export default OrdersComp