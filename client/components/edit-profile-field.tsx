"use client"

import { useState } from "react"
import { Edit } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface EditProfileFieldProps {
  label: string
  value: string
  onUpdate: (value: string) => void
  type?: string
  disabled?: boolean
}

export function EditProfileField({ label, value: _value, onUpdate, type = "text", disabled = false }: EditProfileFieldProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editValue, setEditValue] = useState(value)

  const handleUpdate = () => {
    onUpdate(editValue)
    setIsEditing(false)
  }

  const handleCancel = () => {
    setEditValue(value)
    setIsEditing(false)
  }

  return (
    <div className="mb-6">
      <label className="block text-[#6c4323] text-sm font-medium mb-2">{label}</label>
      <div className="flex items-center gap-4">
        <div className="flex-1 relative">
          <Input
            type={type}
            value={isEditing ? editValue : value}
            onChange={(e) => setEditValue(e.target.value)}
            readOnly={!isEditing}
            className={`pr-10 ${!isEditing ? "bg-gray-50 border-gray-200" : "bg-white border-[#b59c8a]"} ${disabled ? "bg-gray-100 text-gray-400" : ""}`}
            disabled={disabled}
          />
          {!disabled && (
            <button
              onClick={() => setIsEditing(true)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#6c4323] hover:text-[#cf1a53]"
            >
              <Edit className="h-4 w-4" />
            </button>
          )}
        </div>

        <div className="flex gap-2">
          <Button
            onClick={handleUpdate}
            disabled={!isEditing || disabled}
            className={`px-6 ${!isEditing || disabled ? "bg-gray-400 hover:bg-gray-400" : "bg-[#cf1a53] hover:bg-[#cf1a53]/90"} text-white`}
          >
            Update
          </Button>
          <Button
            variant="outline"
            onClick={handleCancel}
            className="px-6 border-[#cf1a53] text-[#cf1a53] hover:bg-[#cf1a53] hover:text-white"
          >
            Cancel
          </Button>
        </div>
      </div>
    </div>
  )
}
