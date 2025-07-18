"use client"

import { Edit, Trash2 } from "lucide-react"
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

  showActions?: boolean
  submitting?: boolean
  handleContinue?: () => void
}

export function AddressCard({
  address,
  isSelected = false,
  onSelect,
  onEdit,
  onDelete,

  showActions = true, 
  submitting = false,
  handleContinue = () => {},
}: AddressCardProps) {
  return (
    <div className={`bg-[#FFFBF8] rounded-md p-2 border-none mb-4 relative ${isSelected ? '' : 'bg-white'}`}> 
      {showActions && (onEdit || onDelete) && (
        <div className="absolute top-4 right-4 flex gap-2 z-10">
          {onEdit && (
            <button
              onClick={onEdit}
              className="p-2 rounded-full hover:bg-gray-100 text-[#6c4323]"
              title="Edit Address"
              type="button"
            >
              <Edit className="w-5 h-5" />
            </button>
          )}
          {onDelete && (
            <button
              onClick={onDelete}
              className="p-2 rounded-full hover:bg-gray-100 text-[#cf1a53]"
              title="Delete Address"
              type="button"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          )}
        </div>
      )}
      <div className="flex items-start gap-3">
        {onSelect && (
          <button onClick={onSelect} className="mt-1 flex-shrink-0 cursor-pointer">
            <div className="w-5 h-5 rounded-full border-2 border-[#8b7355] flex items-center justify-center">
              {isSelected && <div className="w-3 h-3 rounded-full bg-[#8b7355]"></div>}
            </div>
          </button>
        )}
        <div>
          <div className="flex items-center gap-2">
            <span className="font-bold text-[#6c4323] text-lg">{address.name}</span>
          </div>
          <div className="text-[#8b7355] text-base leading-snug mt-1">
            <div>{address.address}</div>
            <div>{address.locality}, {address.city}</div>
            <div>{address.state} – {address.pin}</div>
          </div>
        </div>
      </div>
      {isSelected && (
        <>
          <hr className="my-4 border-[#f5e7df]" />
          <div className="w-fit">
            <Button
              onClick={handleContinue}
              disabled={submitting}
              className="bg-[#EE346C] hover:bg-[#c2185b] text-white w-full text-base font-medium rounded-md py-2.5 px-4"
            >
              {submitting ? "Processing..." : "Deliver to this address"}
            </Button>
          </div>
        </>
      )}
    </div>
  )
}
