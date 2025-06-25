"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { CartItem } from "@/components/cart-item"
import { OrderSummary } from "@/components/order-summary"
import { Button } from "@/components/ui/button"
import Layout from "@/components/Layout"

export default function CartPage() {
  const router = useRouter()
  const [cartItems, setCartItems] = useState([
    {
      id: "1",
      name: "Bag name",
      price: 1999,
      size: "Large",
      color: "Pink",
      quantity: 1,
      image: "/tote-bag-product.png",
    },
    {
      id: "2",
      name: "Bag name",
      price: 1999,
      size: "Large",
      color: "Pink",
      quantity: 2,
      image: "/tote-bag-product.png",
    },
  ])

  const handleQuantityChange = (id: string, quantity: number) => {
    setCartItems((items) => items.map((item) => (item.id === id ? { ...item, quantity } : item)))
  }

  const itemTotal = cartItems.reduce((total, item) => total + item.price * item.quantity, 0)
  const deliveryFee = 40
  const cashOnDeliveryFee = 10
  const discount = 243

  return (
    <Layout>

    <div className="min-h-screen bg-[#fafafa]">

      <div className="max-w-7xl mx-auto px-4 lg:px-6 py-8">
        <nav className="text-[#6c4323] mb-8">
          <span>Home</span>
          <span className="mx-2">{">"}</span>
          <span>Cart</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            {cartItems.map((item) => (
              <CartItem key={item.id} {...item} onQuantityChange={handleQuantityChange} />
            ))}
          </div>

          <div>
            <OrderSummary
              itemTotal={itemTotal}
              deliveryFee={deliveryFee}
              cashOnDeliveryFee={cashOnDeliveryFee}
              discount={discount}
            />

            <Button
              onClick={() => router.push("/checkout/address")}
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
