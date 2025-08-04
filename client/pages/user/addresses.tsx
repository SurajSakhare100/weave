import { useEffect, useState } from "react"
import { useRouter } from "next/router"
import AddressCard from "@/components/user/AddressCard"
import AddressFormModal from "@/components/user/AddressFormModal"
import { Button } from "@/components/ui/button"
import MainLayout from "@/components/layout/MainLayout"
import { getUserAddresses, addUserAddress, updateUserAddress, deleteUserAddress, setDefaultAddress } from "@/services/userService"
import { Plus } from "lucide-react"

interface Address {
  id: string;
  firstName: string;
  lastName: string;
  country: string;
  address: string;
  locality: string;
  city: string;
  state: string;
  pin: string;
  number: string;
  isDefault: boolean;
  addressType?: string;
}

interface AddressData {
  name: string;
  address: string;
  locality: string;
  city: string;
  state: string;
  pin: string;
  number: string;
}

export default function UserAddressesPage() {
  const router = useRouter()
  const [addresses, setAddresses] = useState<Address[]>([])
  const [showAddressModal, setShowAddressModal] = useState(false)
  const [editingAddress, setEditingAddress] = useState<Address | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadAddresses()
  }, [])

  const loadAddresses = async () => {
    try {
      setLoading(true)
      const response = await getUserAddresses()
      if (response.success) {
        setAddresses(response.data)
      }
    } catch (error) {
      console.error('Error loading addresses:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddAddress = async (addressData: AddressData) => {
    try {
      const response = await addUserAddress(addressData)
      if (response.success) {
        await loadAddresses()
        setShowAddressModal(false)
      }
    } catch (error) {
      console.error('Error adding address:', error)
    }
  }

  const handleEditAddress = async (addressData: AddressData) => {
    try {
      const response = await updateUserAddress(editingAddress!.id, addressData)
      if (response.success) {
        await loadAddresses()
        setShowAddressModal(false)
        setEditingAddress(null)
      }
    } catch (error) {
      console.error('Error updating address:', error)
    }
  }

  const handleDeleteAddress = async (addressId: string) => {
    if (!confirm('Are you sure you want to delete this address?')) return

    try {
      const response = await deleteUserAddress(addressId)
      if (response.success) {
        await loadAddresses()
      }
    } catch (error) {
      console.error('Error deleting address:', error)
    }
  }

  const handleSetDefaultAddress = async (addressId: string) => {
    try {
      const response = await setDefaultAddress(addressId)
      if (response.success) {
        await loadAddresses()
      }
    } catch (error) {
      console.error('Error setting default address:', error)
    }
  }

  const handleEditClick = (address: Address) => {
    setEditingAddress(address)
    setShowAddressModal(true)
  }

  const handleAddNewClick = () => {
    setEditingAddress(null)
    setShowAddressModal(true)
  }

  if (loading) {
    return (
      <MainLayout>
        <div className="min-h-screen bg-[#fafafa] flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500"></div>
        </div>
      </MainLayout>
    )
  }

  return (
    <MainLayout>
      <div className="min-h-screen bg-[#fafafa]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 sm:gap-0 mb-6 sm:mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
              <Button
                variant="outline"
                onClick={() => router.push('/user/profile')}
                className="text-[#6c4323] border-[#6c4323] hover:bg-[#6c4323] hover:text-white w-fit text-sm sm:text-base"
              >
                ← Back to Profile
              </Button>
              <h1 className="text-2xl sm:text-3xl font-bold text-[#6c4323]">My Addresses</h1>
            </div>
            <Button 
              onClick={handleAddNewClick}
              className="bg-[#cf1a53] hover:bg-[#cf1a53]/90 text-white w-full sm:w-auto text-sm sm:text-base"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add New Address
            </Button>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 max-w-5xl mx-auto">
            {addresses.length === 0 ? (
              <div className="text-center py-8 sm:py-12">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                  <Plus className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400" />
                </div>
                <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">No addresses yet</h3>
                <p className="text-gray-500 mb-4 sm:mb-6 text-sm sm:text-base">Add your first delivery address to get started.</p>
                <Button 
                  onClick={handleAddNewClick}
                  className="bg-[#cf1a53] hover:bg-[#cf1a53]/90 text-white text-sm sm:text-base"
                >
                  Add Your First Address
                </Button>
              </div>
            ) : (
              <div className="space-y-4 sm:space-y-6">
                {addresses.map((address) => (
                  <AddressCard
                    key={address.id}
                    address={{ ...address, addressType: address.addressType || 'Home', firstName: address.firstName || '', lastName: address.lastName || '', country: address.country || 'India' }}
                    onEdit={() => handleEditClick(address)}
                    onDelete={() => handleDeleteAddress(address.id)}
                    onSetDefault={() => handleSetDefaultAddress(address.id)}
                    // showActions={true}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        <AddressFormModal
          isOpen={showAddressModal}
          onClose={() => {
            setShowAddressModal(false)
            setEditingAddress(null)
          }}
          onSubmit={editingAddress ? (address: Address) => handleEditAddress(address as any) : (address: Address) => handleAddAddress(address as any)}
          address={editingAddress || undefined}
          // isEditing={!!editingAddress}
        />
      </div>
    </MainLayout>
  )
} 