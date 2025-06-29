"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface AddressFormModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (address: any) => void
  address?: any // For editing existing address
  isEditing?: boolean
}

export function AddressFormModal({ isOpen, onClose, onSubmit, address, isEditing = false }: AddressFormModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    number: "",
    pin: "",
    locality: "",
    address: "",
    city: "",
    state: "",
    addressType: "Home",
  })
  const [errors, setErrors] = useState<{[key: string]: string}>({})

  // Reset form when modal opens/closes or address changes
  useEffect(() => {
    if (isOpen) {
      if (address) {
        setFormData({
          name: address.name || "",
          number: address.number || "",
          pin: address.pin || "",
          locality: address.locality || "",
          address: address.address || "",
          city: address.city || "",
          state: address.state || "",
          addressType: address.addressType || "Home",
        })
      } else {
        setFormData({
          name: "",
          number: "",
          pin: "",
          locality: "",
          address: "",
          city: "",
          state: "",
          addressType: "Home",
        })
      }
      setErrors({})
    }
  }, [isOpen, address])

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {}

    if (!formData.name.trim()) {
      newErrors.name = "Name is required"
    } else if (formData.name.trim().length < 2) {
      newErrors.name = "Name must be at least 2 characters"
    }

    if (!formData.number.trim()) {
      newErrors.number = "Mobile number is required"
    } else if (!/^\d{10}$/.test(formData.number)) {
      newErrors.number = "Mobile number must be 10 digits"
    }

    if (!formData.pin.trim()) {
      newErrors.pin = "Pincode is required"
    } else if (!/^\d{6}$/.test(formData.pin)) {
      newErrors.pin = "Pincode must be 6 digits"
    }

    if (!formData.locality.trim()) {
      newErrors.locality = "Locality is required"
    }

    if (!formData.address.trim()) {
      newErrors.address = "Address is required"
    }

    if (!formData.city.trim()) {
      newErrors.city = "City is required"
    }

    if (!formData.state.trim()) {
      newErrors.state = "State is required"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  if (!isOpen) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (validateForm()) {
      onSubmit(formData)
      onClose()
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }))
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="bg-[#6c4323] p-4 flex justify-between items-center rounded-t-lg">
          <h2 className="text-white font-medium">
            {isEditing ? 'Edit Delivery Address' : 'Add Delivery Address'}
          </h2>
          <button onClick={onClose} className="text-white hover:text-gray-200">
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-[#6c4323] text-sm font-medium mb-2">Full Name</label>
            <Input
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder="Enter your full name"
              className={errors.name ? "border-red-500" : ""}
            />
            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
          </div>

          <div>
            <label className="block text-[#6c4323] text-sm font-medium mb-2">Mobile Number</label>
            <Input
              type="tel"
              value={formData.number}
              onChange={(e) => handleInputChange('number', e.target.value)}
              placeholder="Enter mobile number"
              className={errors.number ? "border-red-500" : ""}
            />
            {errors.number && <p className="text-red-500 text-xs mt-1">{errors.number}</p>}
          </div>

          <div>
            <label className="block text-[#6c4323] text-sm font-medium mb-2">Pincode</label>
            <Input
              value={formData.pin}
              onChange={(e) => handleInputChange('pin', e.target.value)}
              placeholder="Enter pincode"
              className={errors.pin ? "border-red-500" : ""}
            />
            {errors.pin && <p className="text-red-500 text-xs mt-1">{errors.pin}</p>}
          </div>

          <div>
            <label className="block text-[#6c4323] text-sm font-medium mb-2">Locality/Area</label>
            <Input
              value={formData.locality}
              onChange={(e) => handleInputChange('locality', e.target.value)}
              placeholder="Enter locality or area"
              className={errors.locality ? "border-red-500" : ""}
            />
            {errors.locality && <p className="text-red-500 text-xs mt-1">{errors.locality}</p>}
          </div>

          <div>
            <label className="block text-[#6c4323] text-sm font-medium mb-2">Address</label>
            <Input
              value={formData.address}
              onChange={(e) => handleInputChange('address', e.target.value)}
              placeholder="Flat, House no, Building, Street"
              className={errors.address ? "border-red-500" : ""}
            />
            {errors.address && <p className="text-red-500 text-xs mt-1">{errors.address}</p>}
          </div>

          <div>
            <label className="block text-[#6c4323] text-sm font-medium mb-2">City</label>
            <Input
              value={formData.city}
              onChange={(e) => handleInputChange('city', e.target.value)}
              placeholder="Enter city"
              className={errors.city ? "border-red-500" : ""}
            />
            {errors.city && <p className="text-red-500 text-xs mt-1">{errors.city}</p>}
          </div>

          <div>
            <label className="block text-[#6c4323] text-sm font-medium mb-2">State</label>
            <Select 
              value={formData.state} 
              onValueChange={(value) => handleInputChange('state', value)}
            >
              <SelectTrigger className={errors.state ? "border-red-500" : ""}>
                <SelectValue placeholder="Select state" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Andhra Pradesh">Andhra Pradesh</SelectItem>
                <SelectItem value="Arunachal Pradesh">Arunachal Pradesh</SelectItem>
                <SelectItem value="Assam">Assam</SelectItem>
                <SelectItem value="Bihar">Bihar</SelectItem>
                <SelectItem value="Chhattisgarh">Chhattisgarh</SelectItem>
                <SelectItem value="Goa">Goa</SelectItem>
                <SelectItem value="Gujarat">Gujarat</SelectItem>
                <SelectItem value="Haryana">Haryana</SelectItem>
                <SelectItem value="Himachal Pradesh">Himachal Pradesh</SelectItem>
                <SelectItem value="Jharkhand">Jharkhand</SelectItem>
                <SelectItem value="Karnataka">Karnataka</SelectItem>
                <SelectItem value="Kerala">Kerala</SelectItem>
                <SelectItem value="Madhya Pradesh">Madhya Pradesh</SelectItem>
                <SelectItem value="Maharashtra">Maharashtra</SelectItem>
                <SelectItem value="Manipur">Manipur</SelectItem>
                <SelectItem value="Meghalaya">Meghalaya</SelectItem>
                <SelectItem value="Mizoram">Mizoram</SelectItem>
                <SelectItem value="Nagaland">Nagaland</SelectItem>
                <SelectItem value="Odisha">Odisha</SelectItem>
                <SelectItem value="Punjab">Punjab</SelectItem>
                <SelectItem value="Rajasthan">Rajasthan</SelectItem>
                <SelectItem value="Sikkim">Sikkim</SelectItem>
                <SelectItem value="Tamil Nadu">Tamil Nadu</SelectItem>
                <SelectItem value="Telangana">Telangana</SelectItem>
                <SelectItem value="Tripura">Tripura</SelectItem>
                <SelectItem value="Uttar Pradesh">Uttar Pradesh</SelectItem>
                <SelectItem value="Uttarakhand">Uttarakhand</SelectItem>
                <SelectItem value="West Bengal">West Bengal</SelectItem>
                <SelectItem value="Delhi">Delhi</SelectItem>
                <SelectItem value="Jammu and Kashmir">Jammu and Kashmir</SelectItem>
                <SelectItem value="Ladakh">Ladakh</SelectItem>
                <SelectItem value="Chandigarh">Chandigarh</SelectItem>
                <SelectItem value="Dadra and Nagar Haveli and Daman and Diu">Dadra and Nagar Haveli and Daman and Diu</SelectItem>
                <SelectItem value="Lakshadweep">Lakshadweep</SelectItem>
                <SelectItem value="Puducherry">Puducherry</SelectItem>
                <SelectItem value="Andaman and Nicobar Islands">Andaman and Nicobar Islands</SelectItem>
              </SelectContent>
            </Select>
            {errors.state && <p className="text-red-500 text-xs mt-1">{errors.state}</p>}
          </div>

          <div>
            <label className="block text-[#6c4323] text-sm font-medium mb-2">Address Type</label>
            <div className="flex gap-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="addressType"
                  value="Home"
                  checked={formData.addressType === "Home"}
                  onChange={(e) => handleInputChange('addressType', e.target.value)}
                  className="mr-2"
                />
                Home
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="addressType"
                  value="Work"
                  checked={formData.addressType === "Work"}
                  onChange={(e) => handleInputChange('addressType', e.target.value)}
                  className="mr-2"
                />
                Work
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="addressType"
                  value="Other"
                  checked={formData.addressType === "Other"}
                  onChange={(e) => handleInputChange('addressType', e.target.value)}
                  className="mr-2"
                />
                Other
              </label>
            </div>
          </div>

          <Button type="submit" className="w-full bg-[#cf1a53] hover:bg-[#cf1a53]/90 text-white">
            {isEditing ? 'Update Address' : 'Add Address'}
          </Button>
        </form>
      </div>
    </div>
  )
}
