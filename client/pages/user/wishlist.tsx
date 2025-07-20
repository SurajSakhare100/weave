import MainLayout from '@/components/layout/MainLayout';
import { useSelector } from 'react-redux'
import { RootState } from '../../store/store'
import ProductCard from '@/components/products/ProductCard'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import { getProducts } from '../../services/productService'
import { useRequireUserAuth } from '../../hooks/useRequireUserAuth';
import { Product } from '@/types';

export default function WishlistPage() {
  useRequireUserAuth();
  const wishlist = useSelector((state: RootState) => state.user.wishlist)
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const allProducts = await getProducts()
        const wishlistProducts = allProducts?.data?.filter((product: Product) => wishlist.includes(product._id))
        setProducts(wishlistProducts)
      } catch (error) {
        console.error('Error fetching products:', error)
      } finally {
        setLoading(false)
      }
    }

    if (wishlist.length > 0) {
      fetchProducts()
    } else {
      setLoading(false)
    }
  }, [wishlist])

  if (loading) {
    return (
      <MainLayout>
        <section className="py-16 bg-[#faf5f2] min-h-screen">
          <div className="max-w-6xl mx-auto px-4">
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500"></div>
            </div>
          </div>
        </section>
      </MainLayout>
    )
  }

  return (
    <MainLayout>
      <section className="py-16 bg-[#faf5f2] min-h-screen">
        <div className="max-w-6xl mx-auto px-4">
          <h1 className="text-3xl font-bold text-gray-800 mb-8 text-center">Wishlist</h1>
          {products.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20">
              <span className="text-6xl mb-4">💖</span>
              <p className="text-lg text-gray-500 mb-4">No items in wishlist.</p>
              <Link href="/products" className="bg-pink-500 text-white px-6 py-2 rounded hover:bg-pink-600 transition">Browse Products</Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
              {products.map((product: Product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          )}
        </div>
      </section>
    </MainLayout>
  )
} 