import Loading from '../../../components/Loading'
import { useRouter } from 'next/router'
import { useState, useEffect } from 'react'
import {
  useGetVendorsQuery,
  useAcceptVendorMutation,
  useDeleteVendorMutation
} from '../../../services/adminApi';
import { 
    Users, 
    CheckCircle, 
    Clock, 
    Eye, 
    Package, 
    UserCheck,
    Trash2,
    Phone,
    Mail
} from 'lucide-react'

function Vendors({ loaded, setLoaded }) {
  const navigate = useRouter()
  const [vendors, setVendors] = useState([])
  const [total, setTotal] = useState(0)
  const [accepted, setAccepted] = useState(true)
  const [isLoading, setIsLoading] = useState(false)
  // RTK Query hooks
  const { data, error, isLoading: queryLoading, refetch } = useGetVendorsQuery({ accept: accepted, skip: 0 });
  const [acceptVendor] = useAcceptVendorMutation();
  const [deleteVendor] = useDeleteVendorMutation();

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
      setVendors(data.vendors)
      setTotal(data.total)
      setLoaded(true)
    }
    if (queryLoading) setLoaded(false)
    if (error) setLoaded(true)
  }, [data, queryLoading, error, setLoaded])

  const handleAcceptVendor = async (vendor) => {
    try {
      const res = await acceptVendor({
        email: vendor.email,
        address: {
          pickup_location: vendor._id,
          name: vendor.adharName,
          email: vendor.email,
          phone: vendor.number,
          address: `${vendor.address} pin code ${vendor.pinCode}`,
          address_2: "",
          pin_code: vendor.pinCode,
          city: vendor.city,
          state: vendor.state,
          country: "India",
        }
      });
      if (res.data && res.data.login) {
        logOut();
      } else {
        alert("Vendor accepted successfully");
        refetch();
      }
    } catch (err) {
      alert("Error accepting vendor");
    }
  }

  const handleDeleteVendor = async (vendor) => {
    if (window.confirm(`Do you want to delete vendor "${vendor.adharName}"?`)) {
      try {
        const res = await deleteVendor({
          email: vendor.email,
          vendorId: vendor._id
        });
        if (res.data && res.data.login) {
          logOut();
        } else {
          alert("Vendor deleted successfully");
          refetch();
        }
      } catch (err) {
        alert("Error deleting vendor");
      }
    }
  }

  const handleLoadMore = () => {
    refetch()
  }

  if (!loaded) return <Loading />

  return (
    <div className="min-h-screen admin-bg-secondary">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold admin-text-primary">Vendors</h1>
          <p className="admin-text-secondary">Manage vendor accounts and their status</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="admin-card p-4">
            <div className="flex items-center">
              <div className="p-2 admin-bg-success-light rounded-lg">
                <CheckCircle className="h-6 w-6 admin-text-success-dark" />
              </div>
              <div className="ml-4">
                <p className="text-sm admin-text-secondary">Accepted Vendors</p>
                <p className="text-2xl font-bold admin-text-primary">
                  {vendors.filter(v => v.adminApproved).length}
                </p>
              </div>
            </div>
          </div>

          <div className="admin-card p-4">
            <div className="flex items-center">
              <div className="p-2 admin-bg-warning-light rounded-lg">
                <Clock className="h-6 w-6 admin-text-warning-dark" />
              </div>
              <div className="ml-4">
                <p className="text-sm admin-text-secondary">Pending Vendors</p>
                <p className="text-2xl font-bold admin-text-primary">
                  {vendors.filter(v => !v.adminApproved).length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="mb-6">
          <div className="flex space-x-1 admin-card p-1">
            <button
              onClick={() => setActiveTab('all')}
              className={`flex-1 py-2 px-4 text-sm font-medium rounded-md transition-colors ${
                activeTab === 'all'
                  ? 'admin-btn-primary'
                  : 'admin-btn-outline'
              }`}
            >
              All Vendors
            </button>
            <button
              onClick={() => setActiveTab('approved')}
              className={`flex-1 py-2 px-4 text-sm font-medium rounded-md transition-colors ${
                activeTab === 'approved'
                  ? 'admin-btn-primary'
                  : 'admin-btn-outline'
              }`}
            >
              Approved
            </button>
          </div>
        </div>

        {/* Vendors Table */}
        <div className="admin-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y admin-border-primary">
              <thead className="admin-bg-tertiary">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium admin-text-tertiary uppercase tracking-wider">
                    Vendor
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium admin-text-tertiary uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium admin-text-tertiary uppercase tracking-wider">
                    Business
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium admin-text-tertiary uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="admin-bg-primary divide-y admin-border-primary">
                {filteredVendors.map((vendor, key) => (
                  <tr key={key} className="hover:admin-bg-secondary">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div>
                          <div className="text-sm font-medium admin-text-primary">
                            {vendor.name}
                          </div>
                          <div className="text-sm admin-text-secondary">
                            ID: {vendor._id}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm admin-text-primary">
                        <Mail size={14} className="mr-2 admin-text-tertiary" />
                        {vendor.email}
                      </div>
                      <div className="flex items-center text-sm admin-text-secondary">
                        <Phone size={14} className="mr-2 admin-text-tertiary" />
                        {vendor.number || 'N/A'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm admin-text-primary">
                        {vendor.businessName || 'N/A'}
                      </div>
                      <div className="text-sm admin-text-secondary">
                        {vendor.businessType || 'N/A'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        vendor.adminApproved
                          ? 'admin-badge admin-badge-success'
                          : 'admin-badge admin-badge-warning'
                      }`}>
                        {vendor.adminApproved ? 'Approved' : 'Pending'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleViewVendor(vendor)}
                        className="admin-btn admin-btn-outline text-xs py-1"
                      >
                        <Eye size={14} className="mr-1" />
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Empty State */}
        {filteredVendors.length === 0 && (
          <div className="text-center py-12">
            <Users className="h-12 w-12 admin-text-tertiary mb-4" />
            <p className="text-lg font-medium admin-text-primary mb-2">
              No vendors found
            </p>
            <p className="admin-text-secondary">
              {activeTab === 'approved' ? 'No approved vendors yet.' : 'No vendors match your criteria.'}
            </p>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t admin-border-primary text-center">
            <div className="flex justify-center space-x-2">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="admin-btn admin-btn-outline disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <span className="inline-flex items-center px-4 py-2 text-sm font-medium admin-text-secondary">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="admin-btn admin-btn-outline disabled:opacity-50 disabled:cursor-not-allowed"
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

export default Vendors