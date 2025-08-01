import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { 
  Users, 
  CheckCircle, 
  XCircle, 
  Eye, 
  Mail,
  Phone,
  Building,
  Calendar,
  AlertCircle
} from 'lucide-react';
import { Button } from '../../ui/button';
import { toast } from 'sonner';
import { getPendingVendors, approveVendor, rejectVendor } from '../../../services/adminApi';

function PendingVendors({ loaded, setLoaded }) {
  const router = useRouter();
  const [vendors, setVendors] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [rejectModal, setRejectModal] = useState({ show: false, vendor: null, reason: '' });

  useEffect(() => {
    fetchPendingVendors();
  }, []);

  const fetchPendingVendors = async () => {
    setLoading(true);
    try {
      const response = await getPendingVendors({ skip: 0, limit: 50 });
      if (response.success) {
        setVendors(response.vendors);
        setTotal(response.total);
      }
    } catch (error) {
      console.error('Error fetching pending vendors:', error);
      toast.error('Failed to load pending vendors');
    } finally {
      setLoading(false);
      setLoaded(true);
    }
  };

  const handleApproveVendor = async (vendor) => {
    try {
      const response = await approveVendor(vendor._id);
      if (response.success) {
        toast.success('Vendor approved successfully');
        fetchPendingVendors(); // Refresh the list
      }
    } catch (error) {
      console.error('Error approving vendor:', error);
      toast.error('Failed to approve vendor');
    }
  };

  const handleRejectVendor = async () => {
    if (!rejectModal.reason.trim()) {
      toast.error('Please provide a rejection reason');
      return;
    }

    try {
      const response = await rejectVendor(rejectModal.vendor._id, rejectModal.reason);
      if (response.success) {
        toast.success('Vendor rejected successfully');
        setRejectModal({ show: false, vendor: null, reason: '' });
        fetchPendingVendors(); // Refresh the list
      }
    } catch (error) {
      console.error('Error rejecting vendor:', error);
      toast.error('Failed to reject vendor');
    }
  };

  const openRejectModal = (vendor) => {
    setRejectModal({ show: true, vendor, reason: '' });
  };

  const closeRejectModal = () => {
    setRejectModal({ show: false, vendor: null, reason: '' });
  };

  if (!loaded) {
    return (
      <div className="min-h-screen admin-bg-secondary flex items-center justify-center">
        <div className="flex items-center space-x-3">
          <div className="admin-spinner h-6 w-6"></div>
          <span className="admin-text-secondary">Loading pending vendors...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen admin-bg-secondary">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-4">
            <Users className="h-8 w-8 text-[#5A9BD8]" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Pending Vendor Approvals</h1>
              <p className="text-gray-600">Review and approve new vendor applications</p>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center">
                <div className="p-3 bg-orange-100 rounded-lg">
                  <AlertCircle className="h-6 w-6 text-orange-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Pending Approvals</p>
                  <p className="text-2xl font-bold text-gray-900">{total}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Vendors Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Vendor Applications</h3>
          </div>

          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#5A9BD8] mx-auto"></div>
              <p className="mt-2 text-gray-600">Loading vendors...</p>
            </div>
          ) : vendors.length === 0 ? (
            <div className="p-8 text-center">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No pending vendors</h3>
              <p className="text-gray-600">All vendor applications have been processed.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="admin-bg-secondary">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Vendor Details
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Contact Info
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Business Details
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Applied Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {vendors.map((vendor) => (
                    <tr key={vendor._id} className="hover:admin-bg-secondary">
                      <td className="px-6 py-4">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {vendor.businessName || vendor.name}
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
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          {vendor.businessAddress && (
                            <div className="flex items-center text-sm text-gray-500">
                              <Building size={14} className="mr-2 text-gray-400" />
                              {vendor.businessAddress}
                            </div>
                          )}
                          {vendor.gstin && (
                            <div className="text-sm text-gray-500">
                              GSTIN: {vendor.gstin}
                            </div>
                          )}
                          {vendor.pan && (
                            <div className="text-sm text-gray-500">
                              PAN: {vendor.pan}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex items-center">
                          <Calendar size={14} className="mr-2 text-gray-400" />
                          {new Date(vendor.createdAt).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                        <Button
                          onClick={() => handleApproveVendor(vendor)}
                          className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 text-xs"
                        >
                          <CheckCircle size={14} className="mr-1" />
                          Approve
                        </Button>
                        <Button
                          onClick={() => openRejectModal(vendor)}
                          className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 text-xs"
                        >
                          <XCircle size={14} className="mr-1" />
                          Reject
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Reject Modal */}
      {rejectModal.show && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Reject Vendor Application</h3>
              <p className="text-sm text-gray-600 mb-4">
                Are you sure you want to reject <strong>{rejectModal.vendor?.businessName || rejectModal.vendor?.name}</strong>?
              </p>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Rejection Reason *
                </label>
                <textarea
                  value={rejectModal.reason}
                  onChange={(e) => setRejectModal({ ...rejectModal, reason: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#5A9BD8]"
                  rows={3}
                  placeholder="Please provide a reason for rejection..."
                  required
                />
              </div>
              <div className="flex justify-end space-x-3">
                <Button
                  onClick={closeRejectModal}
                  className="bg-gray-300 hover:bg-gray-400 text-gray-700"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleRejectVendor}
                  className="bg-red-600 hover:bg-red-700 text-white"
                >
                  Reject
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default PendingVendors; 