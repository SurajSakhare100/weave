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

  const logOut = () => {
    localStorage.removeItem("adminToken")
    setLoaded(true)
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
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-4">
            <Users className="h-8 w-8 text-primary-600" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Vendors</h1>
              <p className="text-gray-600">Manage vendor accounts and their status</p>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="card p-4">
              <div className="flex items-center">
                <CheckCircle className="h-5 w-5 text-success-600 mr-3" />
                <div>
                  <p className="text-sm text-gray-600">Accepted Vendors</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {vendors.filter(v => v.accept).length}
                  </p>
                </div>
              </div>
            </div>
            <div className="card p-4">
              <div className="flex items-center">
                <Clock className="h-5 w-5 text-warning-600 mr-3" />
                <div>
                  <p className="text-sm text-gray-600">Pending Vendors</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {vendors.filter(v => !v.accept).length}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="mb-6">
          <div className="flex space-x-1 bg-white rounded-lg p-1 shadow-soft">
            <button
              onClick={() => {
                refetch()
                setAccepted(true)
              }}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                accepted
                  ? 'bg-success-600 text-white'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              <CheckCircle size={16} className="mr-2 inline" />
              Accepted Vendors
            </button>
            <button
              onClick={() => {
                refetch()
                setAccepted(false)
              }}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                !accepted
                  ? 'bg-warning-600 text-white'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              <Clock size={16} className="mr-2 inline" />
              Pending Vendors
            </button>
          </div>
        </div>

        {/* Vendors Table */}
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Vendor Details
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {vendors.length > 0 ? (
                  vendors.map((vendor, key) => (
                    <tr key={key} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {vendor.adharName}
                          </div>
                          <div className="text-sm text-gray-500">
                            ID: {vendor._id.slice(-8)}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          <div className="flex items-center text-sm text-gray-900">
                            <Mail size={14} className="mr-2 text-gray-400" />
                            {vendor.email}
                          </div>
                          <div className="flex items-center text-sm text-gray-500">
                            <Phone size={14} className="mr-2 text-gray-400" />
                            {vendor.number}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          vendor.accept 
                            ? 'text-success-600 bg-success-50' 
                            : 'text-warning-600 bg-warning-50'
                        }`}>
                          {vendor.accept ? 'Accepted' : 'Pending'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                        <button
                          onClick={() => navigate.push(`/admin/vendor/details/${vendor._id}`)}
                          className="btn-outline text-xs"
                        >
                          <Eye size={14} className="mr-1" />
                          Details
                        </button>

                        {vendor.accept ? (
                          <button
                            onClick={() => navigate.push(`/admin/vendor/products/${vendor._id}`)}
                            className="btn-secondary text-xs"
                          >
                            <Package size={14} className="mr-1" />
                            Products
                          </button>
                        ) : (
                          <button
                            onClick={() => handleAcceptVendor(vendor)}
                            className="bg-success-600 hover:bg-success-700 text-white text-xs px-3 py-1 rounded-lg transition-colors"
                          >
                            <UserCheck size={14} className="mr-1" />
                            Accept
                          </button>
                        )}

                        <button
                          onClick={() => handleDeleteVendor(vendor)}
                          className="bg-error-600 hover:bg-error-700 text-white text-xs px-3 py-1 rounded-lg transition-colors"
                        >
                          <Trash2 size={14} className="mr-1" />
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="px-6 py-8 text-center text-gray-500">
                      <div className="flex flex-col items-center">
                        <Users className="h-12 w-12 text-gray-400 mb-4" />
                        <p className="text-lg font-medium text-gray-900 mb-2">
                          No {accepted ? 'accepted' : 'pending'} vendors found
                        </p>
                        <p className="text-gray-600">
                          {accepted ? 'Accepted vendors will appear here' : 'Pending vendor applications will appear here'}
                        </p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Load More Button */}
          {vendors.length < total && (
            <div className="px-6 py-4 border-t border-gray-200 text-center">
              <button
                onClick={handleLoadMore}
                disabled={isLoading}
                className="btn-outline disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <div className="spinner mr-2"></div>
                    Loading...
                  </>
                ) : (
                  'Load More Vendors'
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Vendors