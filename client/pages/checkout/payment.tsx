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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
          {/* Breadcrumb */}
          <nav className="flex items-center space-x-1 sm:space-x-2 text-xs sm:text-sm mb-6 sm:mb-8 overflow-x-auto">
            <span className="text-gray-500 hover:text-gray-700 cursor-pointer whitespace-nowrap" onClick={() => router.push('/')}>Home</span>
            <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4 text-gray-400 flex-shrink-0" />
            <span className="text-gray-500 hover:text-gray-700 cursor-pointer whitespace-nowrap" onClick={() => router.push('/cart')}>Cart</span>
            <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4 text-gray-400 flex-shrink-0" />
            <span className="text-gray-500 hover:text-gray-700 cursor-pointer whitespace-nowrap" onClick={() => router.push('/checkout/address')}>Select Address</span>
            <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4 text-gray-400 flex-shrink-0" />
            <span className="text-gray-500 hover:text-gray-700 cursor-pointer whitespace-nowrap" onClick={() => router.push('/checkout/payment')}>Place Your Order</span>
            <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4 text-gray-400 flex-shrink-0" />
            <span className="text-[#cf1a53] font-medium whitespace-nowrap">Payment Method</span>
          </nav>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
            {/* Main Payment Section */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
                {/* Pay Online Option */}
                <div className="mb-4 sm:mb-6">
                  <div className="flex items-center justify-between p-3 sm:p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center gap-2 sm:gap-3">
                      <input
                        type="radio"
                        name="paymentType"
                        checked={paymentMethod === 'online'}
                        onChange={() => handlePaymentMethodSelect('online')}
                        className="w-4 h-4 text-[#cf1a53]"
                      />
                      <div>
                        <span className="font-bold text-base sm:text-lg">₹{(itemTotal+10+deliveryFee)}</span>
                        <span className="font-bold text-base sm:text-lg ml-2">Pay Online</span>
                      </div>
                    </div>
                  </div>
                </div>

                {paymentMethod === 'online' && (
                  <div className="space-y-4 sm:space-y-6">
                    {/* UPI Section */}
                    <div className="border border-gray-200 rounded-lg p-3 sm:p-4">
                      <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                        <div className="w-6 h-6 sm:w-8 sm:h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <Smartphone className="w-3 h-3 sm:w-4 sm:h-4 text-blue-600" />
                        </div>
                        <span className="font-semibold text-sm sm:text-base">UPI</span>
                        <span className="text-xs sm:text-sm text-gray-600">Pay by any UPI App</span>
                      </div>
                      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
                        <input
                          type="text"
                          placeholder="Enter UPI ID"
                          value={upiId}
                          onChange={(e) => setUpiId(e.target.value)}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#cf1a53] text-sm sm:text-base"
                        />
                        <Button variant="outline" className="flex items-center gap-1 w-full sm:w-auto text-sm sm:text-base">
                          <Plus className="w-3 h-3 sm:w-4 sm:h-4" />
                          Add UPI ID
                        </Button>
                      </div>
                    </div>

                    {/* Debit/Credit Cards Section */}
                    <div className="border border-gray-200 rounded-lg">
                      <button
                        onClick={() => setShowCardSection(!showCardSection)}
                        className="w-full p-3 sm:p-4 flex items-center justify-between hover:bg-gray-50"
                      >
                        <div className="flex items-center gap-2 sm:gap-3">
                          <CreditCard className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
                          <span className="font-semibold text-sm sm:text-base">Debit/Credit Cards</span>
                        </div>
                        {showCardSection ? <ChevronUp className="w-4 h-4 sm:w-5 sm:h-5" /> : <ChevronDown className="w-4 h-4 sm:w-5 sm:h-5" />}
                      </button>
                      {showCardSection && (
                        <div className="p-3 sm:p-4 border-t border-gray-200">
                          <p className="text-gray-600 text-xs sm:text-sm">Card payment options will be available here</p>
                        </div>
                      )}
                    </div>

                    {/* Net Banking Section */}
                    <div className="border border-gray-200 rounded-lg">
                      <button
                        onClick={() => setShowNetBankingSection(!showNetBankingSection)}
                        className="w-full p-3 sm:p-4 flex items-center justify-between hover:bg-gray-50"
                      >
                        <div className="flex items-center gap-2 sm:gap-3">
                          <Building2 className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
                          <span className="font-semibold text-sm sm:text-base">Net Banking</span>
                        </div>
                        {showNetBankingSection ? <ChevronUp className="w-4 h-4 sm:w-5 sm:h-5" /> : <ChevronDown className="w-4 h-4 sm:w-5 sm:h-5" />}
                      </button>
                      {showNetBankingSection && (
                        <div className="p-3 sm:p-4 border-t border-gray-200">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                            {banks.map((bank, index) => (
                              <div
                                key={index}
                                className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50"
                                onClick={() => handleBankSelect(bank.name)}
                              >
                                <input
                                  type="radio"
                                  name="bank"
                                  checked={selectedBank === bank.name}
                                  onChange={() => handleBankSelect(bank.name)}
                                  className="w-3 h-3 sm:w-4 sm:h-4 text-[#cf1a53]"
                                />
                                <span className="text-lg sm:text-2xl">{bank.logo}</span>
                                <span className="font-medium text-xs sm:text-sm">{bank.name}</span>
                              </div>
                            ))}
                          </div>
                          <div className="mt-2 sm:mt-3">
                            <button className="text-[#cf1a53] text-xs sm:text-sm font-medium hover:underline">
                              View all banks
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Cash on Delivery Option */}
                <div className="mt-4 sm:mt-6">
                  <div className="flex items-center justify-between p-3 sm:p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center gap-2 sm:gap-3">
                      <input
                        type="radio"
                        name="paymentType"
                        checked={paymentMethod === 'cod'}
                        onChange={() => handlePaymentMethodSelect('cod')}
                        className="w-4 h-4 text-[#cf1a53]"
                      />
                      <div>
                        <span className="font-bold text-base sm:text-lg">Cash on Delivery</span>
                        <p className="text-xs sm:text-sm text-gray-600">Pay when you receive your order</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Order Summary Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-[#fff9f5] rounded-lg p-4 sm:p-6">
                <div className="flex items-center justify-between mb-3 sm:mb-4">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                    <span className="font-bold text-base sm:text-lg">To Pay</span>
                    <span className="line-through text-sm sm:text-lg">₹{(itemTotal+10+deliveryFee +discount).toLocaleString()}</span>
                    <span className="font-bold text-base sm:text-lg">₹{totalAmount.toLocaleString()}</span>
                  </div>
                  <button className="p-1">
                    <ChevronDown className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
                  </button>
                </div>
                
                <div className="text-green-600 font-semibold mb-3 sm:mb-4 text-sm sm:text-base">
                  ₹{discount} saved on the total!
                </div>

                <div className="space-y-2 sm:space-y-3 text-xs sm:text-sm">
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
                  <div className="flex justify-between font-bold text-base sm:text-lg border-t border-gray-200 pt-2 sm:pt-3">
                    <span>Total</span>
                    <span>₹{itemTotal+10+deliveryFee}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Continue to Checkout Button */}
          <div className="mt-6 sm:mt-8 flex justify-center">
            <Button
              onClick={handlePlaceOrder}
              disabled={!paymentMethod || (paymentMethod === 'online' && !selectedBank) || orderLoading}
              className="bg-[#cf1a53] hover:bg-[#cf1a53]/90 text-white py-3 sm:py-4 px-6 sm:px-10 text-base sm:text-lg font-semibold rounded-lg w-full sm:w-auto"
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
