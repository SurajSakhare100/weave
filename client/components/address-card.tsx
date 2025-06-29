"use client"

import { Edit, Trash2, Star } from "lucide-react"
import { Button } from "@/components/ui/button"

interface AddressCardProps {
  address: {
    id: string
    name: string
    number: string
    pin: string
    locality: string
    address: string
    city: string
    state: string
    addressType: string
    isDefault?: boolean
  }
  isSelected?: boolean
  onSelect?: () => void
  onEdit?: () => void
  onDelete?: () => void
  onSetDefault?: () => void
  showActions?: boolean
}

export function AddressCard({ 
  address, 
  isSelected = false, 
  onSelect, 
  onEdit, 
  onDelete, 
  onSetDefault,
  showActions = true 
}: AddressCardProps) {
  const addressLines = [
    address.address,
    `${address.locality}, ${address.city}`,
    `${address.state} - ${address.pin}`,
    `Phone: ${address.number}`
  ]

  return (
    <div className="flex items-start gap-4 py-6 border-b border-[#f0f0f0] last:border-b-0">
      {onSelect && (
        <div className="mt-1">
          <input
            type="radio"
            checked={isSelected}
            onChange={onSelect}
            className="w-4 h-4 text-[#cf1a53] border-[#b59c8a] focus:ring-[#cf1a53]"
          />
        </div>
      )}

      <div className="flex-1">
        <div className="flex items-center gap-2 mb-2">
          <h3 className="text-[#6c4323] font-medium text-lg">{address.name}</h3>
          {address.isDefault && (
            <span className="bg-[#cf1a53] text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
              <Star className="w-3 h-3" />
              Default
            </span>
          )}
          <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full">
            {address.addressType}
          </span>
        </div>
        
        <div className="text-[#6c4323] text-sm space-y-1">
          {addressLines.map((line, index) => (
            <p key={index}>{line}</p>
          ))}
        </div>

        {showActions && (
          <div className="flex gap-2 mt-4">
            {onEdit && (
              <Button
                variant="outline"
                size="sm"
                onClick={onEdit}
                className="text-[#6c4323] border-[#6c4323] hover:bg-[#6c4323] hover:text-white"
              >
                <Edit className="w-4 h-4 mr-1" />
                Edit
              </Button>
            )}
            {onDelete && (
              <Button
                variant="outline"
                size="sm"
                onClick={onDelete}
                className="text-red-600 border-red-600 hover:bg-red-600 hover:text-white"
              >
                <Trash2 className="w-4 h-4 mr-1" />
                Delete
              </Button>
            )}
            {onSetDefault && !address.isDefault && (
              <Button
                variant="outline"
                size="sm"
                onClick={onSetDefault}
                className="text-[#6c4323] border-[#6c4323] hover:bg-[#6c4323] hover:text-white"
              >
                <Star className="w-4 h-4 mr-1" />
                Set Default
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
