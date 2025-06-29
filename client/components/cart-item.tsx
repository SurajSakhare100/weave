import { Minus, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import Image from 'next/image'

interface CartItemProps {
  id: string
  name: string
  price: number
  size: string
  color: string
  quantity: number
  image: string
  onQuantityChange: (id: string, quantity: number) => void
  onRemove?: (id: string) => void
}

export function CartItem({ id, name, price, size, color, quantity, image, onQuantityChange, onRemove }: CartItemProps) {
  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity >= 1) {
      onQuantityChange(id, newQuantity)
    } else if (onRemove) {
      onRemove(id)
    }
  }

  return (
    <div className="flex items-center gap-6 p-6 bg-[#fff9f5] rounded-lg mb-4">
      <div className="w-20 h-20 bg-[#fff9f5] rounded-lg flex items-center justify-center">
        <Image src={image || "/products/product.png"} alt={name} width={64} height={64} className="object-contain" />
      </div>

      <div className="flex-1">
        <h3 className="text-[#6c4323] font-medium text-lg mb-1">{name}</h3>
        <p className="text-[#6c4323] font-semibold text-lg mb-2">₹ {price}</p>
        <div className="text-[#6c4323] text-sm space-y-1">
          <p>Size: {size}</p>
          <p>Color: {color}</p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleQuantityChange(quantity - 1)}
          className="w-8 h-8 p-0 border-[#cf1a53] text-[#cf1a53] hover:bg-[#cf1a53] hover:text-white"
        >
          <Minus className="h-4 w-4" />
        </Button>
        <span className="text-[#6c4323] font-medium w-8 text-center">{quantity}</span>
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleQuantityChange(quantity + 1)}
          className="w-8 h-8 p-0 border-[#cf1a53] text-[#cf1a53] hover:bg-[#cf1a53] hover:text-white"
        >
          <Plus className="h-4 w-4" />
        </Button>
        {onRemove && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onRemove(id)}
            className="ml-2 text-red-500"
          >
            Remove
          </Button>
        )}
      </div>
    </div>
  )
}
