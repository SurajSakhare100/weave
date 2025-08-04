import VendorLayout from '@/components/Vendor/VendorLayout';
import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/router';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../store/store';
import { setProfile, updateProfile, setLoading, setError, clearError } from '../../features/vendor/vendorSlice';
import { getVendorProfile, updateVendorProfile } from '../../services/vendorService';
import { isVendorAuthenticated } from '../../utils/vendorAuth';
import { useReapplyVendorMutation } from '../../services/adminApi';
import { 
  User, 
  Mail, 
  Phone, 
  Building, 
  Save, 
  Edit, 
  AlertCircle,
  CheckCircle,
  RefreshCw,
  XCircle,
  MapPin
} from 'lucide-react';

export default function VendorProfilePage() {
  const router = useRouter();
  const dispatch = useDispatch();
  const { profile, loading, error } = useSelector((state: RootState) => state.vendor);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    number: '',
    businessName: '',
    address: '',
    city: '',
    state: '',
    pinCode: ''
  });
  const [successMessage, setSuccessMessage] = useState('');
  const [reapplyVendor, { isLoading: reapplyLoading }] = useReapplyVendorMutation();

  const loadProfile = useCallback(async () => {
    try {
      dispatch(setLoading(true));
      const data = await getVendorProfile();
      dispatch(setProfile(data.data));
      
      // Set form data
      setFormData({
        name: data.data.name || '',
        email: data.data.email || '',
        number: data.data.number || '',
        businessName: data.data.businessName || '',
        address: data.data.address || '',
        city: data.data.city || '',
        state: data.data.state || '',
        pinCode: data.data.pinCode || ''
      });
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      const errorMessage = err.response?.data?.message || 'Failed to load profile';
      dispatch(setError(errorMessage));
    } finally {
      dispatch(setLoading(false));
    }
  }, [dispatch]);

  useEffect(() => {
    // Check authentication
    if (!isVendorAuthenticated()) {
      router.push('/vendor/login');
      return;
    }

    // Load profile data
    loadProfile();
  }, [router, loadProfile]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      dispatch(setLoading(true));
      dispatch(clearError());
      
      const response = await updateVendorProfile(formData);
      dispatch(updateProfile(response.data));
      
      setIsEditing(false);
      setSuccessMessage('Profile updated successfully!');
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      const errorMessage = err.response?.data?.message || 'Failed to update profile';
      dispatch(setError(errorMessage));
    } finally {
      dispatch(setLoading(false));
    }
  };

  const handleCancel = () => {
    // Reset form data to current profile
    if (profile) {
      setFormData({
        name: profile.name || '',
        email: profile.email || '',
        number: profile.number || '',
        businessName: profile.businessName || '',
        address: profile.address || '',
        city: profile.city || '',
        state: profile.state || '',
        pinCode: profile.pinCode || ''
      });
    }
    setIsEditing(false);
    dispatch(clearError());
  };

  const handleReapply = async () => {
    try {
      dispatch(setLoading(true));
      dispatch(clearError());
      
      const reapplyData = {
        name: formData.name,
        businessName: formData.businessName,
        address: formData.address,
        city: formData.city,
        state: formData.state,
        pinCode: formData.pinCode
      };

      await reapplyVendor(reapplyData).unwrap();
      
      setSuccessMessage('Reapplication submitted successfully! Your application is now pending admin review.');
      
      // Reload profile to get updated status
      await loadProfile();
      
      // Clear success message after 5 seconds
      setTimeout(() => setSuccessMessage(''), 5000);
    } catch (error: any) {
      const errorMessage = error?.data?.message || 'Failed to submit reapplication';
      dispatch(setError(errorMessage));
    } finally {
      dispatch(setLoading(false));
    }
  };

  if (!profile) {
    return (
      <VendorLayout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#5A9BD8]"></div>
        </div>
      </VendorLayout>
    );
  }

  return (
    <VendorLayout>
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Vendor Profile</h1>
            <p className="text-gray-600">Manage your business information and account settings</p>
          </div>

          {/* Status Alerts */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center">
              <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
              <span className="text-red-700 text-sm">{error}</span>
            </div>
          )}

          {successMessage && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center">
              <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
              <span className="text-green-700 text-sm">{successMessage}</span>
            </div>
          )}

          {/* Application Status */}
          {profile?.status === 'rejected' && (
            <div className="mb-6 p-6 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-start">
                <XCircle className="h-6 w-6 text-red-500 mr-3 mt-0.5" />
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-red-800 mb-2">Application Rejected</h3>
                  <p className="text-red-700 mb-3">
                    Your vendor application has been rejected. Please review the reason below and update your information before reapplying.
                  </p>
                  {profile?.adminRejectionReason && (
                    <div className="mb-4 p-3 bg-red-100 border border-red-200 rounded">
                      <p className="text-sm font-medium text-red-800 mb-1">Rejection Reason:</p>
                      <p className="text-sm text-red-700">{profile.adminRejectionReason}</p>
                    </div>
                  )}
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() => setIsEditing(true)}
                      className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Update Information
                    </button>
                    {isEditing && (
                      <button
                        onClick={handleReapply}
                        disabled={reapplyLoading || loading}
                        className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {reapplyLoading ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            Submitting...
                          </>
                        ) : (
                          <>
                            <RefreshCw className="h-4 w-4 mr-2" />
                            Reapply
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {profile?.status === 'approved' && profile?.adminApproved && (
            <div className="mb-6 p-6 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-start">
                <CheckCircle className="h-6 w-6 text-green-500 mr-3 mt-0.5" />
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-green-800 mb-2">Application Approved!</h3>
                  <p className="text-green-700 mb-3">
                    Congratulations! Your vendor application has been approved. You can now start selling your products on our platform.
                  </p>
                  {profile?.adminApprovedAt && (
                    <div className="mb-4 p-3 bg-green-100 border border-green-200 rounded">
                      <p className="text-sm font-medium text-green-800 mb-1">Approved On:</p>
                      <p className="text-sm text-green-700">
                        {new Date(profile.adminApprovedAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  )}
                  {profile?.adminApprovalFeedback && (
                    <div className="mb-4 p-3 bg-green-100 border border-green-200 rounded">
                      <p className="text-sm font-medium text-green-800 mb-1">Admin Feedback:</p>
                      <p className="text-sm text-green-700">{profile.adminApprovalFeedback}</p>
                    </div>
                  )}
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() => router.push('/vendor/products')}
                      className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                      <Building className="h-4 w-4 mr-2" />
                      Start Adding Products
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {profile?.status === 'pending' && (
            <div className="mb-6 p-6 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-start">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-yellow-500 mr-3 mt-0.5"></div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-yellow-800 mb-2">Application Pending</h3>
                  <p className="text-yellow-700">
                    Your vendor application is currently under review by our admin team. You will be notified once a decision has been made.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Profile Information */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">Profile Information</h2>
                {!isEditing && (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="flex items-center px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm"
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Profile
                  </button>
                )}
              </div>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Basic Information */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                  <User className="h-5 w-5 mr-2 text-blue-600" />
                  Basic Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50 disabled:text-gray-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50 disabled:text-gray-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      name="number"
                      value={formData.number}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50 disabled:text-gray-500"
                    />
                  </div>
                </div>
              </div>

              {/* Business Information */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                  <Building className="h-5 w-5 mr-2 text-blue-600" />
                  Business Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Business Name
                    </label>
                    <input
                      type="text"
                      name="businessName"
                      value={formData.businessName}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50 disabled:text-gray-500"
                    />
                  </div>
                </div>
              </div>

              {/* Address Information */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                  <MapPin className="h-5 w-5 mr-2 text-blue-600" />
                  Address Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Street Address
                    </label>
                    <textarea
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50 disabled:text-gray-500 resize-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      City
                    </label>
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50 disabled:text-gray-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      State
                    </label>
                    <input
                      type="text"
                      name="state"
                      value={formData.state}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50 disabled:text-gray-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      PIN Code
                    </label>
                    <input
                      type="text"
                      name="pinCode"
                      value={formData.pinCode}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50 disabled:text-gray-500"
                    />
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              {isEditing && (
                <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex items-center px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        Save Changes
                      </>
                    )}
                  </button>
                </div>
              )}
            </form>
          </div>
        </div>
      </div>
    </VendorLayout>
  );
} 