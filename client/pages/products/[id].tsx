import { useRouter } from 'next/router'
import { useEffect, useState, useCallback, useMemo } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import Image from 'next/image'
import { addCartItem } from '../../features/cart/cartSlice'
import { addToWishlist, removeFromWishlist } from '../../features/user/userSlice'
import { RootState, AppDispatch } from '../../store/store'
import { getProductById, getSimilarProducts, getFrequentlyBoughtTogether, getComparableProducts } from '../../services/productService'
import { 
  AlertCircle,
  Loader2,
  Clock,
  X
} from 'lucide-react'
import FullPageLoader from '@/components/ui/FullPageLoader'
import { Product, ProductWithReviews } from '@/types'
import ProductCard from '@/components/products/ProductCard'
import ProductDetails from '@/components/products/ProductDetails'
import MainLayout from '@/components/layout/MainLayout'
import { toast } from 'sonner'
import ReviewForm from '@/components/reviews/ReviewForm';
import ReviewSection from '@/components/reviews/ReviewSection';
import { fetchCart } from '../../features/cart/cartSlice';
import Link from 'next/link'
import ComparisonTable from '@/components/products/ComparisonTable'

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
  const [compareProducts, setCompareProducts] = useState<(Product | ProductWithReviews)[]>([])
  const [showCompareModal, setShowCompareModal] = useState(false)

  // Add state for selected color
  const [selectedColor, setSelectedColor] = useState<string | null>(null);

  // Get all available colors (from product.colors and colorImages keys)
  const availableColors = useMemo(() => {
    if (!product) return [];

    const colorsFromField = product.colors || [];
    const colorsFromImages = product.colorImages ? Object.keys(product.colorImages) : [];

    // Combine and deduplicate colors
    const allColors = [...new Set([...colorsFromField, ...colorsFromImages])];

    return allColors;
  }, [product]);

  // Modify image display to use color-specific images
  const displayImages = useMemo(() => {
    // If no color selected, use default images
    if (!selectedColor) {
      return product?.images || [];
    }

    // Find color-specific images
    const colorImages = product?.colorImages?.[selectedColor] || [];

    // If no color-specific images, fallback to default images
    return colorImages.length > 0 ? colorImages : (product?.images || []);
  }, [product, selectedColor]);

  // Update image gallery to use displayImages
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

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

  const handleCompare = () => {
    if (!product) {
      toast.error('Product not available');
      return;
    }
    
    // Add current product to compare list if not already added
    if (!compareProducts.find(p => p._id === product._id)) {
      setCompareProducts(prev => [...prev, product]);
    }
    
    setShowCompareModal(true);
  }

  const handleNextProduct = () => {
    if (similarProducts.length === 0) {
      toast.info('No similar products available');
      return;
    }
    
    const currentIndex = similarProducts.findIndex(p => p._id === product?._id);
    // If current product is not in similar products, start from beginning
    const nextIndex = currentIndex === -1 ? 0 : (currentIndex + 1) % similarProducts.length;
    
    const nextProduct = similarProducts[nextIndex];
    if (nextProduct && nextProduct._id) {
      router.push(`/products/${nextProduct._id}`);
    } else {
      toast.error('Unable to navigate to next product');
    }
  }

  const handlePreviousProduct = () => {
    if (similarProducts.length === 0) {
      toast.info('No similar products available');
      return;
    }
    
    const currentIndex = similarProducts.findIndex(p => p._id === product?._id);
    // If current product is not in similar products, start from end
    const prevIndex = currentIndex === -1 
      ? similarProducts.length - 1 
      : currentIndex === 0 
        ? similarProducts.length - 1 
        : currentIndex - 1;
    
    const prevProduct = similarProducts[prevIndex];
    if (prevProduct && prevProduct._id) {
      router.push(`/products/${prevProduct._id}`);
    } else {
      toast.error('Unable to navigate to previous product');
    }
  }

  if (loading) return <FullPageLoader text="Loading product..." />

  if (error || !product) {
    const isApprovalIssue = error && (
      error.includes('pending approval') ||
      error.includes('not available') ||
      error === 'This product is not available or has been removed.'
    );
    
    const isPendingApproval = error && error.includes('pending approval');

    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center  mx-auto px-4">
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
        <div className=" mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Main Product Section */}
          <ProductDetails
            product={product}
            inWishlist={inWishlist}
            onWishlistToggle={handleWishlistToggle}
            onAddToCart={handleAddToCart}
            onCompare={handleCompare}
            onNext={similarProducts.length > 0 ? handleNextProduct : undefined}
            onPrevious={similarProducts.length > 0 ? handlePreviousProduct : undefined}
          />

          {/* Color Selection */}
          {availableColors.length > 0 && (
            <div className="mb-4">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Available Colors</h3>
              <div className="flex gap-2">
                {availableColors.map(color => (
                  <button
                    key={color}
                    onClick={() => setSelectedColor(selectedColor === color ? null : color)}
                    className={`w-8 h-8 rounded-full border-2 ${
                      selectedColor === color
                        ? 'border-primary scale-110'
                        : 'border-gray-300 hover:border-primary'
                    }`}
                    style={{
                      backgroundColor: color.toLowerCase(),
                      filter: ['white', 'beige', 'tan', 'yellow'].includes(color.toLowerCase())
                        ? 'brightness(0.9)'
                        : 'none'
                    }}
                    title={color}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Image Gallery */}
          <div className="grid grid-cols-4 gap-4">
            {displayImages.map((image, index) => (
              <div
                key={image.url || index}
                className={`relative aspect-square cursor-pointer ${
                  selectedImage === image.url ? 'border-2 border-primary' : ''
                }`}
                onClick={() => setSelectedImage(image.url)}
              >
                <Image
                  src={image.url || '/products/product.png'}
                  alt={`Product image ${index + 1}`}
                  fill
                  className="object-cover rounded"
                />
              </div>
            ))}
          </div>

          {/* Frequently Bought Together */}
          {frequentlyBought.length > 0 && (
            <div className="mt-16">
              <h2 className="text-xl font-medium text-[#5E3A1C] mb-6">Frequently Bought Together</h2>
              <div className="flex flex-row overflow-x-auto gap-4">
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
              <div className="w-full flex flex-row  overflow-x-auto gap-4">
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
              <div className="w-full flex flex-row  overflow-x-auto gap-4">
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

          {/* Compare Modal */}
          {showCompareModal && (
            <div className=" fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            
             {/* overlay */}
            
              <div className="bg-white rounded-xl max-w-7xl w-full max-h-[90vh] overflow-y-auto">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-[#5E3A1C]">Compare With Similar Items</h2>
                    <button
                      onClick={() => setShowCompareModal(false)}
                      className="text-gray-500 hover:text-gray-700 text-2xl"
                    >
                      <X className="h-8 w-8 text-pink-500" />
                    </button>
                  </div>

                  {/* Add Products to Compare */}
                  {compareProducts.length < 4 && comparableProducts.length > 0 && (
                    <div className="mb-6">
                      <h3 className="text-lg font-medium text-[#5E3A1C] mb-4">
                        Add products to compare ({compareProducts.length}/4)
                      </h3>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {comparableProducts
                          .filter(item => !compareProducts.find(p => p._id === item._id))
                          .slice(0, 4 - compareProducts.length)
                          .map((item) => (
                          <div key={item._id} className="border rounded-lg p-3 bg-gray-50">
                            <div className="relative aspect-square w-full mb-2">
                              <Image
                                src={item.images?.[0]?.url || '/products/product.png'}
                                alt={item.name}
                                fill
                                className="object-contain rounded"
                              />
                            </div>
                            <h4 className="text-sm font-medium text-[#5E3A1C] mb-2 line-clamp-2">
                              {item.name}
                            </h4>
                            <button
                              onClick={() => {
                                if (compareProducts.length < 4) {
                                  setCompareProducts(prev => [...prev, item]);
                                }
                              }}
                              className="w-full px-3 py-1 text-sm bg-[#EE346C] text-white rounded hover:bg-[#D62A5A] transition-colors"
                            >
                              Add to Compare
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Comparison Table */}
                  <ComparisonTable
                    products={compareProducts}
                    onRemoveProduct={(productId) => {
                      setCompareProducts(prev => prev.filter(p => p._id !== productId));
                    }}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  )
}