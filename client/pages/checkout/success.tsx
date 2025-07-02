import { useEffect } from "react"
import { useRouter } from "next/router"
import { CheckCircle, Package, Truck, Home, ShoppingBag, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import Layout from "@/components/Layout"
import { useDispatch } from "react-redux"
import { clearCartAsync } from "@/features/cart/cartSlice"
import { useCheckout, CheckoutProvider } from "@/components/checkout/CheckoutProvider"
import { AppDispatch } from "@/store/store"
import Image from 'next/image'

function CheckoutSuccessPageContent() {
  const router = useRouter()
  const dispatch = useDispatch<AppDispatch>()
  const { selectedAddress, cartItems, itemTotal, deliveryFee, totalAmount, discount } = useCheckout()

  useEffect(() => {
    // Clear the cart when the success page loads
    dispatch(clearCartAsync())
  }, [dispatch])

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
    <Layout>
      <div className="min-h-screen bg-[#fafafa]">
        <div className="max-w-4xl mx-auto px-4 lg:px-6 py-8">
          <nav className="flex items-center space-x-2 text-sm mb-12">
            <span className="text-[#8b7355] hover:text-[#6b5635] cursor-pointer" onClick={() => router.push('/')}>Home</span>
            <ChevronRight className="h-4 w-4 text-[#8b7355]" />
            <span className="text-[#8b7355] hover:text-[#6b5635] cursor-pointer" onClick={() => router.push('/cart')}>Cart</span>
            <ChevronRight className="h-4 w-4 text-[#8b7355]" />
            <span className="text-[#8b7355]">Success</span>
          </nav>
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            {/* Success Icon */}
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="w-12 h-12 text-green-600" />
              </div>
            </div>

            {/* Success Message */}
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Order Placed Successfully!
            </h1>
            <p className="text-gray-600 mb-8 text-lg">
              Thank you for your purchase. Your order has been confirmed and will be processed soon.
            </p>

            {/* Order Details */}
            <div className="bg-gray-50 rounded-lg p-6 mb-8 text-left">
              <h2 className="text-xl font-semibold mb-4 text-gray-900">Order Summary</h2>
              
              {/* Items */}
              <div className="space-y-3 mb-4">
                {cartItems.map((item, index) => (
                  <div key={index} className="flex justify-between items-center">
                    <div className="flex items-center space-x-3">
                      <Image 
                        src={item.image || "/products/product.png"}
                        alt={item.name}
                        width={48}
                        height={48}
                        className="object-cover rounded"
                      />
                      <div>
                        <p className="font-medium text-gray-900">{item.name}</p>
                        <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                        {item.variantSize && (
                          <p className="text-sm text-gray-600">Size: {item.variantSize}</p>
                        )}
                      </div>
                    </div>
                    <p className="font-medium">₹{item.price * item.quantity}</p>
                  </div>
                ))}
              </div>

              {/* Totals */}
              <div className="border-t pt-4 space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Items Total:</span>
                  <span>₹{itemTotal}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Delivery Fee:</span>
                  <span>₹{deliveryFee}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Discount:</span>
                  <span className="text-green-600">-₹{discount}</span>
                </div>
                <div className="flex justify-between font-semibold text-lg">
                  <span>Total:</span>
                  <span>₹{totalAmount}</span>
                </div>
              </div>
            </div>

            {/* Shipping Address */}
            {selectedAddress && (
              <div className="bg-gray-50 rounded-lg p-6 mb-8 text-left">
                <h2 className="text-xl font-semibold mb-4 text-gray-900 flex items-center">
                  <Truck className="w-5 h-5 mr-2" />
                  Delivery Address
                </h2>
                <div className="space-y-1">
                  <p className="font-medium text-gray-900">{selectedAddress.name}</p>
                  {selectedAddress.address.map((line: string, index: number) => (
                    <p key={index} className="text-gray-600">{line}</p>
                  ))}
                  <p className="text-gray-600">{selectedAddress.city}, {selectedAddress.state} - {selectedAddress.pincode}</p>
                  <p className="text-gray-600">Phone: {selectedAddress.phone}</p>
                </div>
              </div>
            )}

            {/* Next Steps */}
            <div className="bg-blue-50 rounded-lg p-6 mb-8">
              <h2 className="text-xl font-semibold mb-4 text-gray-900 flex items-center">
                <Package className="w-5 h-5 mr-2" />
                What&apos;s Next?
              </h2>
              <div className="space-y-3 text-left">
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-medium mt-0.5">
                    1
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Order Confirmation</p>
                    <p className="text-sm text-gray-600">You&apos;ll receive an email confirmation shortly</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-medium mt-0.5">
                    2
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Order Processing</p>
                    <p className="text-sm text-gray-600">We&apos;ll start processing your order within 24 hours</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-medium mt-0.5">
                    3
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Shipping</p>
                    <p className="text-sm text-gray-600">You&apos;ll receive tracking information once shipped</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                onClick={handleContinueShopping}
                className="bg-[#cf1a53] hover:bg-[#cf1a53]/90 text-white flex items-center"
              >
                <ShoppingBag className="w-4 h-4 mr-2" />
                Continue Shopping
              </Button>
              <Button
                onClick={handleViewOrders}
                variant="outline"
                className="flex items-center"
              >
                <Package className="w-4 h-4 mr-2" />
                View Orders
              </Button>
              <Button
                onClick={handleGoHome}
                variant="outline"
                className="flex items-center"
              >
                <Home className="w-4 h-4 mr-2" />
                Go Home
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}

export default function CheckoutSuccessPage() {
  return (
    <CheckoutProvider>
      <CheckoutSuccessPageContent />
    </CheckoutProvider>
  )
} 