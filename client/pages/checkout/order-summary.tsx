import { useRouter } from "next/router"
import { Button } from "@/components/ui/button"
import Layout from "@/components/Layout"
import { useCheckout, CheckoutProvider } from "@/components/checkout/CheckoutProvider"
import { ChevronRight, ChevronUp, ChevronDown } from "lucide-react"
import CartItem from '@/components/cart/CartItem'
import { useState } from 'react'

function CheckoutOrderSummaryPageContent() {
  const router = useRouter()
  const { 
    cartItems, 
    selectedAddress, 
    itemTotal, 
    deliveryFee, 
    discount,
    cartLoading,
    cartError
  } = useCheckout()

  const [summaryOpen, setSummaryOpen] = useState(true)

  const handleContinue = () => {
    if (!selectedAddress) {
      alert('Please select a delivery address first')
      router.push("/checkout/address")
      return
    }
    router.push("/checkout/payment")
  }

  if (cartLoading) {
    return (
      <Layout>
        <div className="min-h-screen bg-[#fafafa] flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500"></div>
        </div>
      </Layout>
    )
  }

  if (cartError) {
    return (
      <Layout>
        <div className="min-h-screen bg-[#fafafa] flex items-center justify-center">
          <div className="text-center">
            <p className="text-red-600 mb-4">{cartError}</p>
            <Button onClick={() => router.push('/cart')}>Back to Cart</Button>
          </div>
        </div>
      </Layout>
    )
  }

  if (cartItems.length === 0) {
    return (
      <Layout>
        <div className="min-h-screen bg-[#fafafa] flex items-center justify-center">
          <div className="text-center">
            <p className="text-gray-600 mb-4">Your cart is empty</p>
            <Button onClick={() => router.push('/products')}>Start Shopping</Button>
          </div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="min-h-screen  py-12">
        <div className="max-w-6xl mx-auto px-4 flex flex-col gap-8">
          <nav className="flex items-center space-x-2 text-lg mb-8">
            <span className="text-[#8b7355] hover:text-[#6b5635] cursor-pointer font-medium" onClick={() => router.push('/')}>Home</span>
            <ChevronRight className="h-5 w-5 text-[#8b7355]" />
            <span className="text-[#8b7355] hover:text-[#6b5635] cursor-pointer font-medium" onClick={() => router.push('/cart')}>Cart</span>
            <ChevronRight className="h-5 w-5 text-[#8b7355]" />
            <span className="text-[#8b7355] font-medium">Select Address</span>
            <ChevronRight className="h-5 w-5 text-[#8b7355]" />
            <span className="text-[#8b7355] font-medium">Place Your Order</span>
          </nav>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Cart Items */}
            <div className="flex flex-col gap-4">
              {cartItems.map((item, index) => (
                <CartItem
                  key={item.proId || index}
                  item={{
                    ...item,
                    size: item.variantSize || '-',
                    color: item.color || '-',
                  }}
                  onQuantityChange={() => {}}
                  onRemove={() => {}}
                />
              ))}
            </div>

            {/* Order Summary & Address */}
            <div className="flex flex-col gap-6">
              {/* Summary Card */}
              <div className="bg-[#fff9f5] rounded-xl p-6 mb-2 relative">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 bg-[#6c4323] text-white rounded flex items-center justify-center font-bold text-xl">🧾</div>
                  <span className="text-[#6c4323] font-bold text-lg">To Pay</span>
                  <span className="text-[#6c4323] line-through text-lg">₹ {(itemTotal + discount).toLocaleString()}</span>
                  <span className="text-[#6c4323] font-bold text-lg">₹ {(itemTotal + deliveryFee + 10 - discount).toLocaleString()}</span>
                  <button
                    className="absolute top-6 right-6 p-1 bg-transparent border-none outline-none cursor-pointer"
                    onClick={() => setSummaryOpen((open) => !open)}
                    aria-label="Toggle summary details"
                  >
                    {summaryOpen ? (
                      <ChevronUp className="h-7 w-7 text-[#8b7355] transition-transform duration-200" />
                    ) : (
                      <ChevronDown className="h-7 w-7 text-[#8b7355] transition-transform duration-200" />
                    )}
                  </button>
                </div>
                <div className="text-[#3ca06b] font-semibold mb-4 text-base">₹ {discount} saved on the total!</div>
                {summaryOpen && (
                  <div className="divide-y divide-[#f5e7df]">
                    <div className="flex justify-between py-4 text-[#8b7355] text-base items-center">
                      <span>Item Total</span>
                      <span className="flex items-center gap-2 font-medium">
                        <span className="line-through text-[#bcae9e]">₹ {(itemTotal + discount).toLocaleString()}</span>
                        <span className="text-[#6c4323] font-bold">₹ {itemTotal.toLocaleString()}</span>
                      </span>
                    </div>
                    <div className="flex justify-between py-4 text-[#8b7355] text-base items-center">
                      <span>Delivery fee</span>
                      <span className="text-[#6c4323] font-bold">₹ {deliveryFee}</span>
                    </div>
                    <div className="flex justify-between py-4 text-[#8b7355] text-base items-center">
                      <span>Cash/Pay on Delivery fee</span>
                      <span className="text-[#6c4323] font-bold">₹ 10</span>
                    </div>
                    <div className="flex justify-between py-4 font-bold text-[#6c4323] text-lg items-center">
                      <span>Order Total</span>
                      <span>₹ {(itemTotal + deliveryFee + 10 - discount).toLocaleString()}</span>
                    </div>
                  </div>
                )}
              </div>
              {/* Address Card */}
              {selectedAddress && (
                <div className="bg-[#fff9f5] rounded-xl p-6">
                  <div className="font-bold text-[#6c4323] text-lg mb-1">Delivering to {selectedAddress.name}</div>
                  <div className="text-[#8b7355] text-base">Lorem Ipsum has been the industry standard dummy text ever since the 1500s</div>
                  <hr className="mt-4 border-[#f5e7df]" />
                </div>
              )}
            </div>
          </div>

          {/* Continue Button */}
          <div className="flex justify-center mt-10">
            <Button
              onClick={handleContinue}
              className="bg-[#EE346C] hover:bg-[#c2185b] text-white text-xl font-semibold rounded-sm px-12 py-6 shadow-none border-none"
              style={{ minWidth: 340 }}
            >
              Continue to checkout
            </Button>
          </div>
        </div>
      </div>
    </Layout>
  )
}

export default function CheckoutOrderSummaryPage() {
  return (
    <CheckoutProvider>
      <CheckoutOrderSummaryPageContent />
    </CheckoutProvider>
  )
}

