"use client"

import { useRouter } from "next/navigation"
import { OrderSummary } from "@/components/order-summary"
import { Button } from "@/components/ui/button"
import Layout from "@/components/Layout"

export default function OrderSummaryPage() {
  const router = useRouter()

  const cartItems = [
    {
      id: "1",
      name: "Bag name",
      price: 1999,
      size: "Large",
      color: "Pink",
      quantity: 1,
      image: "/products/product.png",
    },
    {
      id: "2",
      name: "Bag name",
      price: 1999,
      size: "Large",
      color: "Pink",
      quantity: 2,
      image: "/products/product.png",
    },
  ]

  const itemTotal = cartItems.reduce((total, item) => total + item.price * item.quantity, 0)

  return (
    <Layout>

    <div className="min-h-screen bg-[#fafafa]">

      <div className="max-w-7xl mx-auto px-4 lg:px-6 py-8">
        <nav className="text-[#6c4323] mb-8">
          <span>Home</span>
          <span className="mx-2">{">"}</span>
          <span>Cart</span>
          <span className="mx-2">{">"}</span>
          <span>Select Address</span>
          <span className="mx-2">{">"}</span>
          <span>Place Your Order</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            {cartItems.map((item) => (
              <div key={item.id} className="flex items-center gap-6 p-6 bg-[#fff9f5] rounded-lg mb-4">
                <div className=" bg-[#fff9f5] rounded-lg flex items-center justify-center">
                  <img src={item.image || "/placeholder.svg"} alt={item.name} className="w-32 h-32 object-contain" />
                </div>
                <div className="flex-1">
                  <h3 className="text-[#6c4323] font-medium text-lg mb-1">{item.name}</h3>
                  <p className="text-[#6c4323] font-semibold text-lg mb-2">₹ {item.price}</p>
                  <div className="text-[#6c4323] text-sm space-y-1">
                    <p>Size: {item.size}</p>
                    <p>Color: {item.color}</p>
                  </div>
                </div>
                <div className="text-[#6c4323] text-sm">Quantity: {item.quantity}</div>
              </div>
            ))}

            <div className="bg-white p-6 rounded-lg mt-6">
              <h3 className="text-[#6c4323] font-medium mb-2">Delivering to Snehal Dinde</h3>
              <p className="text-[#6c4323] text-sm">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et
                dolore magna aliqua.
              </p>
            </div>
          </div>

          <div>
            <OrderSummary itemTotal={itemTotal} deliveryFee={40} cashOnDeliveryFee={10} discount={243} />

            <Button
              onClick={() => router.push("/checkout/payment")}
              className="w-full mt-6 bg-[#cf1a53] hover:bg-[#cf1a53]/90 text-white"
            >
              Continue to checkout
            </Button>
          </div>
        </div>
      </div>
    </div>
    </Layout>

  )
}
