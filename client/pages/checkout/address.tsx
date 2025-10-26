"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import AddressCard from "@/components/user/AddressCard"
import AddressFormModal from "@/components/user/AddressFormModal"
import { Button } from "@/components/ui/button"
import MainLayout from "@/components/layout/MainLayout"
import Breadcrumb from "@/components/ui/Breadcrumb"
import {
  getUserAddresses,
  addUserAddress,
  updateUserAddress,
  deleteUserAddress,
  setDefaultAddress,
} from "@/services/userService"
import { useCheckout, CheckoutProvider } from "@/components/checkout/CheckoutProvider"

interface Address {
  firstName: string
  lastName: string
  id: string
  country: string
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
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  useEffect(() => {
    loadAddresses()

  }, [])

  const loadAddresses = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await getUserAddresses()
      if (response.success) {
        setAddresses(response.data)
        const defaultAddress = response.data.find((addr: Address) => addr.isDefault)
        if (defaultAddress) {
          setSelectedAddress(defaultAddress.id)
        } else if (response.data.length > 0) {
          setSelectedAddress(response.data[0].id)
        }
      } else {
        console.error("Failed to load addresses:", response.message)
        setAddresses([])
        setError("Failed to load addresses. Please try again.")
      }
    } catch (error) {
      console.error("Error loading addresses:", error)
      setAddresses([])
      setError("Failed to load addresses. Please try again.")
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
      setError(null)
      const response = await addUserAddress(addressData)
      if (response.success) {
        await loadAddresses()
        setShowAddressModal(false)
        setSuccessMessage("Address added successfully!")
        if (addresses.length === 0) {
          const newAddresses = await getUserAddresses()
          if (newAddresses.success && newAddresses.data.length > 0) {
            setSelectedAddress(newAddresses.data[0].id)
          }
        }
        setTimeout(() => setSuccessMessage(null), 3000)
      } else {
        console.error("Failed to add address:", response.message)
        setError("Failed to add address. Please try again.")
      }
    } catch (error) {
      console.error("Error adding address:", error)
      setError("Failed to add address. Please try again.")
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
          name: `${address.firstName} ${address.lastName}`,
          address: [address.address, `${address.locality}, ${address.city}`, `${address.state} - ${address.pin}`],
          city: address.city,
          state: address.state,
          pincode: address.pin,
          phone: address.number,
        }
        console.log('Setting shipping address:', shippingAddress)
        setShippingAddress(shippingAddress)
        router.push("/checkout/payment")
      }
    } else {
      console.log('No address selected')
      alert('Please select an address to continue')
    }
  }

  if (loading) {
    return (
      <MainLayout>
        <div className="min-h-screen bg-tertiary flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-button mx-auto mb-4"></div>
            <p className="text-primary text-lg">Loading your addresses...</p>
          </div>
        </div>
      </MainLayout>
    )
  }

  return (
    <MainLayout>
      <div className="bg-background min-h-screen">
        <div className=" px-12 py-8">
          {/* Breadcrumb */}
          <Breadcrumb
            items={[
              { label: 'Home', href: '/' },
              { label: 'Cart', href: '/cart' },
              { label: 'Select Address', isCurrent: true }
            ]}
            className="mb-8"
          />



          {/* Error State */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <div className="flex items-center">
                <svg className="w-5 h-5 text-red-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-red-700">{error}</p>
              </div>
              <div className="mt-3">
                <Button
                  onClick={loadAddresses}
                  variant="outline"
                  size="sm"
                  className="text-red-700 border-red-300 hover:bg-red-50"
                >
                  Try Again
                </Button>
              </div>
            </div>
          )}

          {/* Success State */}
          {successMessage && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
              <div className="flex items-center">
                <svg className="w-5 h-5 text-green-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <p className="text-green-700">{successMessage}</p>
              </div>
            </div>
          )}

          {addresses.length === 0 ? (
            <div className="text-center py-16">
              <div className="max-w-md mx-auto">
                <div className="w-24 h-24 bg-tertiary rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg className="w-12 h-12 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <h2 className="text-2xl font-semibold text-primary mb-4">No Delivery Address Found</h2>
                <p className="text-primary mb-8 text-lg leading-relaxed">
                  We need a delivery address to complete your order. Please add your first address to continue with checkout.
                </p>
                <Button
                  onClick={handleAddNewClick}
                  className="bg-button hover:opacity-90 text-white px-8 py-4 rounded-lg font-medium text-lg shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Add Your First Address
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-6 max-w-3xl ">
              {addresses.map((address) => (
                <AddressCard
                  key={address.id}
                  address={{ ...address, addressType: address.addressType || "Home", firstName: address.firstName || '', lastName: address.lastName || '', country: address.country || 'India' }}
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
          <div className="mt-24 text-center">
            <button
              className="text-button text-lg font-medium hover:opacity-80 transition-colors underline underline-offset-2 cursor-pointer"
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
          onSubmit={editingAddress ? (address: Address) => handleEditAddress(address as any) : (address: Address) => handleAddAddress(address as any)}
          address={editingAddress ? {
            ...editingAddress,
            firstName: editingAddress.firstName || '',
            lastName: editingAddress.lastName || '',
            country: editingAddress.country || 'India',
            address: editingAddress.address || '',
            locality: editingAddress.locality || '',
            city: editingAddress.city || '',
            state: editingAddress.state || '',
            pin: editingAddress.pin || '',
            number: editingAddress.number || '',
            isDefault: editingAddress.isDefault || false,
            addressType: editingAddress.addressType || 'Home',
          } : undefined}
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