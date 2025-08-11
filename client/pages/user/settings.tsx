import MainLayout from '@/components/layout/MainLayout';
import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { getUserProfile, updateUserProfile, deleteAccount } from '../../services/userService';
import { useRequireUserAuth } from '../../hooks/useRequireUserAuth';
import SettingsLayout from '@/components/user/SettingsLayout';
import EditProfileForm from '@/components/user/EditProfileForm';
import AddressesSection from '@/components/user/AddressesSection';
import PastOrdersSection from '@/components/user/PastOrdersSection';
import DeleteAccountModal from '@/components/user/DeleteAccountModal';
import { RootState } from '../../store/store';
import { logout } from '../../features/user/userSlice';
import { useRouter } from 'next/router';



export default function UserSettingsPage() {
  const loggedIn = useRequireUserAuth();
  const { user } = useSelector((state: RootState) => state.user);
  const dispatch = useDispatch();
  const router = useRouter();
  const [userProfile, setUserProfile] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: ''
  });
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState('edit-profile');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Set user profile from Redux store or API
        if (user) {
          setUserProfile({
            firstName: user.firstName || '',
            lastName: user.lastName || '',
            email: user.email || '',
            phone: '' // Phone will be fetched from API if available
          });
        }

        // Fetch additional profile data from API
        try {
          const profileResponse = await getUserProfile();
          if (profileResponse.success && profileResponse.data) {
            setUserProfile(prev => ({
              ...prev,
              firstName: profileResponse.data.firstName || prev.firstName,
              lastName: profileResponse.data.lastName || prev.lastName,
              email: profileResponse.data.email || prev.email,
              phone: profileResponse.data.number || prev.phone // API uses 'number' field
            }));
          }
        } catch (profileError) {
          console.error('Error fetching profile:', profileError);
        }
      } catch (error: unknown) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    if (loggedIn) {
      fetchData();
    }
  }, [loggedIn]);

  const handleProfileUpdate = async (field: string, value: string) => {
    try {
      // Map frontend field names to API field names
      const fieldMapping: { [key: string]: string } = {
        firstName: 'firstName',
        lastName: 'lastName',
        email: 'email',
        phone: 'number'
      };
      
      const apiField = fieldMapping[field] || field;
      const updateData = { [apiField]: value };
      const response = await updateUserProfile(updateData);
      
      if (response.success) {
        setUserProfile(prev => ({ ...prev, [field]: value }));
        return Promise.resolve();
      } else {
        throw new Error(response.message || 'Update failed');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      return Promise.reject(error);
    }
  };

  const handleDeleteAccount = async () => {
    try {
      setDeleteLoading(true);
      const response = await deleteAccount();
      
      if (response.success) {
        // Clear user data from Redux store
        dispatch(logout());
        
        // Redirect to home page
        router.push('/');
      } else {
        throw new Error(response.message || 'Failed to delete account');
      }
    } catch (error) {
      console.error('Error deleting account:', error);
      alert('Failed to delete account. Please try again.');
    } finally {
      setDeleteLoading(false);
      setShowDeleteModal(false);
    }
  };

  const renderContent = () => {
    switch (activeSection) {
      case 'edit-profile':
        return (
          <EditProfileForm 
            user={userProfile} 
            onUpdate={handleProfileUpdate}
          />
        );
      
      case 'addresses':
        return <AddressesSection />;
      
      case 'past-orders':
        return <PastOrdersSection />;
      
      case 'payments':
        return (
          <div className="bg-white rounded-2xl p-6">
            <h2 className="text-2xl font-bold text-primary mb-6">Payments & Refunds</h2>
            <p className="text-[#6b7280]">Payment and refund management coming soon...</p>
          </div>
        );
      
      case 'profile':
        return (
          <div className="bg-white rounded-2xl p-6">
            <h2 className="text-2xl font-bold text-primary mb-6">Profile Settings</h2>
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-4">Account Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                    <p className="text-gray-900">{userProfile.firstName} {userProfile.lastName}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <p className="text-gray-900">{userProfile.email}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                    <p className="text-gray-900">{userProfile.phone || 'Not provided'}</p>
                  </div>
                </div>
              </div>

              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold mb-4 text-red-600">Danger Zone</h3>
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-sm text-red-700 mb-4">
                    Once you delete your account, there is no going back. Please be certain.
                  </p>
                  <button
                    onClick={() => setShowDeleteModal(true)}
                    className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors"
                  >
                    Delete Weave Account
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      
      default:
        return (
          <EditProfileForm 
            user={userProfile} 
            onUpdate={handleProfileUpdate}
          />
        );
    }
  };

  const sectionTitleMap: { [key: string]: string } = {
    'edit-profile': 'Edit Profile',
    'addresses': 'Addresses',
    'past-orders': 'Past orders',
    'payments': 'Payments & refunds',
    'profile': 'Profile',
  };

  const mobileTitle = sectionTitleMap[activeSection] || 'Settings';

  if (loading) {
    return (
      <MainLayout mobileTitle={mobileTitle} tone="light">
        <div className="min-h-screen bg-[#faf9f7] flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#EE346C] mx-auto mb-4"></div>
            <p className="text-[#5E3A1C]">Loading your settings...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout mobileTitle={mobileTitle}>
      <SettingsLayout 
        activeSection={activeSection}
        onSectionChange={setActiveSection}
      >
        {renderContent()}
      </SettingsLayout>
      
      <DeleteAccountModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDeleteAccount}
        loading={deleteLoading}
      />
    </MainLayout>
  );
} 