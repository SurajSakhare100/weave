import { useState } from "react"
import { useRouter } from "next/router"
import { Button } from "@/components/ui/button"
import MainLayout from "@/components/layout/MainLayout"
import { useCheckout, CheckoutProvider } from "@/components/checkout/CheckoutProvider"
import { ChevronRight, ChevronDown, ChevronUp, CreditCard, Building2, Smartphone, Plus } from "lucide-react"
import { toast } from "sonner"

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
  const [upiId, setUpiId] = useState('')
  const [showCardSection, setShowCardSection] = useState(false)
  const [showNetBankingSection, setShowNetBankingSection] = useState(true)

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
      toast.error('Please select a delivery address')
      return
    }

    if (!paymentMethod) {
      toast.error('Please select a payment method')
      return
    }

    if (paymentMethod === 'online' && !selectedBank) {
      toast.error('Please select a payment option')
      return
    }

    if (cartItems.length === 0) {
      toast.error('Your cart is empty')
      return
    }

    try {
      const success = await checkoutPlaceOrder()
      if (success) {
        router.push('/checkout/success')
      } else {
        toast.error('Failed to place order. Please try again.')
      }
    } catch (error) {
      console.error('Error placing order:', error)
      toast.error('Failed to place order. Please try again.')
    }
  }

  const banks = [
    { name: 'State Bank of India', logo: '🏦' },
    { name: 'HDFC Bank', logo: '🏦' },
    { name: 'ICICI Netbanking', logo: '🏦' },
    { name: 'Axis Bank', logo: '🏦' },
  ]

  return (
    <MainLayout>
        <div className="min-h-screen bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 py-8">
          {/* Breadcrumb */}
          <nav className="flex items-center space-x-2 text-sm mb-8">
            <span className="text-gray-500 hover:text-gray-700 cursor-pointer" onClick={() => router.push('/')}>Home</span>
            <ChevronRight className="h-4 w-4 text-gray-400" />
            <span className="text-gray-500 hover:text-gray-700 cursor-pointer" onClick={() => router.push('/cart')}>Cart</span>
            <ChevronRight className="h-4 w-4 text-gray-400" />
            <span className="text-gray-500 hover:text-gray-700 cursor-pointer" onClick={() => router.push('/checkout/address')}>Select Address</span>
            <ChevronRight className="h-4 w-4 text-gray-400" />
            <span className="text-gray-500 hover:text-gray-700 cursor-pointer" onClick={() => router.push('/checkout/payment')}>Place Your Order</span>
            <ChevronRight className="h-4 w-4 text-gray-400" />
            <span className="text-[#cf1a53] font-medium">Payment Method</span>
          </nav>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Payment Section */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                {/* Pay Online Option */}
                <div className="mb-6">
                  <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="paymentType"
                        checked={paymentMethod === 'online'}
                        onChange={() => handlePaymentMethodSelect('online')}
                        className="w-4 h-4 text-[#cf1a53]"
                      />
                      <div>
                        <span className="font-bold text-lg">₹{(itemTotal+10+deliveryFee)}</span>
                        <span className="font-bold text-lg ml-2">Pay Online</span>
                      </div>
                    </div>
                  </div>
                </div>

                {paymentMethod === 'online' && (
                  <div className="space-y-6">
                    {/* UPI Section */}
                    <div className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <Smartphone className="w-4 h-4 text-blue-600" />
                        </div>
                        <span className="font-semibold">UPI</span>
                        <span className="text-sm text-gray-600">Pay by any UPI App</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          placeholder="Enter UPI ID"
                          value={upiId}
                          onChange={(e) => setUpiId(e.target.value)}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#cf1a53]"
                        />
                        <Button variant="outline" className="flex items-center gap-1">
                          <Plus className="w-4 h-4" />
                          Add UPI ID
                        </Button>
                      </div>
                    </div>

                    {/* Debit/Credit Cards Section */}
                    <div className="border border-gray-200 rounded-lg">
                      <button
                        onClick={() => setShowCardSection(!showCardSection)}
                        className="w-full p-4 flex items-center justify-between hover:bg-gray-50"
                      >
                        <div className="flex items-center gap-3">
                          <CreditCard className="w-5 h-5 text-gray-600" />
                          <span className="font-semibold">Debit/Credit Cards</span>
                        </div>
                        {showCardSection ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                      </button>
                      {showCardSection && (
                        <div className="p-4 border-t border-gray-200">
                          <p className="text-gray-600 text-sm">Card payment options will be available here</p>
                        </div>
                      )}
                    </div>

                    {/* Net Banking Section */}
                    <div className="border border-gray-200 rounded-lg">
                      <button
                        onClick={() => setShowNetBankingSection(!showNetBankingSection)}
                        className="w-full p-4 flex items-center justify-between hover:bg-gray-50"
                      >
                        <div className="flex items-center gap-3">
                          <Building2 className="w-5 h-5 text-gray-600" />
                          <span className="font-semibold">Net Banking</span>
                        </div>
                        {showNetBankingSection ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                      </button>
                                              {showNetBankingSection && (
                        <div className="p-4 border-t border-gray-200">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {banks.map((bank, index) => (
                              <div
                                key={index}
                                className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50"
                                onClick={() => handleBankSelect(bank.name)}
                              >
                                <input
                                  type="radio"
                                  name="bank"
                                  checked={selectedBank === bank.name}
                                  onChange={() => handleBankSelect(bank.name)}
                                  className="w-4 h-4 text-[#cf1a53]"
                                />
                                <span className="text-2xl">{bank.logo}</span>
                                <span className="font-medium">{bank.name}</span>
                              </div>
                            ))}
                          </div>
                          <div className="mt-3">
                            <button className="text-[#cf1a53] text-sm font-medium hover:underline">
                              View all banks
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Cash on Delivery Option */}
                <div className="mt-6">
                  <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="paymentType"
                        checked={paymentMethod === 'cod'}
                        onChange={() => handlePaymentMethodSelect('cod')}
                        className="w-4 h-4 text-[#cf1a53]"
                      />
                      <div>
                        <span className="font-bold text-lg">Cash on Delivery</span>
                        <p className="text-sm text-gray-600">Pay when you receive your order</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Order Summary Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-[#fff9f5] rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-lg">To Pay</span>
                    <span className="line-through text-lg">₹{(itemTotal+10+deliveryFee +discount).toLocaleString()}</span>
                    <span className="font-bold text-lg">₹{totalAmount.toLocaleString()}</span>
                  </div>
                  <button className="p-1">
                    <ChevronDown className="w-5 h-5 text-gray-600" />
                  </button>
                </div>
                
                <div className="text-green-600 font-semibold mb-4">
                  ₹{discount} saved on the total!
                </div>

                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="font-medium">₹{(itemTotal+10+deliveryFee +discount).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Delivery</span>
                    <span className="font-medium">₹{deliveryFee}</span>
                  </div>
                  {paymentMethod === 'cod' && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">COD Fee</span>
                      <span className="font-medium">₹10</span>
                    </div>
                  )}
                  {discount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Discount</span>
                      <span>-₹{discount}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-bold text-lg border-t border-gray-200 pt-3">
                    <span>Total</span>
                    <span>₹{itemTotal+10+deliveryFee}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Continue to Checkout Button */}
          <div className="mt-8 flex justify-center">
            <Button
              onClick={handlePlaceOrder}
              disabled={!paymentMethod || (paymentMethod === 'online' && !selectedBank) || orderLoading}
              className="bg-[#cf1a53] hover:bg-[#cf1a53]/90 text-white py-4 px-10 text-lg font-semibold rounded-lg"
            >
              {orderLoading ? 'Processing...' : 'Continue to checkout'}
            </Button>
          </div>
        </div>
      </div>
    </MainLayout>
  )
}

export default function CheckoutPaymentPage() {
  return (
    <CheckoutProvider>
      <CheckoutPaymentPageContent />
    </CheckoutProvider>
  )
}
