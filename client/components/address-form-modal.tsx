"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { X, ChevronDown } from "lucide-react"

interface AddressData {
  name: string
  address: string
  locality: string
  city: string
  state: string
  pin: string
  number: string
}

interface Address extends AddressData {
  id: string
  isDefault: boolean
  addressType?: string
}

interface AddressFormModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: AddressData) => Promise<void>
  address?: Address
  isEditing?: boolean
}

export function AddressFormModal({ isOpen, onClose, onSubmit, address, isEditing = false }: AddressFormModalProps) {
  const [formData, setFormData] = useState<AddressData>({
    name: "",
    address: "",
    locality: "",
    city: "",
    state: "Maharashtra",
    pin: "",
    number: "",
  })
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [country] = useState("India")
  const [addressType, setAddressType] = useState("Home")
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (address && isEditing) {
      const nameParts = address.name.split(" ")
      setFirstName(nameParts[0] || "")
      setLastName(nameParts.slice(1).join(" ") || "")
      setFormData({
        name: address.name,
        address: address.address,
        locality: address.locality,
        city: address.city,
        state: address.state,
        pin: address.pin,
        number: address.number,
      })
      setAddressType(address.addressType || "Home")
    } else {
      setFirstName("")
      setLastName("")
      setFormData({
        name: "",
        address: "",
        locality: "",
        city: "",
        state: "Maharashtra",
        pin: "",
        number: "",
      })
      setAddressType("Home")
    }
  }, [address, isEditing, isOpen])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      const fullName = `${firstName} ${lastName}`.trim()
      await onSubmit({
        ...formData,
        name: fullName,
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleChange = (field: keyof AddressData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      {/* Fixed Modal Container */}
      <div className="bg-gradient-to-b from-[#8b7355] via-[#a08970] to-[#c4b5a0] rounded-2xl max-w-md w-full h-[calc(100vh-4rem)] relative flex flex-col">
        {/* Fixed Close Button */}
        <button onClick={onClose} className="absolute top-6 right-6 text-white hover:text-gray-200 z-10">
          <X className="w-6 h-6" />
        </button>

        {/* Fixed Header Space */}
        <div className="h-16 flex-shrink-0"></div>

        {/* Scrollable White Content Area */}
        <div className="bg-white rounded-2xl mx-4 mb-4 flex-1 flex flex-col overflow-hidden">
          {/* Fixed Title */}
          <div className="p-6 pb-4 flex-shrink-0">
            <h2 className="text-[#8b7355] text-xl font-medium">Add Delivery address</h2>
          </div>

          {/* Scrollable Form Content */}
          <div className="flex-1 overflow-y-auto px-6 pb-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Country Dropdown */}
              <div className="relative">
                <div className="w-full px-4 py-3 border border-gray-200 rounded-lg bg-gray-50 flex items-center justify-between cursor-pointer">
                  <div>
                    <div className="text-xs text-gray-500 mb-1">Country</div>
                    <div className="text-[#8b7355] font-medium">{country}</div>
                  </div>
                  <ChevronDown className="w-5 h-5 text-gray-400" />
                </div>
              </div>

              {/* First Name */}
              <div>
                <input
                  type="text"
                  placeholder="First name"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg text-[#8b7355] placeholder-gray-400 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#8b7355] focus:border-transparent"
                />
              </div>

              {/* Last Name */}
              <div>
                <input
                  type="text"
                  placeholder="Last name"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  required
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg text-[#8b7355] placeholder-gray-400 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#8b7355] focus:border-transparent"
                />
              </div>

              {/* Mobile Number */}
              <div>
                <input
                  type="tel"
                  placeholder="Mobile number"
                  value={formData.number}
                  onChange={(e) => handleChange("number", e.target.value)}
                  required
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg text-[#8b7355] placeholder-gray-400 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#8b7355] focus:border-transparent"
                />
              </div>

              {/* Flat, House no., Building */}
              <div>
                <input
                  type="text"
                  placeholder="Flat, House no., Building"
                  value={formData.address}
                  onChange={(e) => handleChange("address", e.target.value)}
                  required
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg text-[#8b7355] placeholder-gray-400 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#8b7355] focus:border-transparent"
                />
              </div>

              {/* Area, street, sector */}
              <div>
                <input
                  type="text"
                  placeholder="Area, street, sector"
                  value={formData.locality}
                  onChange={(e) => handleChange("locality", e.target.value)}
                  required
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg text-[#8b7355] placeholder-gray-400 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#8b7355] focus:border-transparent"
                />
              </div>

              {/* State Dropdown */}
              <div className="relative">
                <div className="w-full px-4 py-3 border border-gray-200 rounded-lg bg-gray-50 flex items-center justify-between cursor-pointer">
                  <div>
                    <div className="text-xs text-gray-500 mb-1">State</div>
                    <div className="text-[#8b7355] font-medium">{formData.state}</div>
                  </div>
                  <ChevronDown className="w-5 h-5 text-gray-400" />
                </div>
              </div>

              {/* Pincode and Town/City */}
              <div className="grid grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="Pincode"
                  value={formData.pin}
                  onChange={(e) => handleChange("pin", e.target.value)}
                  required
                  className="px-4 py-3 border border-gray-200 rounded-lg text-[#8b7355] placeholder-gray-400 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#8b7355] focus:border-transparent"
                />
                <input
                  type="text"
                  placeholder="Town/City"
                  value={formData.city}
                  onChange={(e) => handleChange("city", e.target.value)}
                  required
                  className="px-4 py-3 border border-gray-200 rounded-lg text-[#8b7355] placeholder-gray-400 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#8b7355] focus:border-transparent"
                />
              </div>

              {/* Address Type */}
              <div className="pt-2">
                <div className="text-[#8b7355] font-medium mb-3">Address Type</div>
                <div className="grid grid-cols-2 gap-4">
                  <label className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                    <div className="relative">
                      <input
                        type="radio"
                        name="addressType"
                        value="Home"
                        checked={addressType === "Home"}
                        onChange={(e) => setAddressType(e.target.value)}
                        className="sr-only"
                      />
                      <div
                        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                          addressType === "Home" ? "border-[#8b7355]" : "border-gray-300"
                        }`}
                      >
                        {addressType === "Home" && <div className="w-3 h-3 rounded-full bg-[#8b7355]"></div>}
                      </div>
                    </div>
                    <span className="text-[#8b7355] font-medium">Home</span>
                  </label>
                  <label className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                    <div className="relative">
                      <input
                        type="radio"
                        name="addressType"
                        value="Work"
                        checked={addressType === "Work"}
                        onChange={(e) => setAddressType(e.target.value)}
                        className="sr-only"
                      />
                      <div
                        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                          addressType === "Work" ? "border-[#8b7355]" : "border-gray-300"
                        }`}
                      >
                        {addressType === "Work" && <div className="w-3 h-3 rounded-full bg-[#8b7355]"></div>}
                      </div>
                    </div>
                    <span className="text-[#8b7355] font-medium">Work</span>
                  </label>
                </div>
              </div>

              {/* Continue Button */}
              <div className="pt-4 pb-4">
                <Button
                  type="submit"
                  className="w-full bg-[#e91e63] hover:bg-[#c2185b] text-white py-3 rounded-lg font-medium text-lg"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Processing..." : "Continue"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
