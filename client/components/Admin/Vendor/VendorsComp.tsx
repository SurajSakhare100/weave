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
    RefreshCw
} from 'lucide-react'
import {
    useGetVendorsQuery,
    useAcceptVendorMutation,
    useRejectVendorMutation
} from '../../../services/adminApi'
import BaseModal from '../../ui/BaseModal'
import LoadingSpinner from '../../ui/LoadingSpinner'
import RejectionModal from './RejectionModal'
import ApprovalModal from './ApprovalModal'
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
    const [accepted, setAccepted] = useState(true)
    const [isLoading, setIsLoading] = useState(false)
    const [searchTerm, setSearchTerm] = useState('')
    const [statusFilter, setStatusFilter] = useState('all')
    const [currentPage, setCurrentPage] = useState(1)
    const [rejectionModal, setRejectionModal] = useState({
        isOpen: false,
        vendor: null
    })
    const [approvalModal, setApprovalModal] = useState({
        isOpen: false,
        vendor: null
    })

    // RTK Query hooks
    const { data, error, isLoading: queryLoading, refetch } = useGetVendorsQuery({ 
        accept: accepted, 
        skip: (currentPage - 1) * 10 
    })
    const [acceptVendor, { isLoading: acceptLoading }] = useAcceptVendorMutation()
    const [rejectVendor, { isLoading: rejectLoading }] = useRejectVendorMutation()

    useEffect(() => {
        if (data) {
            setVendors(data.vendors)
            setTotal(data.total)
            setLoaded(true)
        }
        if (queryLoading) setLoaded(false)
        if (error) {
            setLoaded(true)
            if ((error as any).status === 401) {
                logout()
            }
        }
    }, [data, error, setLoaded, logout])

    const handleAcceptVendor = async (vendor) => {
        setApprovalModal({
            isOpen: true,
            vendor
        })
    }

    const handleAcceptSubmit = async (feedback) => {
        try {
            const res = await acceptVendor({
                vendorId: approvalModal.vendor._id,
                feedback: feedback
            })
            if (res.data && res.data.login) {
                logout()
            } else {
                toast.success('Vendor accepted successfully')
                setApprovalModal({ isOpen: false, vendor: null })
                refetch()
            }
        } catch (error) {
            const errorMessage = handleAdminError(error, logout, 'Failed to accept vendor')
            if (errorMessage) toast.error(errorMessage)
        }
    }

    const handleRejectVendor = async (vendor) => {
        setRejectionModal({
            isOpen: true,
            vendor
        })
    }

    const handleRejectSubmit = async (reason) => {
        try {
            const res = await rejectVendor({
                vendorId: rejectionModal.vendor._id,
                rejectionReason: reason
            })
            if (res.data && res.data.login) {
                logout()
            } else {
                toast.success('Vendor rejected successfully')
                setRejectionModal({ isOpen: false, vendor: null })
                refetch()
            }
        } catch (error) {
            const errorMessage = handleAdminError(error, logout, 'Failed to reject vendor')
            if (errorMessage) toast.error(errorMessage)
        }
    }

    const handleViewVendor = (vendor) => {
        // Navigate to vendor details page
        navigate.push(`/admin/vendor/${vendor._id}`)
    }

   

    const handlePageChange = (page) => {
        setCurrentPage(page)
    }

    const totalPages = Math.ceil(total / 10)

    // Filter vendors based on search and status
    const filteredVendors = vendors?.filter(vendor => {
        const matchesSearch = vendor.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            vendor.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            vendor.businessName?.toLowerCase().includes(searchTerm.toLowerCase())
        
        const matchesStatus = statusFilter === 'all' || 
                            (statusFilter === 'approved' && vendor.status === 'approved') ||
                            (statusFilter === 'pending' && vendor.status === 'pending') ||
                            (statusFilter === 'rejected' && vendor.status === 'rejected')
        
        return matchesSearch && matchesStatus
    })

    // Get unique statuses from vendors
    const statuses = [...new Set(vendors?.map(vendor => {
        if (vendor.status === 'approved') return 'Approved'
        if (vendor.status === 'rejected') return 'Rejected'
        return 'Pending'
    }).filter(Boolean))]

    if (!loaded) return <LoadingSpinner text="Loading vendors..." />

    return (
        <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
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
                                {vendors?.filter(v => v.status === 'approved').length}
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
                                {vendors?.filter(v => v.status === 'pending').length}
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
                                {vendors?.filter(v => v.status === 'rejected').length}
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
                            {filteredVendors?.map((vendor, index) => (
                                <tr key={vendor._id || index} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <div>
                                                <div className="text-sm font-medium text-gray-900">
                                                    {vendor.name}
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
                                            {vendor.city}, {vendor.state}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getVendorStatusColor(vendor.status)}`}>
                                            {vendor.status === 'approved' ? 'Approved' : 
                                             vendor.status === 'rejected' ? 'Rejected' : 'Pending'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <div className="flex justify-end space-x-2">
                                            <button
                                                onClick={() => handleViewVendor(vendor)}
                                                className="text-blue-600 hover:text-blue-900 bg-blue-50 hover:bg-blue-100 px-3 py-1 rounded-md text-xs font-medium transition-colors"
                                            >
                                                <Eye size={14} className="inline mr-1" />
                                                View Details
                                            </button>
                                            {vendor.status === 'pending' && (
                                                <button
                                                    onClick={() => handleAcceptVendor(vendor)}
                                                    disabled={acceptLoading}
                                                    className="text-green-600 hover:text-green-900 bg-green-50 hover:bg-green-100 px-3 py-1 rounded-md text-xs font-medium transition-colors disabled:opacity-50"
                                                >
                                                    <UserCheck size={14} className="inline mr-1" />
                                                    Accept
                                                </button>
                                            )}
                                            {vendor.status === 'pending' && (
                                                <button
                                                    onClick={() => handleRejectVendor(vendor)}
                                                    disabled={rejectLoading}
                                                    className="text-red-600 hover:text-red-900 bg-red-50 hover:bg-red-100 px-3 py-1 rounded-md text-xs font-medium transition-colors disabled:opacity-50"
                                                >
                                                    <XCircle size={14} className="inline mr-1" />
                                                    Reject
                                                </button>
                                            )}
                                            
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Empty State */}
                {filteredVendors?.length === 0 && (
                    <div className="text-center py-12">
                        <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-lg font-medium text-gray-900 mb-2">
                            No vendors found
                        </p>
                        <p className="text-gray-500">
                            {statusFilter === 'approved' ? 'No approved vendors yet.' : 
                             statusFilter === 'rejected' ? 'No rejected vendors found.' :
                             statusFilter === 'pending' ? 'No pending vendors found.' :
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

            {/* Rejection Modal */}
            <RejectionModal
                isOpen={rejectionModal.isOpen}
                onClose={() => setRejectionModal({ isOpen: false, vendor: null })}
                onReject={handleRejectSubmit}
                vendorName={rejectionModal.vendor?.name || 'Unknown Vendor'}
                isLoading={rejectLoading}
            />

            {/* Approval Modal */}
            <ApprovalModal
                isOpen={approvalModal.isOpen}
                onClose={() => setApprovalModal({ isOpen: false, vendor: null })}
                onApprove={handleAcceptSubmit}
                vendorName={approvalModal.vendor?.name || 'Unknown Vendor'}
                isLoading={acceptLoading}
            />
        </div>
    )
}

export default VendorsComp 