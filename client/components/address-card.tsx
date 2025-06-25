"use client"

interface AddressCardProps {
  name: string
  address: string[]
  isSelected?: boolean
  onSelect?: () => void
}

export function AddressCard({ name, address, isSelected = false, onSelect }: AddressCardProps) {
  return (
    <div className="flex items-start gap-4 py-6 border-b border-[#f0f0f0] last:border-b-0">
      <div className="mt-1">
        <input
          type="radio"
          checked={isSelected}
          onChange={onSelect}
          className="w-4 h-4 text-[#cf1a53] border-[#b59c8a] focus:ring-[#cf1a53]"
        />
      </div>

      <div>
        <h3 className="text-[#6c4323] font-medium text-lg mb-2">{name}</h3>
        <div className="text-[#6c4323] text-sm space-y-1">
          {address.map((line, index) => (
            <p key={index}>{line}</p>
          ))}
        </div>
      </div>
    </div>
  )
}
