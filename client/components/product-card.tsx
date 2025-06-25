import { Button } from "@/components/ui/button"

interface ProductCardProps {
  name: string
  price: string
  size: string
  color: string
  quantity: number
  image: string
}

export function ProductCard({ name, price, size, color, quantity, image }: ProductCardProps) {
  return (
    <div className="flex items-center gap-6 p-6 bg-[#fff9f5] rounded-lg mb-6">
      <div className="w-32 h-32 bg-[#fff9f5] rounded-lg flex items-center justify-center">
        <img src={image || "/placeholder.svg"} alt={name} className="w-24 h-24 object-contain" />
      </div>

      <div className="flex-1">
        <h3 className="text-[#6c4323] font-medium text-lg mb-2">{name}</h3>
        <p className="text-[#6c4323] font-semibold text-lg mb-2">{price}</p>
        <div className="text-[#6c4323] text-sm space-y-1">
          <p>Size: {size}</p>
          <p>Color: {color}</p>
          <p>Quantity: {quantity}</p>
        </div>
      </div>

      <Button
        variant="outline"
        className="border-[#cf1a53] text-[#cf1a53] hover:bg-[#cf1a53] hover:text-white bg-white px-8"
      >
        Reorder
      </Button>
    </div>
  )
}
