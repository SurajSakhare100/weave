"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import AddressCard from "@/components/user/AddressCard"
import AddressFormModal from "@/components/user/AddressFormModal"
import { Button } from "@/components/ui/button"
import MainLayout from "@/components/layout/MainLayout"
import {
  getUserAddresses,
  addUserAddress,
  updateUserAddress,
  deleteUserAddress,
  setDefaultAddress,
} from "@/services/userService"
import { useCheckout, CheckoutProvider } from "@/components/checkout/CheckoutProvider"
import { ChevronRight } from "lucide-react"

interface Address {
  id: string
  name: string
  address: string
  locality: string
  city: string
  state: string
  pin: string
  number: string
  isDefault: boolean
  addressType?: string
}

interface AddressData {
  name: string
  address: string
  locality: string
  city: string
  state: string
  pin: string
  number: string
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
      console.error("Error loading addresses:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddressSelect = (addressId: string) => {
    console.log('Selecting address:', addressId)
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
      console.error("Error adding address:", error)
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
      console.error("Error updating address:", error)
    } finally {
      setSubmitting(false)
    }
  }

  const handleDeleteAddress = async (addressId: string) => {
    if (!confirm("Are you sure you want to delete this address?")) return

    try {
      const response = await deleteUserAddress(addressId)
      if (response.success) {
        await loadAddresses()
        if (selectedAddress === addressId) {
          setSelectedAddress(null)
        }
      }
    } catch (error) {
      console.error("Error deleting address:", error)
    }
  }

  const handleSetDefaultAddress = async (addressId: string) => {
    try {
      const response = await setDefaultAddress(addressId)
      if (response.success) {
        await loadAddresses()
      }
    } catch (error) {
      console.error("Error setting default address:", error)
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
    console.log('Continue clicked, selected address:', selectedAddress)
    if (selectedAddress) {
      const address = addresses.find((addr) => addr.id === selectedAddress)
      console.log('Found address:', address)
      if (address) {
        const shippingAddress = {
          name: address.name,
          address: [address.address, `${address.locality}, ${address.city}`, `${address.state} - ${address.pin}`],
          city: address.city,
          state: address.state,
          pincode: address.pin,
          phone: address.number,
        }
        console.log('Setting shipping address:', shippingAddress)
        setShippingAddress(shippingAddress)
        router.push("/checkout/order-summary")
      }
    } else {
      console.log('No address selected')
      alert('Please select an address to continue')
    }
  }

  if (loading) {
    return (
      <MainLayout>
        <div className="min-h-screen bg-[#faf9f7] flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#EE346C]"></div>
        </div>
      </MainLayout>
    )
  }

  return (
    <MainLayout>
      <div className="bg-white min-h-screen">
        <div className="max-w-4xl mx-auto px-6 py-8">
          {/* Breadcrumb */}
          <nav className="flex items-center mb-8 text-sm space-x-2">
            <span 
              className="text-[#8b7355] hover:text-[#6b5635] cursor-pointer transition-colors" 
              onClick={() => router.push('/')}
            >
              Home
            </span>
            <ChevronRight className="h-4 w-4 text-[#8b7355]" />
            <span 
              className="text-[#8b7355] hover:text-[#6b5635] cursor-pointer transition-colors" 
              onClick={() => router.push('/cart')}
            >
              Cart
            </span>
            <ChevronRight className="h-4 w-4 text-[#8b7355]" />
            <span className="text-[#8b7355] font-medium">Select Address</span>
          </nav>

          {/* Page Title */}
          <h1 className="text-2xl font-semibold text-[#5E3A1C] mb-8">
            Select Delivery Address
          </h1>

          {addresses.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-[#8b7355] mb-6 text-lg">No addresses found.</p>
              <Button
                onClick={handleAddNewClick}
                className="bg-[#EE346C] hover:bg-[#c2185b] text-white px-8 py-3 rounded-lg font-medium"
              >
                Add New Address
              </Button>
            </div>
          ) : (
            <div className="space-y-4 max-w-2xl">
              {addresses.map((address) => (
                <AddressCard
                  key={address.id}
                  address={{ ...address, addressType: address.addressType || "Home" }}
                  isSelected={selectedAddress === address.id}
                  onSelect={() => handleAddressSelect(address.id)}
                  onEdit={handleEditClick}
                  onDelete={handleDeleteAddress}
                  onSetDefault={handleSetDefaultAddress}
                  showActions={true}
                  handleContinue={handleContinue}
                  submitting={submitting}
                />
              ))}
            </div>
          )}

          {/* Add New Address Link */}
          <div className="mt-12 text-center">
            <button
              className="text-[#EE346C] text-lg font-medium hover:text-[#c2185b] transition-colors underline underline-offset-2"
              onClick={handleAddNewClick}
            >
              Add Delivery Address
            </button>
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
    </MainLayout>
  )
}

export default function CheckoutAddressPage() {
  return (
    <CheckoutProvider>
      <CheckoutAddressPageContent />
    </CheckoutProvider>
  )
}
