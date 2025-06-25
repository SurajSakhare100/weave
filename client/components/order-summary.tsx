interface OrderSummaryProps {
  itemTotal: number
  deliveryFee: number
  cashOnDeliveryFee?: number
  discount?: number
}

export function OrderSummary({ itemTotal, deliveryFee, cashOnDeliveryFee = 0, discount = 0 }: OrderSummaryProps) {
  const orderTotal = itemTotal + deliveryFee + cashOnDeliveryFee - discount

  return (
    <div className="bg-[#fff9f5] p-6 rounded-lg">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-[#6c4323] text-white rounded text-xs flex items-center justify-center font-bold">
            ₹
          </div>
          <span className="text-[#6c4323] font-medium">To Pay</span>
          <span className="text-[#6c4323] line-through text-sm">₹ {(itemTotal + discount).toLocaleString()}</span>
          <span className="text-[#6c4323] font-bold">₹ {orderTotal.toLocaleString()}</span>
        </div>
      </div>

      <div className="text-[#cf1a53] text-sm mb-4">₹ {discount} saved on the total!</div>

      <div className="space-y-3 text-sm">
        <div className="flex justify-between">
          <span className="text-[#6c4323]">Item Total</span>
          <span className="text-[#6c4323]">₹ {itemTotal.toLocaleString()}</span>
        </div>

        <div className="flex justify-between">
          <span className="text-[#6c4323]">Delivery fee</span>
          <span className="text-[#6c4323]">₹ {deliveryFee}</span>
        </div>

        {cashOnDeliveryFee > 0 && (
          <div className="flex justify-between">
            <span className="text-[#6c4323]">Cash/Pay on Delivery fee</span>
            <span className="text-[#6c4323]">₹ {cashOnDeliveryFee}</span>
          </div>
        )}

        <hr className="border-[#e5e5e5]" />

        <div className="flex justify-between font-semibold">
          <span className="text-[#6c4323]">Order Total</span>
          <span className="text-[#6c4323]">₹ {orderTotal.toLocaleString()}</span>
        </div>
      </div>
    </div>
  )
}
