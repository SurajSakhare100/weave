import { useEffect, useState } from "react"
import { useRouter } from "next/router"
import { AddressCard } from "@/components/address-card"
import { AddressFormModal } from "@/components/address-form-modal"
import { Button } from "@/components/ui/button"
import Layout from "@/components/Layout"
import { getUserAddresses, addUserAddress, updateUserAddress, deleteUserAddress, setDefaultAddress } from "@/services/userService"
import { useCheckout, CheckoutProvider } from "@/components/checkout/CheckoutProvider"

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

function CheckoutAddressPageContent() {
  const router = useRouter()
  const { setShippingAddress } = useCheckout()
  const [addresses, setAddresses] = useState<Address[]>([])
  const [selectedAddress, setSelectedAddress] = useState<string | null>(null)
  const [showAddressModal, setShowAddressModal] = useState(false)
  const [editingAddress, setEditingAddress] = useState<Address | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    loadAddresses()
  }, [])

  const loadAddresses = async () => {
    try {
      setLoading(true)
      const response = await getUserAddresses()
      if (response.success) {
        setAddresses(response.data)
        const defaultAddress = response.data.find((addr: Address) => addr.isDefault)
        if (defaultAddress) {
          setSelectedAddress(defaultAddress.id)
        } else if (response.data.length > 0) {
          setSelectedAddress(response.data[0].id)
        }
      }
    } catch (error) {
      console.error('Error loading addresses:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddressSelect = (addressId: string) => {
    setSelectedAddress(addressId)
  }

  const handleAddAddress = async (addressData: AddressData) => {
    try {
      setSubmitting(true)
      const response = await addUserAddress(addressData)
      if (response.success) {
        await loadAddresses()
        setShowAddressModal(false)
      }
    } catch (error) {
      console.error('Error adding address:', error)
    } finally {
      setSubmitting(false)
    }
  }

  const handleEditAddress = async (addressData: AddressData) => {
    try {
      setSubmitting(true)
      const response = await updateUserAddress(editingAddress!.id, addressData)
      if (response.success) {
        await loadAddresses()
        setShowAddressModal(false)
        setEditingAddress(null)
      }
    } catch (error) {
      console.error('Error updating address:', error)
    } finally {
      setSubmitting(false)
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

  const handleContinue = () => {
    if (selectedAddress) {
      const address = addresses.find(addr => addr.id === selectedAddress)
      if (address) {
        const shippingAddress = {
          name: address.name,
          address: [address.address, `${address.locality}, ${address.city}`, `${address.state} - ${address.pin}`],
          city: address.city,
          state: address.state,
          pincode: address.pin,
          phone: address.number
        }
        setShippingAddress(shippingAddress)
        router.push("/checkout/order-summary")
      }
    }
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
          <nav className="text-[#6c4323] mb-8">
            <span>Home</span>
            <span className="mx-2">{">"}</span>
            <span>Cart</span>
            <span className="mx-2">{">"}</span>
            <span>Address</span>
          </nav>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <h1 className="text-2xl font-bold mb-6">Select Delivery Address</h1>
            
            {addresses.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500 mb-4">No addresses found.</p>
                <Button 
                  onClick={handleAddNewClick}
                  className="bg-pink-500 text-white px-6 py-2 rounded hover:bg-pink-600 transition"
                >
                  Add New Address
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {addresses.map((address) => (
                  <AddressCard
                    key={address.id}
                    address={address}
                    isSelected={selectedAddress === address.id}
                    onSelect={() => handleAddressSelect(address.id)}
                    onEdit={() => handleEditClick(address)}
                    onDelete={() => handleDeleteAddress(address.id)}
                    onSetDefault={() => handleSetDefaultAddress(address.id)}
                    showActions={true}
                  />
                ))}
                
                <Button 
                  onClick={handleAddNewClick}
                  variant="outline"
                  className="w-full mt-4"
                >
                  + Add New Address
                </Button>
              </div>
            )}

            {addresses.length > 0 && (
              <div className="mt-8 pt-6 border-t border-gray-200">
                <Button 
                  onClick={handleContinue}
                  disabled={!selectedAddress || submitting}
                  className="w-full bg-[#cf1a53] hover:bg-[#cf1a53]/90 text-white py-3"
                >
                  {submitting ? 'Processing...' : 'Continue to Order Summary'}
                </Button>
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
          address={editingAddress}
          isEditing={!!editingAddress}
        />
      </div>
    </Layout>
  )
}

export default function CheckoutAddressPage() {
  return (
    <CheckoutProvider>
      <CheckoutAddressPageContent />
    </CheckoutProvider>
  )
} 