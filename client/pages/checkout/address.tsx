"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { AddressCard } from "@/components/address-card"
import { AddressFormModal } from "@/components/address-form-modal"
import { Button } from "@/components/ui/button"
import Layout from "@/components/Layout"
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
    if (selectedAddress) {
      const address = addresses.find((addr) => addr.id === selectedAddress)
      if (address) {
        const shippingAddress = {
          name: address.name,
          address: [address.address, `${address.locality}, ${address.city}`, `${address.state} - ${address.pin}`],
          city: address.city,
          state: address.state,
          pincode: address.pin,
          phone: address.number,
        }
        setShippingAddress(shippingAddress)
        router.push("/checkout/order-summary")
      }
    }
  }

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen bg-[#faf9f7] flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#e91e63]"></div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className=" bg-white md:px-10">
        <div className=" p-6">
          {/* Breadcrumb */}
          <nav className="flex items-center mb-4  text-md  space-x-2">
            <span className="text-[#8b7355] hover:text-[#6b5635] cursor-pointer" onClick={() => router.push('/')}>Home</span>
            <ChevronRight className="h-4 w-4 text-[#8b7355]" />
            <span className="text-[#8b7355] hover:text-[#6b5635] cursor-pointer" onClick={() => router.push('/cart')}>Cart</span>
            <ChevronRight className="h-4 w-4 text-[#8b7355]" />
            <span className="text-[#8b7355]">Select Address</span>
          </nav>

          {addresses.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-[#8b7355] mb-6 text-lg">No addresses found.</p>
              <Button
                onClick={handleAddNewClick}
                className="bg-[#e91e63] hover:bg-[#c2185b] text-white px-8 py-3 rounded-md font-medium"
              >
                Add New Address
              </Button>
            </div>
          ) : (
            <div className="space-y-0 max-w-2xl" >
              {addresses.map((address) => (
                <div key={address.id} className="relative">
                  <AddressCard
                    address={{ ...address, addressType: address.addressType || "Home" }}
                    isSelected={selectedAddress === address.id}
                    onSelect={() => handleAddressSelect(address.id)}
                    onEdit={() => handleEditClick(address)}
                    onDelete={() => handleDeleteAddress(address.id)}
                    onSetDefault={() => handleSetDefaultAddress(address.id)}
                    showActions={true}
                    handleContinue={handleContinue}
                    submitting={submitting}
                  />

                </div>
              ))}
            </div>
          )}

          {/* Add New Address Link */}
          <div className="mt-16 text-center w-full">
            <button
              className="text-[#EE346C] text-center hover:text-[#c2185b] font-medium text-lg underline underline-offset-2"
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
