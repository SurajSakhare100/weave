import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import LoadingSpinner from '../../ui/LoadingSpinner'
import { toast } from 'sonner'
import { 
    Search, 
    Eye, 
    Package, 
    Calendar, 
    User, 
    DollarSign,
    X,
    Clock,
    CheckCircle,
    XCircle,
    AlertCircle,
} from 'lucide-react'
import { 
    useGetAllProductsQuery, 
    useApproveProductMutation, 
    useRejectProductMutation
} from '../../../services/adminApi'
import BaseModal from '../../ui/BaseModal'
import { useAdminLogout } from '../../../hooks/useAdminLogout'
import { 
    formatCurrency, 
    handleAdminError
} from '../../../utils/adminUtils'

function ProductsComp({ loaded, setLoaded }) {
    const [search, setSearch] = useState('')
    const [products, setProducts] = useState([])
    const [total, setTotal] = useState(0)
    const [currentPage, setCurrentPage] = useState(1)
    const [statusFilter, setStatusFilter] = useState('pending')
    const [vendorFilter, setVendorFilter] = useState('all')
    const [rejectModal, setRejectModal] = useState({ active: false, product: null })
    const [rejectionReason, setRejectionReason] = useState('')
    const [approveModal, setApproveModal] = useState({ active: false, product: null })
    const [approvalFeedback, setApprovalFeedback] = useState('')

    const navigate = useRouter()
    const { logout } = useAdminLogout()

    const { data, error, isLoading: queryLoading, refetch } = useGetAllProductsQuery({ 
        search, 
        approvalStatus: statusFilter !== 'all' ? statusFilter : undefined,
        vendor: vendorFilter !== 'all' ? vendorFilter : undefined,
        page: currentPage,
        limit: 20
    })

    const [approveProduct, { isLoading: approveLoading }] = useApproveProductMutation()
    const [rejectProduct, { isLoading: rejectLoading }] = useRejectProductMutation()

    useEffect(() => {
        if (data) {
            setProducts(data.products || [])
            setTotal(data.total || 0)
            setLoaded(true)
        }
        if (error) {
            setLoaded(true)
            if ((error as any).status === 401) {
                logout()
            }
        }
    }, [data, error, setLoaded, logout])

    const handleApprove = async (product) => {
        try {
            const approvalData = {
                productId: product._id,
                feedback: approvalFeedback.trim() || undefined
            }
            await approveProduct(approvalData).unwrap()
            toast.success(`Product "${product.name}" approved successfully`)
            setApproveModal({ active: false, product: null })
            setApprovalFeedback('')
            refetch()
        } catch (error) {
            const errorMessage = handleAdminError(error, logout, 'Failed to approve product')
            if (errorMessage) toast.error(errorMessage)
        }
    }

    const handleReject = async (product) => {
        if (!rejectionReason.trim()) {
            toast.error('Please provide a rejection reason')
            return
        }

        try {
            await rejectProduct({ 
                productId: product._id, 
                rejectionReason: rejectionReason.trim() 
            }).unwrap()
            toast.success(`Product "${product.name}" rejected`)
            setRejectModal({ active: false, product: null })
            setRejectionReason('')
            refetch()
        } catch (error) {
            const errorMessage = handleAdminError(error, logout, 'Failed to reject product')
            if (errorMessage) toast.error(errorMessage)
        }
    }



        const openApproveModal = (product) => {
        setApproveModal({ active: true, product })
        setApprovalFeedback('')
    }

    const closeApproveModal = () => {
        setApproveModal({ active: false, product: null })
        setApprovalFeedback('')
    }

    const openRejectModal = (product) => {
        setRejectModal({ active: true, product })
        setRejectionReason('')
    }

    const closeRejectModal = () => {
        setRejectModal({ active: false, product: null })
        setRejectionReason('')
    }
    const getPrimaryImage = (product) => {
        if (product.images && product.images.length > 0) {
          const primary = product.images.find(img => img.is_primary);
          return primary ? primary.url : product.images[0].url;
        }
        return '/products/product.png';
      };

    // Get unique vendors from products
    const vendors = [...new Set(products.map(product => product.vendorName || product.vendor).filter(Boolean))]

    if (!loaded) return <LoadingSpinner text="Loading products..." />

    return (
        <div className="space-y-6">
            {/* Approval Modal */}
            {approveModal.active && approveModal.product && (
                <BaseModal
                    isOpen={approveModal.active}
                    onClose={closeApproveModal}
                    title="Approve Product"
                    size="md"
                >
                    <div className="space-y-4">
                        <div>
                            <h4 className="font-medium text-gray-900 mb-2">Product Details</h4>
                            <div className="bg-gray-50 p-3 rounded-lg space-y-2">
                                <p><span className="font-medium">Name:</span> {approveModal.product.name}</p>
                                <p><span className="font-medium">Vendor:</span> {approveModal.product.vendorName || approveModal.product.vendor}</p>
                                <p><span className="font-medium">Price:</span> {formatCurrency(approveModal.product.price)}</p>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Approval Feedback (Optional)
                            </label>
                            <textarea
                                value={approvalFeedback}
                                onChange={(e) => setApprovalFeedback(e.target.value)}
                                rows={3}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 resize-none"
                                placeholder="Add any feedback or notes for the vendor (optional)..."
                            />
                        </div>

                        <div className="flex gap-3 pt-4 border-t border-gray-200">
                            <button
                                type="button"
                                onClick={closeApproveModal}
                                className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => handleApprove(approveModal.product)}
                                disabled={approveLoading}
                                className="flex-1 px-4 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
                            >
                                {approveLoading ? (
                                    <>
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                        Approving...
                                    </>
                                ) : (
                                    <>
                                        <CheckCircle className="h-4 w-4 mr-2" />
                                        Approve Product
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </BaseModal>
            )}

            {/* Reject Product Modal */}
            {rejectModal.active && rejectModal.product && (
                <BaseModal
                    isOpen={rejectModal.active}
                    onClose={closeRejectModal}
                    title="Reject Product"
                    size="md"
                >
                    <div className="space-y-4">
                        <div>
                            <h4 className="font-medium text-gray-900 mb-2">Product Details</h4>
                            <div className="bg-gray-50 p-3 rounded-lg space-y-2">
                                <p><span className="font-medium">Name:</span> {rejectModal.product.name}</p>
                                <p><span className="font-medium">Vendor:</span> {rejectModal.product.vendorName || rejectModal.product.vendor}</p>
                                <p><span className="font-medium">Price:</span> {formatCurrency(rejectModal.product.price)}</p>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Rejection Reason *
                            </label>
                            <textarea
                                value={rejectionReason}
                                onChange={(e) => setRejectionReason(e.target.value)}
                                rows={4}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                                placeholder="Please provide a reason for rejecting this product..."
                                required
                            />
                        </div>

                        <div className="flex gap-3 pt-4 border-t border-gray-200">
                            <button
                                type="button"
                                onClick={closeRejectModal}
                                className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => handleReject(rejectModal.product)}
                                disabled={rejectLoading || !rejectionReason.trim()}
                                className="flex-1 px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
                            >
                                {rejectLoading ? (
                                    <>
                                        <div className="spinner mr-2"></div>
                                        Rejecting...
                                    </>
                                ) : (
                                    <>
                                        <XCircle className="h-4 w-4 mr-2" />
                                        Reject Product
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </BaseModal>
            )}

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                    <div className="flex items-center">
                        <Package className="h-5 w-5 text-blue-600 mr-3" />
                        <div>
                            <p className="text-sm text-gray-600">Total Products</p>
                            <p className="text-2xl font-bold text-gray-900">{total}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                    <div className="flex items-center">
                        <CheckCircle className="h-5 w-5 text-green-600 mr-3" />
                        <div>
                            <p className="text-sm text-gray-600">Approved</p>
                            <p className="text-2xl font-bold text-gray-900">
                                {products.filter(p => p.adminApproved === true).length}
                            </p>
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                    <div className="flex items-center">
                        <Clock className="h-5 w-5 text-yellow-600 mr-3" />
                        <div>
                            <p className="text-sm text-gray-600">Pending</p>
                            <p className="text-2xl font-bold text-gray-900">
                                {products.filter(p => !p.adminApproved && !p.adminRejectionReason).length}
                            </p>
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                    <div className="flex items-center">
                        <XCircle className="h-5 w-5 text-red-600 mr-3" />
                        <div>
                            <p className="text-sm text-gray-600">Rejected</p>
                            <p className="text-2xl font-bold text-gray-900">
                                {products.filter(p => p.adminApproved === false && p.adminRejectionReason).length}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Search and Filters */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex flex-col sm:flex-row gap-4 mb-6">
                    {/* Search Bar */}
                    <div className="flex-1 max-w-md">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Search by product name..."
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
                            <option value="pending">Pending</option>
                            <option value="approved">Approved</option>
                            <option value="rejected">Rejected</option>
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

                {/* Products Table */}
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    <div className="flex items-center">
                                        <Package size={16} className="mr-2" />
                                        Product
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
                                        Price
                                    </div>
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    <div className="flex items-center">
                                        <Calendar size={16} className="mr-2" />
                                        Status
                                    </div>
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    <div className="flex items-center">
                                        <Calendar size={16} className="mr-2" />
                                        Created
                                    </div>
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {products.length > 0 ? (
                                products.map((product, key) => (
                                    <tr key={key} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="h-12 w-12 flex-shrink-0">
                                                    <img 
                                                        className="h-12 w-12 rounded-lg object-cover" 
                                                        src={getPrimaryImage(product)} 
                                                        alt={product.name}
                                                    />
                                                </div>
                                                <div className="ml-4">
                                                    <div className="text-sm font-medium text-gray-900">{product.name}</div>
                                                    <div className="text-sm text-gray-500">{product.category}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {product.vendorName || product.vendor || 'N/A'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                            {formatCurrency(product.price)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${
                                                product.adminApproved === true 
                                                    ? 'bg-green-100 text-green-800'
                                                    : product.adminApproved === false && product.adminRejectionReason
                                                    ? 'bg-red-100 text-red-800'
                                                    : 'bg-yellow-100 text-yellow-800'
                                            }`}>
                                                {product.adminApproved === true ? (
                                                    <>
                                                        <CheckCircle className="h-3 w-3 mr-1" />
                                                        Approved
                                                    </>
                                                ) : product.adminApproved === false && product.adminRejectionReason ? (
                                                    <>
                                                        <XCircle className="h-3 w-3 mr-1" />
                                                        Rejected
                                                    </>
                                                ) : (
                                                    <>
                                                        <Clock className="h-3 w-3 mr-1" />
                                                        Pending
                                                    </>
                                                )}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {new Date(product.createdAt).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            <div className="flex items-center space-x-2">
                                                {/* View Details - Always available */}
                                                <button
                                                    onClick={() => navigate.push(`/admin/products/${product._id}`)}
                                                    className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50 transition-colors"
                                                    title="View Details"
                                                >
                                                    <Eye size={16} />
                                                </button>

                                                {/* Approval Actions - Only for pending products */}
                                                {!product.adminApproved && !product.adminRejectionReason && (
                                                    <>
                                                        <button
                                                            onClick={() => openApproveModal(product)}
                                                            disabled={approveLoading}
                                                            className="text-green-600 hover:text-green-900 p-1 rounded hover:bg-green-50 transition-colors disabled:opacity-50 flex items-center"
                                                            title="Approve Product"
                                                        >
                                                            <CheckCircle size={16} />
                                                        </button>
                                                        <button
                                                            onClick={() => openRejectModal(product)}
                                                            disabled={rejectLoading}
                                                            className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50 transition-colors disabled:opacity-50"
                                                            title="Reject Product"
                                                        >
                                                            <XCircle size={16} />
                                                        </button>
                                                    </>
                                                )}

                                                {/* Show rejection reason for rejected products */}
                                                {product.adminApproved === false && product.adminRejectionReason && (
                                                    <button
                                                        onClick={() => alert(`Rejection Reason: ${product.adminRejectionReason}`)}
                                                        className="text-orange-600 hover:text-orange-900 p-1 rounded hover:bg-orange-50 transition-colors"
                                                        title="View Rejection Reason"
                                                    >
                                                        <AlertCircle size={16} />
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                                        <div className="flex flex-col items-center">
                                            <Package className="h-12 w-12 text-gray-400 mb-4" />
                                            <p className="text-lg font-medium text-gray-900 mb-2">No products found</p>
                                            <p className="text-gray-600">Products will appear here once vendors start adding them</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {data?.totalPages > 1 && (
                    <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                        <div className="text-sm text-gray-700">
                            Showing page {currentPage} of {data.totalPages}
                        </div>
                        <div className="flex space-x-2">
                            <button
                                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                                disabled={currentPage === 1}
                                className="px-3 py-1 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Previous
                            </button>
                            <button
                                onClick={() => setCurrentPage(Math.min(data.totalPages, currentPage + 1))}
                                disabled={currentPage === data.totalPages}
                                className="px-3 py-1 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
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

export default ProductsComp 