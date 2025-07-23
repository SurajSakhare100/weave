import { useEffect, useState } from "react"
import { useRouter } from "next/router"
import { CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import MainLayout from "@/components/layout/MainLayout"
import { useDispatch } from "react-redux"
import { clearCartAsync } from "@/features/cart/cartSlice"
import { AppDispatch } from "@/store/store"
import { toast } from "sonner"

export default function CheckoutSuccessPage() {
  const router = useRouter()
  const dispatch = useDispatch<AppDispatch>()
  const [cartCleared, setCartCleared] = useState(false)

  useEffect(() => {
    // Clear the cart when the success page loads
    const clearCart = async () => {
      try {
        const result = await dispatch(clearCartAsync()).unwrap()
        setCartCleared(true)
        toast.success('Cart cleared successfully')
      } catch (error) {
        console.error('Failed to clear cart:', error)
        toast.error('Failed to clear cart, but order was successful')
      }
    }
    
    clearCart()
  }, [dispatch])

  const handleContinueShopping = () => {
    router.push("/products")
  }

  const handleManualClearCart = async () => {
    try {
      const result = await dispatch(clearCartAsync()).unwrap()
      toast.success('Cart manually cleared')
    } catch (error) {
      console.error('Manual cart clear failed:', error)
      toast.error('Manual cart clear failed')
    }
  }

  return (
    <MainLayout>
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-8 max-w-md w-full text-center">
          {/* Success Icon */}
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 bg-green-600 rounded-full flex items-center justify-center">
              <CheckCircle className="w-12 h-12 text-white" />
            </div>
          </div>

          {/* Heading */}
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Congratulations!
          </h1>

          {/* Message */}
          <p className="text-gray-600 mb-8 leading-relaxed">
            Your order has been placed successfully!
          </p>

       

          {/* Continue Shopping Button */}
          <Button
            onClick={handleContinueShopping}
            className="w-full bg-[#cf1a53] hover:bg-[#cf1a53]/90 text-white py-3 px-6 rounded-lg font-semibold"
          >
            Continue shopping
          </Button>
        </div>
      </div>
    </MainLayout>
  )
} 