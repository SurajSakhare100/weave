import { useEffect, useState } from "react"
import AddressFormModal from "@/components/user/AddressFormModal"
import { Button } from "@/components/ui/button"
import {
  getUserAddresses,
  addUserAddress,
  updateUserAddress,
  deleteUserAddress,
  setDefaultAddress,
} from "@/services/userService"
import { Edit, Plus, Trash2 } from "lucide-react"

interface Address {
  id: string
  firstName: string
  lastName: string
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

export default function AddressesSection() {
  const [addresses, setAddresses] = useState<Address[]>([])
  const [showAddressModal, setShowAddressModal] = useState(false)
  const [editingAddress, setEditingAddress] = useState<Address | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null)

  useEffect(() => {
    loadAddresses()
  }, [])

  const loadAddresses = async () => {
    try {
      setLoading(true)
      const response = await getUserAddresses()
      if (response.success) {
        setAddresses(response.data)
        // Set default selected address if any
        const defaultAddr = response.data.find((a: Address) => a.isDefault)
        setSelectedAddressId(defaultAddr ? defaultAddr.id : response.data[0]?.id ?? null)
      }
    } catch (error) {
      console.error("Error loading addresses:", error)
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
      console.error("Error adding address:", error)
    }
  }

  const handleEditAddress = async (addressData: AddressData) => {
    if (!editingAddress) return
    try {
      const response = await updateUserAddress(editingAddress.id, addressData)
      if (response.success) {
        await loadAddresses()
        setShowAddressModal(false)
        setEditingAddress(null)
      }
    } catch (error) {
      console.error("Error updating address:", error)
    }
  }

  const handleDeleteAddress = async (addressId: string) => {
    if (!confirm("Are you sure you want to delete this address?")) return

    try {
      const response = await deleteUserAddress(addressId)
      if (response.success) {
        await loadAddresses()
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

  if (loading) {
    return (
      <div className="bg-white rounded-2xl  p-6">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#EE346C]"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl  p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-primary">
          Addresses {" > "} Edit & add new address
        </h2>
      </div>

      <div className="space-y-4">
        {addresses.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Plus className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-primary mb-2">
              No addresses yet
            </h3>
            <p className="text-primary mb-6">
              Add your first delivery address to get started.
            </p>
            <Button
              onClick={handleAddNewClick}
              className="bg-[#EE346C] hover:bg-[#c2185b] text-white"
            >
              Add Your First Address
            </Button>
          </div>
        ) : (
          addresses.map((address) => {
            const isSelected = selectedAddressId === address.id
            return (
              <div
                key={address.id}
                className={`rounded-xl p-6 transition-all duration-200 ${
                  isSelected ? "bg-bg-tertiary" : "bg-white"
                }`}
              >
                <div className="flex items-start space-x-4">
                  {/* Radio Button */}
                  <div className="flex-shrink-0 mt-1">
                    <button
                      onClick={() => setSelectedAddressId(address.id)}
                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                        isSelected ? "border-primary" : "border-primary"
                      }`}
                      aria-label={`Select ${address.firstName} ${address.lastName}'s address`}
                    >
                      {isSelected && (
                        <div className="w-2.5 h-2.5 bg-bg-selected rounded-full cursor-pointer"></div>
                      )}
                    </button>
                  </div>

                  {/* Address Content */}
                  <div className="flex-1">
                    <div className="flex justify-between items-start mb-1">
                      <h3 className="font-semibold text-primary text-lg">
                        {address.firstName} {address.lastName}
                        {address.isDefault && (
                          <span className="ml-2 px-2 py-0.5 text-xs bg-primary text-white rounded">
                            Default
                          </span>
                        )}
                      </h3>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleEditClick(address)}
                          className="p-1 text-gray-500 hover:text-button transition-colors"
                          aria-label="Edit address"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteAddress(address.id)}
                          className="p-1 text-gray-500 hover:text-red-600 transition-colors"
                          aria-label="Delete address"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                        {!address.isDefault && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="ml-2 text-xs px-2 py-1"
                            onClick={() => handleSetDefaultAddress(address.id)}
                          >
                            Set as Default
                          </Button>
                        )}
                      </div>
                    </div>

                    {/* Address Details */}
                    <div className="text-primary mb-4 border-b border-border-tertiary pb-4">
                      <p className="text-sm">{address.address}</p>
                      {address.locality && (
                        <p className="text-sm">{address.locality}</p>
                      )}
                      <p className="text-sm">
                        {address.city}, {address.state} - {address.pin}
                      </p>
                      <p className="text-sm">{address.country}</p>
                      <p className="text-sm">Phone: {address.number}</p>
                    </div>
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>

      {addresses.length > 0 && (
        <div className="text-center mt-6">
          <Button
            onClick={handleAddNewClick}
            variant="link"
            className="text-[#EE346C] hover:text-[#c2185b] font-medium"
          >
            Add Delivery Address
          </Button>
        </div>
      )}

      <AddressFormModal
        isOpen={showAddressModal}
        onClose={() => {
          setShowAddressModal(false)
          setEditingAddress(null)
        }}
        onSubmit={
          editingAddress
            ? (address: Address) => handleEditAddress(address as any)
            : (address: Address) => handleAddAddress(address as any)
        }
        address={editingAddress || undefined}
      />
    </div>
  )
}