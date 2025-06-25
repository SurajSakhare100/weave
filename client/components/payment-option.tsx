"use client"

import type React from "react"

interface PaymentOptionProps {
  icon?: React.ReactNode
  label: string
  amount?: string
  isSelected?: boolean
  onSelect?: () => void
  children?: React.ReactNode
}

export function PaymentOption({ icon, label, amount, isSelected = false, onSelect, children }: PaymentOptionProps) {
  return (
    <div className="border border-[#e5e5e5] rounded-lg p-4 mb-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {icon && <div className="text-[#6c4323]">{icon}</div>}
          <span className="text-[#6c4323] font-medium">{label}</span>
          {amount && <span className="text-[#6c4323] font-semibold">₹{amount}</span>}
        </div>
        <input
          type="radio"
          checked={isSelected}
          onChange={onSelect}
          className="w-4 h-4 text-[#cf1a53] border-[#b59c8a] focus:ring-[#cf1a53]"
        />
      </div>
      {children && <div className="mt-4">{children}</div>}
    </div>
  )
}
