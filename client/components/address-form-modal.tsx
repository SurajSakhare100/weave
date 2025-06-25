"use client"

import type React from "react"

import { useState } from "react"
import { X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface AddressFormModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (address: any) => void
}

export function AddressFormModal({ isOpen, onClose, onSubmit }: AddressFormModalProps) {
  const [formData, setFormData] = useState({
    country: "India",
    firstName: "",
    lastName: "",
    mobile: "",
    building: "",
    area: "",
    state: "",
    pincode: "",
    addressType: "Home",
  })

  if (!isOpen) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="bg-[#6c4323] p-4 flex justify-between items-center rounded-t-lg">
          <h2 className="text-white font-medium">Add Delivery address</h2>
          <button onClick={onClose} className="text-white hover:text-gray-200">
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-[#6c4323] text-sm font-medium mb-2">Country</label>
            <Select value={formData.country} onValueChange={(value) => setFormData({ ...formData, country: value })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="India">India</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="block text-[#6c4323] text-sm font-medium mb-2">First name</label>
            <Input
              value={formData.firstName}
              onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
              required
            />
          </div>

          <div>
            <label className="block text-[#6c4323] text-sm font-medium mb-2">Last name</label>
            <Input
              value={formData.lastName}
              onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
              required
            />
          </div>

          <div>
            <label className="block text-[#6c4323] text-sm font-medium mb-2">Mobile number</label>
            <Input
              type="tel"
              value={formData.mobile}
              onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
              required
            />
          </div>

          <div>
            <label className="block text-[#6c4323] text-sm font-medium mb-2">Flat, House no, Building</label>
            <Input
              value={formData.building}
              onChange={(e) => setFormData({ ...formData, building: e.target.value })}
              required
            />
          </div>

          <div>
            <label className="block text-[#6c4323] text-sm font-medium mb-2">Area, Street, Sector</label>
            <Input
              value={formData.area}
              onChange={(e) => setFormData({ ...formData, area: e.target.value })}
              required
            />
          </div>

          <div>
            <label className="block text-[#6c4323] text-sm font-medium mb-2">State</label>
            <Select value={formData.state} onValueChange={(value) => setFormData({ ...formData, state: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Select state" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Maharashtra">Maharashtra</SelectItem>
                <SelectItem value="Karnataka">Karnataka</SelectItem>
                <SelectItem value="Haryana">Haryana</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="block text-[#6c4323] text-sm font-medium mb-2">Pincode</label>
            <Input
              value={formData.pincode}
              onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
              required
            />
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
                  onChange={(e) => setFormData({ ...formData, addressType: e.target.value })}
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
                  onChange={(e) => setFormData({ ...formData, addressType: e.target.value })}
                  className="mr-2"
                />
                Work
              </label>
            </div>
          </div>

          <Button type="submit" className="w-full bg-[#cf1a53] hover:bg-[#cf1a53]/90 text-white">
            Continue
          </Button>
        </form>
      </div>
    </div>
  )
}
