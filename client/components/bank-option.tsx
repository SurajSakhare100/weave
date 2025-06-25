"use client"

import type React from "react"

interface BankOptionProps {
  icon: React.ReactNode
  name: string
  isSelected?: boolean
  onSelect?: () => void
}

export function BankOption({ icon, name, isSelected = false, onSelect }: BankOptionProps) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-[#f0f0f0] last:border-b-0">
      <div className="flex items-center gap-3">
        <div className="w-6 h-6">{icon}</div>
        <span className="text-[#6c4323]">{name}</span>
      </div>
      <input
        type="radio"
        checked={isSelected}
        onChange={onSelect}
        className="w-4 h-4 text-[#cf1a53] border-[#b59c8a] focus:ring-[#cf1a53]"
      />
    </div>
  )
}
