import { useState } from "react"
import { useRouter } from "next/router"
import { PaymentOption } from "@/components/payment-option"
import { BankOption } from "@/components/bank-option"
import { Button } from "@/components/ui/button"
import Layout from "@/components/Layout"
import { useCheckout, CheckoutProvider } from "@/components/checkout/CheckoutProvider"
import { placeOrder } from "@/services/orderService"

function CheckoutPaymentPageContent() {
  const router = useRouter()
  const { 
    selectedAddress, 
    cartItems, 
    itemTotal, 
    deliveryFee, 
    totalAmount, 
    discount,
    paymentMethod,
    setPaymentMethod,
    placeOrder: checkoutPlaceOrder,
    orderLoading,
    orderError
  } = useCheckout()
  const [selectedBank, setSelectedBank] = useState<string>('')

  const handlePaymentMethodSelect = (method: 'online' | 'cod') => {
    setPaymentMethod(method)
    if (method !== 'online') {
      setSelectedBank('')
    }
  }

  const handleBankSelect = (bank: string) => {
    setSelectedBank(bank)
  }

  const handlePlaceOrder = async () => {
    if (!selectedAddress) {
      alert('Please select a delivery address')
      return
    }

    if (!paymentMethod) {
      alert('Please select a payment method')
      return
    }

    if (paymentMethod === 'online' && !selectedBank) {
      alert('Please select a bank')
      return
    }

    if (cartItems.length === 0) {
      alert('Your cart is empty')
      return
    }

    try {
      const success = await checkoutPlaceOrder()
      if (success) {
        router.push('/checkout/success')
      } else {
        alert('Failed to place order. Please try again.')
      }
    } catch (error) {
      console.error('Error placing order:', error)
      alert('Failed to place order. Please try again.')
    }
  }

  if (!selectedAddress) {
    return (
      <Layout>
        <div className="min-h-screen bg-[#fafafa] flex items-center justify-center">
          <div className="text-center">
            <p className="text-red-600 mb-4">Please select a delivery address first</p>
            <Button onClick={() => router.push('/checkout/address')}>
              Go to Address Selection
            </Button>
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
            <p className="text-red-600 mb-4">Your cart is empty</p>
            <Button onClick={() => router.push('/products')}>
              Start Shopping
            </Button>
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
            <span>Address</span>
            <span className="mx-2">{">"}</span>
            <span>Payment</span>
          </nav>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <h1 className="text-2xl font-bold mb-6">Payment Method</h1>
            
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-semibold mb-4">Select Payment Method</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <PaymentOption
                    label="Cash on Delivery"
                    icon="💳"
                    isSelected={paymentMethod === 'cod'}
                    onSelect={() => handlePaymentMethodSelect('cod')}
                  />
                  <PaymentOption
                    label="Online Payment"
                    icon="🏦"
                    isSelected={paymentMethod === 'online'}
                    onSelect={() => handlePaymentMethodSelect('online')}
                  />
                </div>
              </div>

              {paymentMethod === 'online' && (
                <div>
                  <h2 className="text-lg font-semibold mb-4">Select Payment Option</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <PaymentOption
                      label="Credit/Debit Card"
                      icon="💳"
                      isSelected={selectedBank === 'card'}
                      onSelect={() => handleBankSelect('card')}
                    />
                    <PaymentOption
                      label="UPI"
                      icon="📱"
                      isSelected={selectedBank === 'upi'}
                      onSelect={() => handleBankSelect('upi')}
                    />
                    <PaymentOption
                      label="Net Banking"
                      icon="🏦"
                      isSelected={selectedBank === 'netbanking'}
                      onSelect={() => handleBankSelect('netbanking')}
                    />
                  </div>
                </div>
              )}

              {paymentMethod && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold mb-2">Order Summary</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Items Total:</span>
                      <span>₹{itemTotal}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Delivery Fee:</span>
                      <span>₹{deliveryFee}</span>
                    </div>
                    {paymentMethod === 'cod' && (
                      <div className="flex justify-between">
                        <span>Cash on Delivery Fee:</span>
                        <span>₹10</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span>Discount:</span>
                      <span>-₹{discount}</span>
                    </div>
                    <div className="border-t pt-2 flex justify-between font-semibold">
                      <span>Total:</span>
                      <span>₹{totalAmount}</span>
                    </div>
                  </div>
                </div>
              )}

              {orderError && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-red-600">{orderError}</p>
                </div>
              )}
            </div>

            <div className="mt-8 flex justify-between">
              <Button 
                onClick={() => router.back()}
                variant="outline"
              >
                Back
              </Button>
              <Button
                onClick={handlePlaceOrder}
                disabled={!paymentMethod || (paymentMethod === 'online' && !selectedBank) || orderLoading}
                className="bg-[#cf1a53] hover:bg-[#cf1a53]/90 text-white"
              >
                {orderLoading ? 'Placing Order...' : 'Place Order'}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}

export default function CheckoutPaymentPage() {
  return (
    <CheckoutProvider>
      <CheckoutPaymentPageContent />
    </CheckoutProvider>
  )
}
