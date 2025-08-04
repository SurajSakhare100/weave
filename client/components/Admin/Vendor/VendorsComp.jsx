import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { toast } from 'react-hot-toast'
import {
    Users,
    CheckCircle,
    Clock,
    Eye,
    Phone,
    Mail,
    Trash2,
    UserCheck,
    Search,
    Filter,
    Plus,
    XCircle,
    MessageSquare
} from 'lucide-react'
import {
    useGetVendorsQuery,
    useAcceptVendorMutation,
    useDeleteVendorMutation,
    useRejectVendorMutation
} from '../../../services/adminApi'
import BaseModal from '../../ui/BaseModal'
import LoadingSpinner from '../../ui/LoadingSpinner'
import { useAdminLogout } from '../../../hooks/useAdminLogout'
import {
    formatCurrency,
    getVendorStatusColor,
    handleAdminError,
    confirmAction
} from '../../../utils/adminUtils'

function VendorsComp({ loaded, setLoaded }) {
    const navigate = useRouter()
    const { logout } = useAdminLogout()

    const [vendors, setVendors] = useState([])
    const [total, setTotal] = useState(0)
    const [searchTerm, setSearchTerm] = useState('')
    const [statusFilter, setStatusFilter] = useState('all')
    const [currentPage, setCurrentPage] = useState(1)
    const [viewModal, setViewModal] = useState({
        isOpen: false,
        vendor: null
    })
    const [feedbackModal, setFeedbackModal] = useState({
        isOpen: false,
        vendor: null,
        action: '', // 'approve' or 'reject'
        feedback: ''
    })

    // RTK Query hooks
    const { data, error, isLoading: queryLoading, refetch } = useGetVendorsQuery({ 
        skip: (currentPage - 1) * 10,
        limit: 10,
        search: searchTerm,
        status: statusFilter
    })
    const [acceptVendor, { isLoading: acceptLoading }] = useAcceptVendorMutation()
    const [deleteVendor, { isLoading: deleteLoading }] = useDeleteVendorMutation()
    const [rejectVendor, { isLoading: rejectLoading }] = useRejectVendorMutation()

    useEffect(() => {
        if (data) {
            // Fix data structure mismatch - backend returns { data: { vendors, total } }
            setVendors(data.data?.vendors || data.vendors || [])
            setTotal(data.data?.total || data.total || 0)
            setLoaded(true)
        }
        if (queryLoading) setLoaded(false)
        if (error) {
            setLoaded(true)
            if (error.status === 401) {
                logout()
            }
        }
    }, [data, error, setLoaded, logout])

    const handleAcceptVendor = async (vendor) => {
        setFeedbackModal({
            isOpen: true,
            vendor,
            action: 'approve',
            feedback: ''
        })
    }

    const handleRejectVendor = async (vendor) => {
        setFeedbackModal({
            isOpen: true,
            vendor,
            action: 'reject',
            feedback: ''
        })
    }

    const handleFeedbackSubmit = async () => {
        const { vendor, action, feedback } = feedbackModal
        
        if (action === 'approve') {
            try {
                const res = await acceptVendor({
                    email: vendor.email,
                    address: {
                        pickup_location: vendor._id,
                        name: vendor.adharName || vendor.name,
                        email: vendor.email,
                        phone: vendor.number,
                        address: `${vendor.address || ''} pin code ${vendor.pinCode || ''}`,
                        address_2: "",
                        pin_code: vendor.pinCode || '',
                        city: vendor.city || '',
                        state: vendor.state || '',
                        country: "India",
                    }
                })
                
                // Check for successful response
                if (res.data) {
                    toast.success('Vendor accepted successfully')
                    refetch()
                    setFeedbackModal({ isOpen: false, vendor: null, action: '', feedback: '' })
                } else {
                    toast.error('Failed to accept vendor')
                }
            } catch (error) {
                const errorMessage = handleAdminError(error, logout, 'Failed to accept vendor')
                if (errorMessage) toast.error(errorMessage)
            }
        } else if (action === 'reject') {
            if (!feedback.trim()) {
                toast.error('Please provide a rejection reason')
                return
            }
            
            try {
                const res = await rejectVendor({
                    vendorId: vendor._id,
                    rejectionReason: feedback.trim()
                })
                
                // Check for successful response
                if (res.data) {
                    toast.success('Vendor rejected successfully')
                    refetch()
                    setFeedbackModal({ isOpen: false, vendor: null, action: '', feedback: '' })
                } else {
                    toast.error('Failed to reject vendor')
                }
            } catch (error) {
                const errorMessage = handleAdminError(error, logout, 'Failed to reject vendor')
                if (errorMessage) toast.error(errorMessage)
            }
        }
    }

    const handleDeleteVendor = async (vendor) => {
        if (confirmAction(`Do you want to delete vendor "${vendor.adharName || vendor.name}"?`)) {
            try {
                const res = await deleteVendor({
                    email: vendor.email,
                    vendorId: vendor._id
                })
                
                // Check for successful response
                if (res.data) {
                    toast.success('Vendor deleted successfully')
                    refetch()
                } else {
                    toast.error('Failed to delete vendor')
                }
            } catch (error) {
                const errorMessage = handleAdminError(error, logout, 'Failed to delete vendor')
                if (errorMessage) toast.error(errorMessage)
            }
        }
    }

    const handleViewVendor = (vendor) => {
        setViewModal({
            isOpen: true,
            vendor
        })
    }

    const handlePageChange = (page) => {
        setCurrentPage(page)
    }

    const totalPages = Math.ceil(total / 10)

    // Filter vendors based on search and status
    const filteredVendors = vendors.filter(vendor => {
        const matchesSearch = vendor.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            vendor.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            vendor.businessName?.toLowerCase().includes(searchTerm.toLowerCase())
        
        const matchesStatus = statusFilter === 'all' || 
                            (statusFilter === 'approved' && vendor.status === 'approved') ||
                            (statusFilter === 'pending' && vendor.status === 'pending') ||
                            (statusFilter === 'rejected' && vendor.status === 'rejected')
        
        return matchesSearch && matchesStatus
    })

    if (!loaded) return <LoadingSpinner text="Loading vendors..." />

    return (
        <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center">
                        <div className="p-2 bg-green-100 rounded-lg">
                            <CheckCircle className="h-6 w-6 text-green-600" />
                        </div>
                        <div className="ml-4">
                            <p className="text-sm text-gray-600">Total Vendors</p>
                            <p className="text-2xl font-bold text-gray-900">{total}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center">
                        <div className="p-2 bg-green-100 rounded-lg">
                            <UserCheck className="h-6 w-6 text-green-600" />
                        </div>
                        <div className="ml-4">
                            <p className="text-sm text-gray-600">Approved Vendors</p>
                            <p className="text-2xl font-bold text-gray-900">
                                {vendors.filter(v => v.status === 'approved').length}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center">
                        <div className="p-2 bg-yellow-100 rounded-lg">
                            <Clock className="h-6 w-6 text-yellow-600" />
                        </div>
                        <div className="ml-4">
                            <p className="text-sm text-gray-600">Pending Vendors</p>
                            <p className="text-2xl font-bold text-gray-900">
                                {vendors.filter(v => v.status === 'pending').length}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center">
                        <div className="p-2 bg-red-100 rounded-lg">
                            <XCircle className="h-6 w-6 text-red-600" />
                        </div>
                        <div className="ml-4">
                            <p className="text-sm text-gray-600">Rejected Vendors</p>
                            <p className="text-2xl font-bold text-gray-900">
                                {vendors.filter(v => v.status === 'rejected').length}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-lg shadow">
                <div className="p-6 border-b border-gray-200">
                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="flex-1">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                                <input
                                    type="text"
                                    placeholder="Search vendors..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                                <option value="all">All Status</option>
                                <option value="approved">Approved</option>
                                <option value="pending">Pending</option>
                                <option value="rejected">Rejected</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Vendors Table */}
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Vendor
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Contact
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Business
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Status
                                </th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {filteredVendors.map((vendor, index) => (
                                <tr key={vendor._id || index} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <div>
                                                <div className="text-sm font-medium text-gray-900">
                                                    {vendor.name || vendor.adharName}
                                                </div>
                                                <div className="text-sm text-gray-500">
                                                    ID: {vendor._id}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center text-sm text-gray-900">
                                            <Mail size={14} className="mr-2 text-gray-400" />
                                            {vendor.email}
                                        </div>
                                        <div className="flex items-center text-sm text-gray-500">
                                            <Phone size={14} className="mr-2 text-gray-400" />
                                            {vendor.number || 'N/A'}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-900">
                                            {vendor.businessName || 'N/A'}
                                        </div>
                                        <div className="text-sm text-gray-500">
                                            {vendor.businessType || 'N/A'}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getVendorStatusColor(vendor.status || 'pending')}`}>
                                            {vendor.status === 'approved' ? 'Approved' : 
                                             vendor.status === 'pending' ? 'Pending' : 
                                             vendor.status === 'rejected' ? 'Rejected' : 
                                             vendor.status === 'deleted' ? 'Deleted' : 'Unknown'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <div className="flex justify-end space-x-2">
                                            <button
                                                onClick={() => handleViewVendor(vendor)}
                                                className="text-blue-600 hover:text-blue-900 bg-blue-50 hover:bg-blue-100 px-3 py-1 rounded-md text-xs font-medium transition-colors"
                                            >
                                                <Eye size={14} className="inline mr-1" />
                                                View
                                            </button>
                                            {vendor.status === 'pending' && (
                                                <>
                                                    <button
                                                        onClick={() => handleAcceptVendor(vendor)}
                                                        disabled={acceptLoading}
                                                        className="text-green-600 hover:text-green-900 bg-green-50 hover:bg-green-100 px-3 py-1 rounded-md text-xs font-medium transition-colors disabled:opacity-50"
                                                    >
                                                        <UserCheck size={14} className="inline mr-1" />
                                                        Accept
                                                    </button>
                                                    <button
                                                        onClick={() => handleRejectVendor(vendor)}
                                                        disabled={rejectLoading}
                                                        className="text-orange-600 hover:text-orange-900 bg-orange-50 hover:bg-orange-100 px-3 py-1 rounded-md text-xs font-medium transition-colors disabled:opacity-50"
                                                    >
                                                        <XCircle size={14} className="inline mr-1" />
                                                        Reject
                                                    </button>
                                                </>
                                            )}
                                            <button
                                                onClick={() => handleDeleteVendor(vendor)}
                                                disabled={deleteLoading}
                                                className="text-red-600 hover:text-red-900 bg-red-50 hover:bg-red-100 px-3 py-1 rounded-md text-xs font-medium transition-colors disabled:opacity-50"
                                            >
                                                <Trash2 size={14} className="inline mr-1" />
                                                Delete
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Empty State */}
                {filteredVendors.length === 0 && (
                    <div className="text-center py-12">
                        <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-lg font-medium text-gray-900 mb-2">
                            No vendors found
                        </p>
                        <p className="text-gray-500">
                            {statusFilter === 'approved' ? 'No approved vendors yet.' : 
                             statusFilter === 'pending' ? 'No pending vendors.' :
                             statusFilter === 'rejected' ? 'No rejected vendors.' :
                             'No vendors match your criteria.'}
                        </p>
                    </div>
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="px-6 py-4 border-t border-gray-200">
                        <div className="flex justify-between items-center">
                            <div className="text-sm text-gray-700">
                                Showing {((currentPage - 1) * 10) + 1} to {Math.min(currentPage * 10, total)} of {total} results
                            </div>
                            <div className="flex space-x-2">
                                <button
                                    onClick={() => handlePageChange(currentPage - 1)}
                                    disabled={currentPage === 1}
                                    className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Previous
                                </button>
                                <span className="px-3 py-2 text-sm font-medium text-gray-700">
                                    Page {currentPage} of {totalPages}
                                </span>
                                <button
                                    onClick={() => handlePageChange(currentPage + 1)}
                                    disabled={currentPage === totalPages}
                                    className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Next
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* View Vendor Modal */}
            <BaseModal
                isOpen={viewModal.isOpen}
                onClose={() => setViewModal({ isOpen: false, vendor: null })}
                title="Vendor Details"
                size="lg"
            >
                {viewModal.vendor && (
                    <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <h3 className="text-lg font-medium text-gray-900 mb-2">Personal Information</h3>
                                <div className="space-y-2">
                                    <p><span className="font-medium">Name:</span> {viewModal.vendor.name || viewModal.vendor.adharName}</p>
                                    <p><span className="font-medium">Email:</span> {viewModal.vendor.email}</p>
                                    <p><span className="font-medium">Phone:</span> {viewModal.vendor.number || 'N/A'}</p>
                                    <p><span className="font-medium">Address:</span> {viewModal.vendor.address || 'N/A'}</p>
                                    <p><span className="font-medium">City:</span> {viewModal.vendor.city || 'N/A'}</p>
                                    <p><span className="font-medium">State:</span> {viewModal.vendor.state || 'N/A'}</p>
                                    <p><span className="font-medium">PIN Code:</span> {viewModal.vendor.pinCode || 'N/A'}</p>
                                </div>
                            </div>
                            <div>
                                <h3 className="text-lg font-medium text-gray-900 mb-2">Business Information</h3>
                                <div className="space-y-2">
                                    <p><span className="font-medium">Business Name:</span> {viewModal.vendor.businessName || 'N/A'}</p>
                                    <p><span className="font-medium">Business Type:</span> {viewModal.vendor.businessType || 'N/A'}</p>
                                    <p><span className="font-medium">Status:</span>
                                        <span className={`ml-2 inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getVendorStatusColor(viewModal.vendor.status)}`}>
                                            {viewModal.vendor.status === 'approved' ? 'Approved' : 
                                             viewModal.vendor.status === 'pending' ? 'Pending' : 
                                             viewModal.vendor.status === 'rejected' ? 'Rejected' : 'Unknown'}
                                        </span>
                                    </p>
                                    {viewModal.vendor.status === 'rejected' && viewModal.vendor.adminRejectionReason && (
                                        <p><span className="font-medium">Rejection Reason:</span> {viewModal.vendor.adminRejectionReason}</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </BaseModal>

            {/* Feedback Modal for Approve/Reject */}
            <BaseModal
                isOpen={feedbackModal.isOpen}
                onClose={() => setFeedbackModal({ isOpen: false, vendor: null, action: '', feedback: '' })}
                title={`${feedbackModal.action === 'approve' ? 'Approve' : 'Reject'} Vendor`}
                size="md"
            >
                <div className="space-y-4">
                    <div className="bg-gray-50 p-4 rounded-lg">
                        <h3 className="font-medium text-gray-900 mb-2">Vendor Information</h3>
                        <p className="text-sm text-gray-600">
                            <span className="font-medium">Name:</span> {feedbackModal.vendor?.name || feedbackModal.vendor?.adharName}
                        </p>
                        <p className="text-sm text-gray-600">
                            <span className="font-medium">Email:</span> {feedbackModal.vendor?.email}
                        </p>
                        <p className="text-sm text-gray-600">
                            <span className="font-medium">Business:</span> {feedbackModal.vendor?.businessName || 'N/A'}
                        </p>
                    </div>

                    {feedbackModal.action === 'approve' ? (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Approval Message (Optional)
                            </label>
                            <textarea
                                value={feedbackModal.feedback}
                                onChange={(e) => setFeedbackModal({ ...feedbackModal, feedback: e.target.value })}
                                placeholder="Add a welcome message or any notes for the vendor..."
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                rows={3}
                            />
                        </div>
                    ) : (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Rejection Reason <span className="text-red-500">*</span>
                            </label>
                            <textarea
                                value={feedbackModal.feedback}
                                onChange={(e) => setFeedbackModal({ ...feedbackModal, feedback: e.target.value })}
                                placeholder="Please provide a clear reason for rejection..."
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-transparent"
                                rows={3}
                                required
                            />
                            <p className="text-xs text-gray-500 mt-1">
                                This reason will be shared with the vendor and they can reapply after addressing the issues.
                            </p>
                        </div>
                    )}

                    <div className="flex justify-end space-x-3 pt-4">
                        <button
                            onClick={() => setFeedbackModal({ isOpen: false, vendor: null, action: '', feedback: '' })}
                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleFeedbackSubmit}
                            disabled={feedbackModal.action === 'reject' && !feedbackModal.feedback.trim()}
                            className={`px-4 py-2 text-sm font-medium text-white rounded-md ${
                                feedbackModal.action === 'approve' 
                                    ? 'bg-green-600 hover:bg-green-700' 
                                    : 'bg-red-600 hover:bg-red-700'
                            } disabled:opacity-50 disabled:cursor-not-allowed`}
                        >
                            {feedbackModal.action === 'approve' ? 'Approve Vendor' : 'Reject Vendor'}
                        </button>
                    </div>
                </div>
            </BaseModal>
        </div>
    )
}

export default VendorsComp 