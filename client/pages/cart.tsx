import { useEffect, useState } from "react"
import { useRouter } from "next/router"
import { CartItem } from "@/components/cart-item"
import { OrderSummary } from "@/components/order-summary"
import { Button } from "@/components/ui/button"
import Layout from "@/components/Layout"
import { getCart, updateCartItem, removeFromCart } from "@/services/cartService"

export default function CartPage() {
  const router = useRouter()
  const [cartItems, setCartItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadCart()
  }, [])

  const loadCart = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await getCart()
      
      console.log('Cart page - Raw data from server:', data)
      
      if (data.success === false) {
        setError(data.message || 'Could not load cart')
        setCartItems([])
      } else {
        // Process the cart items
        const rawItems = data.result || data || []
        console.log('Cart page - Raw items:', rawItems)
        
        const processedItems = rawItems.map((item: any) => {
          console.log('Cart page - Processing item:', item)
          return {
            ...item,
            proId: item.proId?.toString() || item.proId
          }
        })
        
        console.log('Cart page - Processed items:', processedItems)
        setCartItems(processedItems)
      }
    } catch (err: any) {
      console.error('Cart loading error:', err)
      setError('Could not load cart. Please try again.')
      setCartItems([])
    } finally {
      setLoading(false)
    }
  }

  const handleQuantityChange = async (id: string, quantity: number) => {
    if (quantity < 1) return;
    
    try {
      console.log('Cart page - Updating quantity for ID:', id, 'Quantity:', quantity)
      const result = await updateCartItem(id, quantity)
      if (result.success === false) {
        setError(result.message || 'Could not update cart')
        return
      }
      
      // Update local state
      setCartItems(items => items.map(item => 
        item.proId === id ? { ...item, quantity } : item
      ))
      setError(null)
    } catch (err: any) {
      console.error('Update cart error:', err)
      setError('Could not update cart. Please try again.')
    }
  }

  const handleRemove = async (id: string) => {
    try {
      console.log('Cart page - Removing item with ID:', id)
      const result = await removeFromCart(id)
      if (result.success === false) {
        setError(result.message || 'Could not remove item')
        return
      }
      
      // Update local state
      setCartItems(items => items.filter(item => item.proId !== id))
      setError(null)
    } catch (err: any) {
      console.error('Remove from cart error:', err)
      setError('Could not remove item. Please try again.')
    }
  }

  const itemTotal = cartItems.reduce((total, item) => total + (item.price * item.quantity), 0)
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

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600">{error}</p>
              <Button 
                onClick={loadCart}
                className="mt-2 text-red-500 underline hover:no-underline"
              >
                Try Again
              </Button>
            </div>
          )}

          {loading ? (
            <div className="text-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto mb-4"></div>
              <p>Loading cart...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                {cartItems.length === 0 ? (
                  <div className="text-center py-20">
                    <span className="text-6xl mb-4">🛒</span>
                    <p className="text-gray-500 mb-4">Your cart is empty.</p>
                    <Button 
                      onClick={() => router.push('/products')}
                      className="bg-pink-500 text-white px-6 py-2 rounded hover:bg-pink-600 transition"
                    >
                      Start Shopping
                    </Button>
                  </div>
                ) : (
                  cartItems.map((item) => (
                    <CartItem
                      key={item.proId}
                      id={item.proId}
                      name={item.item?.name || item.name}
                      price={item.price}
                      size={item.variantSize || item.size}
                      color={item.item?.colors?.[0] || item.color}
                      quantity={item.quantity}
                      image={item.item?.files?.[0] ? `/uploads/${item.item.files[0]}` : "/products/product.png"}
                      onQuantityChange={handleQuantityChange}
                      onRemove={handleRemove}
                    />
                  ))
                )}
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
                  disabled={cartItems.length === 0}
                >
                  Continue to checkout
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  )
}
