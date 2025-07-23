import { useEffect } from "react"
import { useRouter } from "next/router"
import { CheckCircle, Package, Truck, Home, ShoppingBag, ChevronRight, Calendar, MapPin, CreditCard } from "lucide-react"
import { Button } from "@/components/ui/button"
import MainLayout from "@/components/layout/MainLayout"
import { useDispatch } from "react-redux"
import { clearCartAsync } from "@/features/cart/cartSlice"
import { useCheckout, CheckoutProvider } from "@/components/checkout/CheckoutProvider"
import { AppDispatch } from "@/store/store"
import Image from 'next/image'

function CheckoutSuccessPageContent() {
  const router = useRouter()
  const dispatch = useDispatch<AppDispatch>()
  const { selectedAddress, cartItems, itemTotal, deliveryFee, totalAmount, discount, clearCartCompletely } = useCheckout()


  const handleContinueShopping = () => {
    router.push("/products")
  }

  const handleViewOrders = () => {
    router.push("/user/orders")
  }

  const handleGoHome = () => {
    router.push("/")
  }

  return (
    <MainLayout>
      <div className="min-h-screen bg-[#faf9f7]">
        <div className="max-w-4xl mx-auto px-4 lg:px-6 py-8">
          {/* Breadcrumb */}
          <nav className="flex items-center space-x-2 text-sm mb-8">
            <span className="text-[#8b7355] hover:text-[#6b5635] cursor-pointer transition-colors" onClick={() => router.push('/')}>Home</span>
            <ChevronRight className="h-4 w-4 text-[#8b7355]" />
            <span className="text-[#8b7355] hover:text-[#6b5635] cursor-pointer transition-colors" onClick={() => router.push('/cart')}>Cart</span>
            <ChevronRight className="h-4 w-4 text-[#8b7355]" />
            <span className="text-[#8b7355] hover:text-[#6b5635] cursor-pointer transition-colors" onClick={() => router.push('/checkout/address')}>Select Address</span>
            <ChevronRight className="h-4 w-4 text-[#8b7355]" />
            <span className="text-[#8b7355] hover:text-[#6b5635] cursor-pointer transition-colors" onClick={() => router.push('/checkout/payment')}>Place Your Order</span>
            <ChevronRight className="h-4 w-4 text-[#8b7355]" />
            <span className="text-[#8b7355] font-medium">Success</span>
          </nav>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            {/* Success Header */}
            <div className="bg-gradient-to-r from-[#EE346C] to-[#c2185b] p-8 text-center text-white">
              <div className="flex justify-center mb-4">
                <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                  <CheckCircle className="w-12 h-12 text-white" />
                </div>
              </div>
              <h1 className="text-3xl font-bold mb-2">Order Placed Successfully!</h1>
              <p className="text-lg opacity-90">
                Thank you for your purchase. Your order has been confirmed and will be processed soon.
              </p>
            </div>

            <div className="p-8">
              {/* Order Summary */}
              <div className="bg-[#faf9f7] rounded-xl p-6 mb-8">
                <h2 className="text-xl font-semibold mb-6 text-[#5E3A1C] flex items-center">
                  <Package className="w-5 h-5 mr-2 text-[#EE346C]" />
                  Order Summary
                </h2>
                
                {/* Items */}
                <div className="space-y-4 mb-6">
                  {cartItems.map((item, index) => (
                    <div key={index} className="flex items-center gap-4 p-4 bg-white rounded-lg border border-gray-100">
                      <div className="relative w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                        <Image 
                          src={item.image || "/products/product.png"}
                          alt={item.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-[#5E3A1C] truncate">{item.name}</h3>
                        <p className="text-sm text-[#6b7280]">Qty: {item.quantity}</p>
                        {item.variantSize && (
                          <p className="text-sm text-[#6b7280]">Size: {item.variantSize}</p>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-[#5E3A1C]">₹{(item.price * item.quantity).toLocaleString()}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Totals */}
                <div className="border-t border-gray-200 pt-4 space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-[#6b7280]">Items Total:</span>
                    <span className="font-medium">₹{itemTotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-[#6b7280]">Delivery Fee:</span>
                    <span className="font-medium">₹{deliveryFee}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-[#6b7280]">Discount:</span>
                    <span className="font-medium text-green-600">-₹{discount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold text-[#5E3A1C] pt-2 border-t border-gray-200">
                    <span>Total:</span>
                    <span>₹{totalAmount.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Shipping Address */}
              {selectedAddress && (
                <div className="bg-[#faf9f7] rounded-xl p-6 mb-8">
                  <h2 className="text-xl font-semibold mb-4 text-[#5E3A1C] flex items-center">
                    <MapPin className="w-5 h-5 mr-2 text-[#EE346C]" />
                    Delivery Address
                  </h2>
                  <div className="bg-white rounded-lg p-4 border border-gray-100">
                    <div className="space-y-2">
                      <p className="font-semibold text-[#5E3A1C]">{selectedAddress.name}</p>
                      {selectedAddress.address.map((line: string, index: number) => (
                        <p key={index} className="text-[#6b7280]">{line}</p>
                      ))}
                      <p className="text-[#6b7280]">{selectedAddress.city}, {selectedAddress.state} - {selectedAddress.pincode}</p>
                      <p className="text-[#6b7280]">Phone: {selectedAddress.phone}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Next Steps */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 mb-8 border border-blue-100">
                <h2 className="text-xl font-semibold mb-6 text-[#5E3A1C] flex items-center">
                  <Truck className="w-5 h-5 mr-2 text-blue-600" />
                  What&apos;s Next?
                </h2>
                <div className="space-y-4">
                  <div className="flex items-start space-x-4">
                    <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">
                      1
                    </div>
                    <div>
                      <p className="font-semibold text-[#5E3A1C]">Order Confirmation</p>
                      <p className="text-sm text-[#6b7280]">You&apos;ll receive an email confirmation shortly</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-4">
                    <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">
                      2
                    </div>
                    <div>
                      <p className="font-semibold text-[#5E3A1C]">Order Processing</p>
                      <p className="text-sm text-[#6b7280]">We&apos;ll start processing your order within 24 hours</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-4">
                    <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">
                      3
                    </div>
                    <div>
                      <p className="font-semibold text-[#5E3A1C]">Shipping</p>
                      <p className="text-sm text-[#6b7280]">You&apos;ll receive tracking information once shipped</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Estimated Delivery */}
              <div className="bg-[#faf9f7] rounded-xl p-6 mb-8">
                <h2 className="text-xl font-semibold mb-4 text-[#5E3A1C] flex items-center">
                  <Calendar className="w-5 h-5 mr-2 text-[#EE346C]" />
                  Estimated Delivery
                </h2>
                <div className="bg-white rounded-lg p-4 border border-gray-100">
                  <p className="text-[#6b7280]">
                    Your order is expected to arrive within <span className="font-semibold text-[#5E3A1C]">3-5 business days</span>
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  onClick={handleContinueShopping}
                  className="bg-[#EE346C] hover:bg-[#c2185b] text-white flex items-center px-8 py-3 rounded-lg font-medium transition-colors"
                >
                  <ShoppingBag className="w-4 h-4 mr-2" />
                  Continue Shopping
                </Button>
                <Button
                  onClick={handleViewOrders}
                  variant="outline"
                  className="flex items-center px-8 py-3 rounded-lg font-medium border-[#EE346C] text-[#EE346C] hover:bg-[#EE346C] hover:text-white transition-colors"
                >
                  <Package className="w-4 h-4 mr-2" />
                  View Orders
                </Button>
                <Button
                  onClick={handleGoHome}
                  variant="outline"
                  className="flex items-center px-8 py-3 rounded-lg font-medium border-gray-300 text-[#6b7280] hover:bg-gray-50 transition-colors"
                >
                  <Home className="w-4 h-4 mr-2" />
                  Go Home
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  )
}

export default function CheckoutSuccessPage() {
  return (
    <CheckoutProvider>
      <CheckoutSuccessPageContent />
    </CheckoutProvider>
  )
} 