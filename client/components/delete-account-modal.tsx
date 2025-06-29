"use client"

import { X } from "lucide-react"
import { Button } from "@/components/ui/button"

interface DeleteAccountModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
}

export function DeleteAccountModal({ isOpen, onClose, onConfirm }: DeleteAccountModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg max-w-md w-full mx-4 overflow-hidden">
        <div className="bg-[#6c4323] p-4 flex justify-between items-center">
          <div></div>
          <button onClick={onClose} className="text-white hover:text-gray-200">
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="p-8 text-center">
          <h2 className="text-[#6c4323] text-xl font-medium mb-4">Delete Weave account</h2>
          <p className="text-[#6c4323] text-sm mb-8">
            Once deleted, you&apos;ll lose access to the account and saved details.
          </p>

          <div className="flex gap-4">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1 border-[#cf1a53] text-[#cf1a53] hover:bg-[#cf1a53] hover:text-white"
            >
              Cancel
            </Button>
            <Button onClick={onConfirm} className="flex-1 bg-[#cf1a53] hover:bg-[#cf1a53]/90 text-white">
              Proceed
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
