import { useRouter } from "next/router"
import { OrderSummary } from "@/components/order-summary"
import { Button } from "@/components/ui/button"
import Layout from "@/components/Layout"
import { useCheckout, CheckoutProvider } from "@/components/checkout/CheckoutProvider"

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
      <div className="min-h-screen bg-[#fafafa]">
        <div className="max-w-4xl mx-auto px-4 lg:px-6 py-8">
          <nav className="text-[#6c4323] mb-8">
            <span>Home</span>
            <span className="mx-2">{">"}</span>
            <span>Cart</span>
            <span className="mx-2">{">"}</span>
            <span>Order Summary</span>
          </nav>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <h1 className="text-2xl font-bold mb-6">Order Summary</h1>
            
            <div className="space-y-4 mb-6">
              {cartItems.map((item, index) => (
                <div key={index} className="flex items-center space-x-4 p-4 border rounded-lg">
                  <img 
                    src={item.image || "/products/product.png"}
                    alt={item.name}
                    className="w-16 h-16 object-cover rounded"
                  />
                  <div className="flex-1">
                    <h3 className="font-semibold">{item.name}</h3>
                    <p className="text-gray-600">Qty: {item.quantity}</p>
                    {item.variantSize && <p className="text-gray-600">Size: {item.variantSize}</p>}
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">₹{item.price * item.quantity}</p>
                  </div>
                </div>
              ))}
            </div>

            <OrderSummary
              itemTotal={itemTotal}
              deliveryFee={deliveryFee}
              cashOnDeliveryFee={0}
              discount={discount}
            />

            {selectedAddress && (
              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <h3 className="font-semibold mb-2">Delivery Address</h3>
                <div className="space-y-1">
                  <p className="font-medium">{selectedAddress.name}</p>
                  {selectedAddress.address.map((line, index) => (
                    <p key={index} className="text-gray-600">{line}</p>
                  ))}
                  <p className="text-gray-600">{selectedAddress.city}, {selectedAddress.state} - {selectedAddress.pincode}</p>
                  <p className="text-gray-600">Phone: {selectedAddress.phone}</p>
                </div>
              </div>
            )}

            <div className="mt-8 flex justify-between">
              <Button 
                onClick={() => router.back()}
                variant="outline"
              >
                Back
              </Button>
              <Button
                onClick={handleContinue}
                className="bg-[#cf1a53] hover:bg-[#cf1a53]/90 text-white"
              >
                Continue to Payment
              </Button>
            </div>
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

