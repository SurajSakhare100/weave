import { useState, useEffect } from "react"
import { useRouter } from "next/router"
import { Button } from "@/components/ui/button"
import MainLayout from "@/components/layout/MainLayout"
import { useCheckout, CheckoutProvider } from "@/components/checkout/CheckoutProvider"
import { ChevronRight, ChevronDown } from "lucide-react"
import { toast } from "sonner"
import { createRazorpayOrder, verifyRazorpayPayment } from '../../services/orderService';

declare global {
  interface Window {
    Razorpay: any;
  }
}

function CheckoutPaymentPageContent() {
  const router = useRouter()
  const RAZORPAY_KEY_ID = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || '';
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

  const handlePaymentMethodSelect = (method: 'online' | 'cod') => {
    setPaymentMethod(method)
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
    

    if (cartItems.length === 0) {
      toast.error('Your cart is empty')
      return
    }

    try {
      const orderCreationResult = await checkoutPlaceOrder();

      if (!orderCreationResult.success || !orderCreationResult.data || !orderCreationResult.data._id) {
        toast.error(orderCreationResult.message || 'Failed to create order. Please try again.');
        return;
      }
      const internalOrderId = orderCreationResult.data._id;

      if (paymentMethod === 'cod') {
        router.push('/checkout/success');
      } else if (paymentMethod === 'online') {
        if (!RAZORPAY_KEY_ID) {
          toast.error('Razorpay Key ID is not configured.');
          return;
        }

        const razorpayOrderResponse = await createRazorpayOrder(totalAmount, internalOrderId);

        if (!razorpayOrderResponse.success) {
          toast.error(razorpayOrderResponse.message || 'Failed to initiate online payment.');
          return;
        }

        const options = {
          key: RAZORPAY_KEY_ID,
          amount: razorpayOrderResponse.amount, // amount in paisa
          currency: razorpayOrderResponse.currency,
          name: "Weave E-commerce",
          description: `Payment for Order ID: ${internalOrderId}`,
          order_id: razorpayOrderResponse.orderId,
          handler: async function (response: any) {
            try {
              const verificationResponse = await verifyRazorpayPayment({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                orderId: internalOrderId, // Your internal order ID
              });

              if (verificationResponse.success) {
                toast.success('Payment successful and order placed!');
                router.push('/checkout/success');
              } else {
                toast.error(verificationResponse.message || 'Payment verification failed.');
              }
            } catch (error) {
              // toast.error('An error occurred during payment verification.');
            }
          },
          prefill: {
            name: selectedAddress?.name,
            email: "", 
            contact: selectedAddress?.phone,
          },
          notes: {
            address: selectedAddress?.address.join(', '),
          },
          theme: {
            color: "#cf1a53",
          },
        };

        const rzp = new window.Razorpay(options);
        rzp.on('payment.failed', function (response: any) {
          // toast.error(response.error.description || 'Payment failed. Please try again.');
        });
        rzp.open();
      } else {
        toast.error('Invalid payment method selected.');
      }
    } catch (error) {
      // toast.error('Failed to place order. Please try again.')
    }
  }

  useEffect(() => {
    const script = document.createElement('script');
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);


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
                        <span className="font-bold text-base sm:text-lg">₹{(itemTotal+deliveryFee)}</span>
                        <span className="font-bold text-base sm:text-lg ml-2">Pay with Razorpay</span>
                      </div>
                    </div>
                  </div>
                  </div>
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
                    <span className="line-through text-sm sm:text-lg">₹{(itemTotal+deliveryFee +discount).toLocaleString()}</span>
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
                    <span className="font-medium">₹{(itemTotal+deliveryFee +discount).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Delivery</span>
                    <span className="font-medium">₹{deliveryFee}</span>
                  </div>
                  {paymentMethod === 'cod' && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">COD Fee</span>
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
                    <span>₹{itemTotal+deliveryFee}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Continue to Checkout Button */}
          <div className="mt-6 sm:mt-8 flex justify-center">
            <Button
              onClick={handlePlaceOrder}
              disabled={!paymentMethod || orderLoading}
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
