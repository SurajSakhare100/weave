import { useEffect, useState } from "react"
import { AddressCard } from "@/components/address-card"
import { AddressFormModal } from "@/components/address-form-modal"
import { Button } from "@/components/ui/button"
import Layout from "@/components/Layout"
import { getUserAddresses, addUserAddress, updateUserAddress, deleteUserAddress, setDefaultAddress } from "@/services/userService"
import { Plus } from "lucide-react"

interface Address {
  id: string;
  name: string;
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
      <Layout>
        <div className="min-h-screen bg-[#fafafa] flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500"></div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="min-h-screen bg-[#fafafa]">
        <div className="max-w-4xl mx-auto px-4 lg:px-6 py-8">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-[#6c4323]">My Addresses</h1>
            <Button 
              onClick={handleAddNewClick}
              className="bg-[#cf1a53] hover:bg-[#cf1a53]/90 text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add New Address
            </Button>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            {addresses.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Plus className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No addresses yet</h3>
                <p className="text-gray-500 mb-6">Add your first delivery address to get started.</p>
                <Button 
                  onClick={handleAddNewClick}
                  className="bg-[#cf1a53] hover:bg-[#cf1a53]/90 text-white"
                >
                  Add Your First Address
                </Button>
              </div>
            ) : (
              <div className="space-y-6">
                {addresses.map((address) => (
                  <AddressCard
                    key={address.id}
                    address={{ ...address, addressType: address.addressType || 'Home' }}
                    onEdit={() => handleEditClick(address)}
                    onDelete={() => handleDeleteAddress(address.id)}
                    onSetDefault={() => handleSetDefaultAddress(address.id)}
                    showActions={true}
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
          onSubmit={editingAddress ? handleEditAddress : handleAddAddress}
          address={editingAddress || undefined}
          isEditing={!!editingAddress}
        />
      </div>
    </Layout>
  )
} 