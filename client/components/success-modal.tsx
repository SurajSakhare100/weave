"use client"

import { Check, X } from "lucide-react"
import { Button } from "@/components/ui/button"

interface SuccessModalProps {
  isOpen: boolean
  onClose: () => void
  onContinueShopping: () => void
}

export function SuccessModal({ isOpen, onClose, onContinueShopping }: SuccessModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg max-w-sm w-full mx-4 overflow-hidden">
        <div className="bg-[#6c4323] p-4 flex justify-end">
          <button onClick={onClose} className="text-white hover:text-gray-200">
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="p-8 text-center">
          <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <Check className="h-8 w-8 text-white" />
          </div>

          <h2 className="text-[#6c4323] text-xl font-medium mb-2">Congratulations!</h2>
          <p className="text-[#6c4323] text-sm mb-6">Your order has been placed successfully!</p>

          <Button onClick={onContinueShopping} className="w-full bg-[#6c4323] hover:bg-[#6c4323]/90 text-white">
            Continue shopping
          </Button>
        </div>
      </div>
    </div>
  )
}
