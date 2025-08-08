import { useRouter } from 'next/router'
import { useEffect, useState, useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { addCartItem } from '../../features/cart/cartSlice'
import { addToWishlist, removeFromWishlist } from '../../features/user/userSlice'
import { RootState, AppDispatch } from '../../store/store'
import { getProductById, getSimilarProducts, getFrequentlyBoughtTogether, getComparableProducts } from '../../services/productService'
import { 
  AlertCircle,
  Loader2,
  Clock
} from 'lucide-react'
import { Product, ProductWithReviews } from '@/types'
import ProductCard from '@/components/products/ProductCard'
import ProductDetails from '@/components/products/ProductDetails'
import MainLayout from '@/components/layout/MainLayout'
import { toast } from 'sonner'
import ReviewForm from '@/components/reviews/ReviewForm';
import ReviewSection from '@/components/reviews/ReviewSection';
import { fetchCart } from '../../features/cart/cartSlice';

export default function ProductDetailPage() {
  const router = useRouter()
  const { id } = router.query
  const dispatch = useDispatch<AppDispatch>()
  
  const [product, setProduct] = useState<ProductWithReviews | null>(null)
  const [similarProducts, setSimilarProducts] = useState<Product[]>([])
  const [frequentlyBought, setFrequentlyBought] = useState<Product[]>([])
  const [comparableProducts, setComparableProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showReviewForm, setShowReviewForm] = useState(false)

  const { wishlist, isAuthenticated } = useSelector((state: RootState) => state.user)
  const inWishlist = product && wishlist.includes(product._id)

  const loadProduct = useCallback(async () => {
    if (!id) return;
    
    try {
      setLoading(true)
      setError(null)
      
      const response = await getProductById(id as string)
      
      if (response.success === false) {
        setError(response.message || 'Failed to load product')
        return
      }
      
      const productData = response.data || response
      if (!productData) {
        setError('Product not found')
        return
      }
      
      setProduct(productData)
      
      // Load related products in parallel
      try {
        const [similarResponse, frequentlyBoughtResponse, comparableResponse] = await Promise.all([
          getSimilarProducts(id as string),
          getFrequentlyBoughtTogether(id as string, 4),
          getComparableProducts(id as string, 4)
        ]);

        if (similarResponse.success && similarResponse.data) {
          setSimilarProducts(similarResponse.data);
        }
        
        if (frequentlyBoughtResponse.success && frequentlyBoughtResponse.data) {
          setFrequentlyBought(frequentlyBoughtResponse.data);
        }
        
        if (comparableResponse.success && comparableResponse.data) {
          setComparableProducts(comparableResponse.data);
        }
      } catch (relatedError) {
        console.error('Failed to load related products:', relatedError)
      }
    } catch (error: unknown) {
      console.error('Product loading error:', error)
      
      if (error instanceof Error) {
        if (error.message.includes('not found') || error.message.includes('not available')) {
          setError('This product is not available or has been removed.')
          toast.error('Product not available')
        } else {
          setError(error.message)
          toast.error(error.message)
        }
      } else {
        setError('Failed to load product')
        toast.error('Failed to load product')
      }
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    if (id) {
      loadProduct()
    }
  }, [id, loadProduct])

  const handleAddToCart = async () => {
    if (!product) {
      toast.error('Product not available');
      return;
    }

    if (!product._id) {
      toast.error('Invalid product data');
      return;
    }

    try {
      await dispatch(addCartItem({
        product,
        quantity: 1,
      })).unwrap()
      toast.success('Added to cart successfully!')
      
      // Refresh cart to ensure UI is updated immediately
      dispatch(fetchCart())
    } catch (error: any) {
      console.error('Failed to add to cart:', error)
      toast.error(error.message || 'Failed to add to cart')
    }
  }

  const handleWishlistToggle = () => {
    if (!isAuthenticated) {
      router.push(`/login?redirect=/products/${id}`);
      return;
    }
    
    if (!product || !product._id) {
      toast.error('Product not available');
      return;
    }
    
    if (inWishlist) {
      dispatch(removeFromWishlist(product._id))
      toast.success('Removed from wishlist')
    } else {
      dispatch(addToWishlist(product._id))
      toast.success('Added to wishlist')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-pink-500 mx-auto mb-4" />
          <p className="text-gray-600">Loading product...</p>
        </div>
      </div>
    )
  }

  if (error || !product) {
    const isApprovalIssue = error && (
      error.includes('pending approval') ||
      error.includes('not available') ||
      error === 'This product is not available or has been removed.'
    );
    
    const isPendingApproval = error && error.includes('pending approval');

    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          {isApprovalIssue ? (
            <>
              <div className={`rounded-full p-3 w-16 h-16 mx-auto mb-4 flex items-center justify-center ${
                isPendingApproval ? 'bg-blue-100' : 'bg-yellow-100'
              }`}>
                {isPendingApproval ? (
                  <Clock className="h-8 w-8 text-blue-600" />
                ) : (
                  <AlertCircle className="h-8 w-8 text-yellow-600" />
                )}
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">
                {isPendingApproval ? 'Product Under Review' : 'Product Not Available'}
              </h2>
              <p className="text-gray-600 mb-6 leading-relaxed">
                {isPendingApproval 
                  ? 'This product is currently under review by our team and will be available once approved. Please check back later or browse our other available products.'
                  : 'This product is currently not available for viewing. It may be temporarily unavailable or has been removed by the seller.'
                }
              </p>
              <div className="space-y-3">
                <Link 
                  href="/products" 
                  className="block bg-pink-600 text-white px-6 py-3 rounded-lg hover:bg-pink-700 transition-colors font-medium"
                >
                  Browse Available Products
                </Link>
                <Link 
                  href="/" 
                  className="block text-gray-600 hover:text-gray-800 transition-colors"
                >
                  Return to Home
                </Link>
              </div>
            </>
          ) : (
            <>
              <div className="bg-red-100 rounded-full p-3 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <AlertCircle className="h-8 w-8 text-red-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">Product Not Found</h2>
              <p className="text-gray-600 mb-6 leading-relaxed">
                {error || 'The product you are looking for does not exist or may have been removed.'}
              </p>
              <div className="space-y-3">
                <Link 
                  href="/products" 
                  className="block bg-pink-600 text-white px-6 py-3 rounded-lg hover:bg-pink-700 transition-colors font-medium"
                >
                  Browse Products
                </Link>
                <Link 
                  href="/" 
                  className="block text-gray-600 hover:text-gray-800 transition-colors"
                >
                  Return to Home
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    )
  }

  return (
    <MainLayout>
      <div className="bg-white min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Main Product Section */}
          <ProductDetails
            product={product}
            inWishlist={inWishlist}
            onWishlistToggle={handleWishlistToggle}
            onAddToCart={handleAddToCart}
          />

          {/* Frequently Bought Together */}
          {frequentlyBought.length > 0 && (
            <div className="mt-16">
              <h2 className="text-xl font-medium text-[#5E3A1C] mb-6">Frequently Bought Together</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {frequentlyBought.map((item) => (
                  <ProductCard key={item._id} product={item} />
                ))}
              </div>
            </div>
          )}

          {/* Related Products */}
          {similarProducts.length > 0 && (
            <div className="mt-16">
              <h2 className="text-xl font-medium text-[#5E3A1C] mb-6">Related Products</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {similarProducts.map((item) => (
                  <ProductCard key={item._id} product={item} />
                ))}
              </div>
            </div>
          )}

          {/* Compare With Similar Items */}
          {comparableProducts.length > 0 && (
            <div className="mt-16">
              <h2 className="text-xl font-medium text-[#5E3A1C] mb-6">Compare With Similar Items</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {comparableProducts.map((item) => (
                  <ProductCard key={item._id} product={item} />
                ))}
              </div>
            </div>
          )}

          {/* Review Section */}
          <div className="mt-16">
            {/* Review Form Modal */}
            {showReviewForm && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                  <ReviewForm
                    productId={id as string}
                    onReviewSubmitted={() => {
                      setShowReviewForm(false);
                      window.location.reload();
                    }}
                    onCancel={() => setShowReviewForm(false)}
                  />
                </div>
              </div>
            )}

            {/* Review Section */}
            <ReviewSection
              reviews={
                (product.reviews || []).map((review: any) => ({
                  productId: product._id,
                  ...review,
                }))
              }
              averageRating={product.averageRating}
              totalReviews={product.totalReviews}
              ratingDistribution={
                product.ratingDistribution 
                  ? product.ratingDistribution.reduce((acc: { [key: string]: number }, item: { _id: string; count: number }) => {
                      acc[item._id] = item.count;
                      return acc;
                    }, {})
                  : {}
              }
              isAuthenticated={isAuthenticated}
              vendorName={product.vendorId?.name}
              onWriteReview={() => setShowReviewForm(true)}
              onLogin={() => router.push(`/login?redirect=/products/${id}`)}
              onResponse={() => {
                window.location.reload();
              }}
              onEdit={(reviewId, updatedReview) => {
                console.log('Edit review:', reviewId, updatedReview);
                window.location.reload(); 
              }}
              onDelete={(reviewId) => {
                window.location.reload();
              }}
            />
          </div>
        </div>
      </div>
    </MainLayout>
  )
}