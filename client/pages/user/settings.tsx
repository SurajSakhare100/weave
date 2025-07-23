import MainLayout from '@/components/layout/MainLayout';
import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { getUserProfile, updateUserProfile } from '../../services/userService';
import { useRequireUserAuth } from '../../hooks/useRequireUserAuth';
import SettingsLayout from '@/components/user/SettingsLayout';
import EditProfileForm from '@/components/user/EditProfileForm';
import AddressesSection from '@/components/user/AddressesSection';
import PastOrdersSection from '@/components/user/PastOrdersSection';
import { RootState } from '../../store/store';



export default function UserSettingsPage() {
  const loggedIn = useRequireUserAuth();
  const { user } = useSelector((state: RootState) => state.user);
  const [userProfile, setUserProfile] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: ''
  });
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState('edit-profile');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Set user profile from Redux store or API
        if (user) {
          // Split the name into first and last name if available
          const nameParts = user.name ? user.name.split(' ') : ['', ''];
          setUserProfile({
            firstName: nameParts[0] || '',
            lastName: nameParts.slice(1).join(' ') || '',
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
      
      case 'my-account':
        return (
          <div className="bg-white rounded-2xl p-6">
            <h2 className="text-2xl font-bold text-primary mb-6">My Account</h2>
            <p className="text-[#6b7280]">Account settings coming soon...</p>
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

  if (loading) {
    return (
      <MainLayout>
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
    <MainLayout>
      <SettingsLayout 
        activeSection={activeSection}
        onSectionChange={setActiveSection}
      >
        {renderContent()}
      </SettingsLayout>
    </MainLayout>
  );
} 