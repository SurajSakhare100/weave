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
  Loader2
} from 'lucide-react'
import { Product } from '@/types'
import ProductCard from '@/components/products/ProductCard'
import MainLayout from '@/components/layout/MainLayout'
import Image from 'next/image'
import { toast } from 'sonner'
import ReviewForm from '@/components/reviews/ReviewForm';
import ReviewList from '@/components/reviews/ReviewList';
import ReviewSummary from '@/components/reviews/ReviewSummary';
import { Review } from '@/services/reviewService'
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogCancel,
} from '@/components/ui/alert-dialog';

// Add this type above ProductWithReviews
interface ProductImage {
  url: string;
  public_id: string;
  is_primary?: boolean;
  [key: string]: unknown;
}

// Fix ProductWithReviews type
declare interface ProductWithReviews extends Product {
  images: ProductImage[];
  reviews: Array<{
    name: string;
    rating: number;
    text: string;
    date: string;
  }>;
}

// Dummy data for sections not yet implemented in backend
const dummyFrequentlyBought = [
  {
    _id: '1',
    name: 'Bag name',
    price: 1999,
    mrp: 1999,
    colors: ['#D93B65', '#1E1E1E', '#7B5B4D', '#4D7B6B', '#C76A3D', '#6B7B4D'],
    files: ['product.png'], // Use local static image
    averageRating: 5,
    totalReviews: 745,
    slug: 'bag-1',
    available: 'true',
    stock: 10,
    // Add all required ProductWithReviews fields with dummy values
    reviews: [],
    discount: 0,
    vendorId: '',
    vendor: {},
    description: '',
    pickup_location: '',
    return: true,
    cancellation: true,
    category: 'Tote',
    variant: [],
    variantDetails: [],
    createdAt: '',
    updatedAt: '',
    __v: 0,
    status: '', // Add status property for type compatibility
    // Add any other required fields as needed
  },
  { _id: '2', name: 'Bag name', price: 1999, mrp: 1999, colors: ['#D93B65', '#1E1E1E', '#7B5B4D', '#4D7B6B', '#C76A3D', '#6B7B4D'], files: ['image.png'], averageRating: 5, totalReviews: 745, slug: 'bag-2', available: 'true', stock: 10 },
  { _id: '3', name: 'Bag name', price: 1999, mrp: 1999, colors: ['#D93B65', '#1E1E1E', '#7B5B4D', '#4D7B6B', '#C76A3D', '#6B7B4D'], files: ['image.png'], averageRating: 5, totalReviews: 745, slug: 'bag-3', available: 'true', stock: 10 },
  { _id: '4', name: 'Bag name', price: 1999, mrp: 1999, colors: ['#D93B65', '#1E1E1E', '#7B5B4D', '#4D7B6B', '#C76A3D', '#6B7B4D'], files: ['image.png'], averageRating: 5, totalReviews: 745, slug: 'bag-4', available: 'true', stock: 10 },
];
const dummyCompare = dummyFrequentlyBought;

const dummyProductDetails = [
  { label: 'Product Weight', value: '500grams' },
  { label: 'Dimensions', value: '12.5"W x 8"D x 12"H' },
  { label: 'Capacity', value: '12 Litre' },
  { label: 'Materials', value: 'Sisal Fibres' },
  { label: 'Product Category', value: 'Tote' },
];

export default function ProductDetailPage() {
  const router = useRouter()
  const { id } = router.query
  const dispatch = useDispatch<AppDispatch>()
  
  const [product, setProduct] = useState<ProductWithReviews | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [quantity] = useState(1)
  const [selectedColor, setSelectedColor] = useState<string | null>(null)
  const [showReviewForm, setShowReviewForm] = useState(false)

  const { wishlist, isAuthenticated } = useSelector((state: RootState) => state.user)
  const inWishlist = product && wishlist.includes(product._id)

  const loadProduct = useCallback(async () => {
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
      setSelectedColor(productData.colors ? productData.colors[0] : null)
      
      // Load similar products
      try {
        const similarResponse = await getSimilarProducts(id as string)
        if (similarResponse.success === false) {
          console.warn('Failed to load similar products:', similarResponse.message)
        }
      } catch (similarError: unknown) {
        console.error('Failed to load similar products:', similarError)
      }
    } catch (error: unknown) {
      console.error('Product loading error:', error)
      
      // Handle specific error cases
      type ProductLoadError = { error?: string; response?: { status?: number; data?: { message?: string } } };
      const err: ProductLoadError = error as ProductLoadError;
      if (err.error === 'NETWORK_ERROR') {
        setError('Server is currently unavailable. Please try again later.')
        toast.error('Server is currently unavailable. Please try again later.')
      } else if (err.response?.status === 404) {
        setError('Product not found')
        toast.error('Product not found')
      } else {
        setError(err.response?.data?.message || 'Failed to load product')
        toast.error(err.response?.data?.message || 'Failed to load product')
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
    if (product) {
      try {
        await dispatch(addCartItem({
          product,
          quantity,
          variantSize: selectedColor || product.currVariantSize || ''
        })).unwrap()
        // Show success message or update UI
      } catch (error) {
        console.error('Failed to add to cart:', error)
        // Handle error - could show a toast notification
      }
    }
  }

  const handleWishlistToggle = () => {
    if (!isAuthenticated) {
      router.push(`/login?redirect=/products/${id}`);
      return;
    }
    if (product) {
      if (inWishlist) {
        dispatch(removeFromWishlist(product._id))
      } else {
        dispatch(addToWishlist(product._id))
      }
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
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Product Not Found</h2>
          <p className="text-gray-600 mb-4">{error || 'The product you are looking for does not exist.'}</p>
          <Link 
            href="/products" 
            className="bg-pink-500 text-white px-6 py-2 rounded-lg hover:bg-pink-600 transition-colors"
          >
            Browse Products
          </Link>
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

   <div className="w-[623px] justify-start text-secondary text-sm font-medium leading-tight">Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley </div>
    {/* Star Rating */}
    <div className="flex items-center gap-1 mb-1">
      {[...Array(5)].map((_, i) => (
        <Star
          key={i}
          className={`h-5 w-5 ${
            i < 4 ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'
          }`}
        />
      ))}
      <span className="ml-2 text-sm text-gray-500">(874)</span>
    </div>

    {/* Colors */}
    <div className="flex items-center gap-2">
      <span className="font-semibold text-sm">Color:</span>
      <span className="text-sm">Orange</span>
      <div className="flex items-center ml-4 gap-2">
        {product.colors?.map((color) => (
          <span
            key={color}
            className="w-6 h-6 rounded-full border border-gray-300 shadow-inner"
            style={{ backgroundColor: color }}
          ></span>
        ))}
      </div>
    </div>

    {/* Price Section */}
    <div className="flex items-center flex-wrap gap-3 mt-2">
      <div className="justify-start text-[#B04848] text-3xl font-normal leading-loose">-40%</div>
      <div className="justify-start text-primary text-3xl font-semibold leading-7">₹{product.price}</div>
      {/* <span className="text-2xl font-bold text-black">₹{product.price}</span> */}
      <span className="bg-gray-200 text-gray-800 px-2 py-1 rounded text-xs font-semibold">Limited Deal</span>
      {product.mrp > product.price && (
        <>
          <span className="text-sm text-gray-400 line-through">M.R.P: ₹{product.mrp}</span>
          <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
            {calculateDiscount()}% OFF
          </span>
        </>
      )}
    </div>

    {/* Shipping Note */}
    <p className="text-xs font-semibold text-pink-600">
      Note: We offer worldwide shipping for all orders.
    </p>
    <p className="text-sm text-gray-600">
      Delivery expected within the next 3–4 business days, to 📍416734
    </p>

    {/* Buttons */}
    <div className="flex gap-4 mt-4">
      <button
        onClick={handleAddToCart}
        disabled={product.available !== 'true'}
        className="bg-pink-500 text-white px-8 py-3 rounded font-semibold hover:bg-pink-600 transition"
      >
        Add to Cart
      </button>
      <button className="bg-white border border-pink-500 text-pink-500 px-8 py-3 rounded font-semibold hover:bg-pink-50 transition">
        Buy Now
      </button>
    </div>

    {/* Product Details */}
    <div className="grid grid-cols-2 gap-4 text-sm mt-4">
      {dummyProductDetails.map((detail) => (
        <div key={detail.label}>
          <span className="text-primary">{detail.label}</span>
          <br />
          <span className="font-semibold text-secondary">{detail.value}</span>
        </div>
      ))}
    </div>

    <div className="text-xs text-gray-600 mt-4">
      Enjoy a worry-free shopping experience. <br />
      <span className="inline-flex items-center gap-1 border px-2 py-1 rounded text-gray-800 mt-1 text-xs">
        🛡 5 days Return & Exchange
      </span>
    </div>
  </div>
</div>


        {/* Frequently Bought Together */}
        <div className="mt-16">
          <h2 className="text-xl font-bold mb-4">Frequently Bought Together</h2>
          <div className="flex gap-6 overflow-x-auto pb-2">
            {dummyFrequentlyBought.map((item) => (
              <div key={item._id} className="min-w-[250px] max-w-[250px]">
                <ProductCard product={item as unknown as Product} />
              </div>
            ))}
          </div>
        </div>

        {/* Compare With Similar Items */}
        <div className="mt-16">
          <h2 className="text-xl font-bold mb-4">Compare With Similar Items</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white rounded-xl shadow">
              <thead>
                <tr>
                  <th className="p-4 text-left">Bag Image</th>
                  <th className="p-4 text-left">Bag name</th>
                  <th className="p-4 text-left">Color</th>
                  <th className="p-4 text-left">Reviews</th>
                  <th className="p-4 text-left">Price</th>
                  <th className="p-4 text-left">Shipping</th>
                </tr>
              </thead>
              <tbody>
                {dummyCompare.map((item) => (
                  <tr key={item._id} className="border-t">
                    <td className="p-4"><Image src="/products/image.png" alt="Bag" width={80} height={80} className="object-cover rounded" /></td>
                    <td className="p-4 font-semibold">Bag name</td>
                    <td className="p-4">
                      <div className="flex gap-1">
                        {item.colors.map((color) => (
                          <span key={color} className="w-5 h-5 rounded-full border" style={{ backgroundColor: color }}></span>
                        ))}
                      </div>
                    </td>
                    <td className="p-4 flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className={`h-4 w-4 ${i < 4 ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} />
                      ))}
                      <span className="ml-2 text-gray-600 text-xs">(745)</span>
                    </td>
                    <td className="p-4 font-bold">₹1,999</td>
                    <td className="p-4 text-xs">Free Delivery on orders over 999</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Review Section */}
        <div className="mt-16">
          {/* Review Call-to-Action */}
          <div className="bg-gradient-to-r from-pink-50 to-purple-50 rounded-xl p-6 mb-8 border border-pink-100">
            <div className="flex flex-col md:flex-row items-center justify-between">
              <div className="text-center md:text-left mb-4 md:mb-0">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Share Your Experience
                </h3>
                <p className="text-gray-600">
                  Help other customers by sharing your thoughts about this product
                </p>
              </div>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  {isAuthenticated ? (
                    <button
                      className="px-6 py-3 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors flex items-center space-x-2 font-medium shadow-md hover:shadow-lg"
                    >
                      <Star className="h-5 w-5" />
                      <span>Write a Review</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => router.push(`/login?redirect=/products/${id}`)}
                      className="px-6 py-3 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors flex items-center space-x-2 font-medium shadow-md hover:shadow-lg"
                    >
                      <Star className="h-5 w-5" />
                      <span>Login to Review</span>
                    </button>
                  )}
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <ReviewForm
                    productId={product._id}
                    onReviewSubmitted={() => {
                      window.location.reload();
                    }}
                    onCancel={() => {
                      // Close dialog via AlertDialogCancel
                    }}
                  />
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>

          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold">Customer Reviews</h2>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                {isAuthenticated ? (
                  <button
                    className="px-6 py-3 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors flex items-center space-x-2 font-medium shadow-md hover:shadow-lg"
                  >
                    <Star className="h-5 w-5" />
                    <span>Write a Review</span>
                  </button>
                ) : (
                  <button
                    onClick={() => router.push(`/login?redirect=/products/${id}`)}
                    className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center space-x-2 font-medium"
                  >
                    <Star className="h-5 w-5" />
                    <span>Login to Review</span>
                  </button>
                )}
              </AlertDialogTrigger>
              <AlertDialogContent>
                <ReviewForm
                  productId={product._id}
                  onReviewSubmitted={() => {
                    window.location.reload();
                  }}
                  onCancel={() => {
                    // Close dialog via AlertDialogCancel
                  }}
                />
                <AlertDialogCancel>Cancel</AlertDialogCancel>
              </AlertDialogContent>
            </AlertDialog>
          </div>

          {/* Review Summary */}
          <ReviewSummary
            totalReviews={product.totalReviews}
            averageRating={product.averageRating}
            ratingDistribution={[]} // Will be populated from API
          />

          {/* Review List */}
          <div className="mt-8">
            <ReviewList
              reviews={
                (product.reviews as any[]).map((review) => ({
                  ...review,
                  userId: {
                    name: review.userId?.name ?? '',
                    email: review.userId?.email ?? '',
                  },
                }))
              }
              onResponse={() => {
                window.location.reload();
              }}
              onEdit={() => {
                window.location.reload();
              }}
              onDelete={() => {
                window.location.reload();
              }}
            />
          </div>
        </div>
      </div>
      </div>
    </MainLayout>
  )
} 