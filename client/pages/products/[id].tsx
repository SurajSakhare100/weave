import { useRouter } from 'next/router'
import { useEffect, useState, useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { addCartItem } from '../../features/cart/cartSlice'
import { addToWishlist, removeFromWishlist } from '../../features/user/userSlice'
import { RootState, AppDispatch } from '../../store/store'
import { getProductById, getSimilarProducts } from '../../services/productService'
import Link from 'next/link'
import { 
  Heart, 
  ShoppingCart, 
  Star, 
  AlertCircle,
  Loader2,
  Clock
} from 'lucide-react'
import { Product, ProductWithReviews } from '@/types'
import ProductCard from '@/components/products/ProductCard'
import MainLayout from '@/components/layout/MainLayout'
import Image from 'next/image'
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
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [quantity, setQuantity] = useState(1)
  const [selectedSize, setSelectedSize] = useState<string>('M') // Add size selection state
  const [showReviewForm, setShowReviewForm] = useState(false)

  const { wishlist, isAuthenticated, user } = useSelector((state: RootState) => state.user)
  const inWishlist = product && wishlist.includes(product._id)

  const loadProduct = useCallback(async () => {
    if (!id) return;
    
    try {
      setLoading(true)
      setError(null)
      
      const response = await getProductById(id as string)
      
      // Handle different response formats
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
      setSelectedSize(productData.sizes ? productData.sizes[0] : 'M')
      
      // Load similar products
      try {
        const similarResponse = await getSimilarProducts(id as string)
        console.log('Similar products response:', similarResponse)
        if (similarResponse.success && similarResponse.data) {
          setSimilarProducts(similarResponse.data)
          console.log('Similar products loaded:', similarResponse.data.length)
        } else {
          console.log('No similar products found or response failed:', similarResponse)
        }
      } catch (similarError) {
        console.error('Failed to load similar products:', similarError)
        // Don't fail the whole page if similar products fail to load
      }
    } catch (error: unknown) {
      console.error('Product loading error:', error)
      
      // Handle specific error cases
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
        quantity,
        variantSize: selectedSize // Use selected size instead of selectedColor
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

  const calculateDiscount = () => {
    if (!product) return 0
    return Math.round(((product.mrp - product.price) / product.mrp) * 100)
  }

  const getPrimaryImage = () => {
    if (product && product.images && product.images.length > 0) {
      const primary = product.images.find(img => img.is_primary);
      return primary ? primary.url : product.images[0].url;
    }
    return '/products/product.png';
  };

  const getStarRating = (rating: number) => {
    return Math.round(rating);
  };

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
    // Determine if it's an approval issue or general not found
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
      <div className="bg-white min-h-screen text-black">
        <div className="max-w-7xl mx-auto py-16">
          {/* Main Product Section */}
          <div className="flex flex-col lg:flex-row gap-12 rounded-2xl">
            {/* Left: Images */}
            <div className="lg:w-1/2">
              {/* Main Image */}
              <div className="relative w-full bg-white rounded-xl border p-6 flex items-center justify-center">
                <Image
                  src={getPrimaryImage()}
                  alt={product.name}
                  width={400}
                  height={400}
                  className="rounded-lg object-contain"
                />
              </div>

              {/* Thumbnails */}
              {product.images && product.images.length > 0 && (
                <div className="flex overflow-x-auto gap-4 mt-4">
                  {product.images.map((img, idx) => (
                    <div key={img.public_id || idx} className="shrink-0 w-20 h-20 rounded-lg border overflow-hidden">
                      <Image
                        src={img.url}
                        alt={product.name}
                        width={80}
                        height={80}
                        className="object-cover w-full h-full"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Right: Product Info */}
            <div className="flex-1 flex flex-col gap-4">
              {/* Title + Wishlist */}
              <div className="flex items-start justify-between">
                <h1 className="text-2xl font-bold text-primary">{product.name}</h1>
                <button
                  onClick={handleWishlistToggle}
                  className="p-2 rounded-full border hover:bg-gray-100"
                >
                  <Heart
                    className={`h-6 w-6 ${
                      inWishlist ? 'fill-red-500 text-red-500' : 'text-gray-400'
                    }`}
                  />
                </button>
              </div>

              {/* Description */}
              <div className="w-[623px] justify-start text-secondary text-sm font-medium leading-tight">
                {product.description || product.srtDescription || 'No description available'}
              </div>

              {/* Star Rating */}
              <div className="flex items-center gap-1 mb-1">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-5 w-5 ${
                      i < getStarRating(product.averageRating) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'
                    }`}
                  />
                ))}
                <span className="ml-2 text-sm text-gray-500">({product.totalReviews})</span>
              </div>

              {/* Colors */}
              {product.colors && product.colors.length > 0 && (
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-sm">Color:</span>
                  <span className="text-sm">{product.colors[0]}</span>
                  <div className="flex items-center ml-4 gap-2">
                    {product.colors.map((color) => (
                      <span
                        key={color}
                        className="w-6 h-6 rounded-full border border-gray-300 shadow-inner"
                        style={{ backgroundColor: color }}
                      ></span>
                    ))}
                  </div>
                </div>
              )}

              {/* Sizes */}
              {(product.sizes && product.sizes.length > 0) && (
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-sm">Size:</span>
                  <div className="flex items-center ml-4 gap-2">
                    {product.sizes.map((size) => (
                      <button
                        key={size}
                        onClick={() => setSelectedSize(size)}
                        className={`px-3 py-1 border rounded text-sm transition-colors ${
                          selectedSize === size 
                            ? 'border-pink-500 bg-pink-50 text-pink-700' 
                            : 'border-gray-300 bg-white hover:border-gray-400'
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Price Section */}
              <div className="flex items-center flex-wrap gap-3 mt-2">
               
                <div className="justify-start text-primary text-3xl font-semibold leading-7">₹{product.price}</div>
                {product.mrp > product.price && (
                  <>
                    <span className="text-sm text-gray-400 line-through">M.R.P: ₹{product.mrp}</span>
                    <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
                      {calculateDiscount()}% OFF
                    </span>
                  </>
                )}
                {product.discount > 0 && (
                  <span className="bg-gray-200 text-gray-800 px-2 py-1 rounded text-xs font-semibold">Limited Deal</span>
                )}
                
              </div>

              {/* Shipping Note */}
              <p className="text-xs font-semibold text-pink-600">
                Note: We offer worldwide shipping for all orders.
              </p>
              <p className="text-sm text-gray-600">
                Delivery expected within the next 3-4 business days
              </p>

              {/* Buttons */}
              <div className="flex gap-4 mt-4">
                <button
                  onClick={handleAddToCart}
                  disabled={!product.available}
                  className="bg-pink-500 text-white px-8 py-3 rounded font-semibold hover:bg-pink-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {product.available ? 'Add to Cart' : 'Out of Stock'}
                </button>
                {product.available && (
                  <button className="bg-white border border-pink-500 text-pink-500 px-8 py-3 rounded font-semibold hover:bg-pink-50 transition">
                    Buy Now
                  </button>
                )}
              </div>

              {/* Product Details */}
              {product.productDetails && (
                <div className="grid grid-cols-2 gap-4 text-sm mt-4">
                  {product.productDetails.weight && (
                    <div>
                      <span className="text-primary">Product Weight</span>
                      <br />
                      <span className="font-semibold text-secondary">{product.productDetails.weight}</span>
                    </div>
                  )}
                  {product.productDetails.dimensions && (
                    <div>
                      <span className="text-primary">Dimensions</span>
                      <br />
                      <span className="font-semibold text-secondary">{product.productDetails.dimensions}</span>
                    </div>
                  )}
                  {product.productDetails.capacity && (
                    <div>
                      <span className="text-primary">Capacity</span>
                      <br />
                      <span className="font-semibold text-secondary">{product.productDetails.capacity}</span>
                    </div>
                  )}
                  {product.productDetails.materials && (
                    <div>
                      <span className="text-primary">Materials</span>
                      <br />
                      <span className="font-semibold text-secondary">{product.productDetails.materials}</span>
                    </div>
                  )}
                </div>
              )}

              <div className="text-xs text-gray-600 mt-4">
                Enjoy a worry-free shopping experience. <br />
                <span className="inline-flex items-center gap-1 border px-2 py-1 rounded text-gray-800 mt-1 text-xs">
                  🛡 5 days Return & Exchange
                </span>
              </div>
            </div>
          </div>

          {/* Similar Products */}
          {similarProducts.length > 0 ? (
            <div className="mt-16">
              <h2 className="text-xl font-bold mb-4">Similar Products</h2>
              <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 overflow-x-auto pb-2">
                {similarProducts.map((item) => (
                  <div key={item._id} className="">
                    <ProductCard product={item} />
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="mt-16">
              <h2 className="text-xl font-bold mb-4">Similar Products</h2>
              <div className="text-center py-8 text-gray-500">
                <p>No similar products found at the moment.</p>
                <p className="text-sm mt-2">Check back later for more products in this category.</p>
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
                // TODO: Implement actual edit review API call
                toast.success('Review updated successfully!');
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