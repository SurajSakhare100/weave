import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { addItem } from '../../features/cart/cartSlice'
import { addToWishlist, removeFromWishlist } from '../../features/user/userSlice'
import { RootState } from '../../store/store'
import { getProductById, getSimilarProducts } from '../../services/productService'
import Link from 'next/link'
import { 
  Heart, 
  ShoppingCart, 
  Star, 
  Package, 
  Truck, 
  RotateCcw,
  AlertCircle,
  Loader2
} from 'lucide-react'

// Product interface
interface Product {
  _id: string
  name: string
  slug: string
  price: number
  mrp: number
  discount: number
  vendorId: string
  vendor: boolean
  available: string
  category: string
  categorySlug?: string
  srtDescription?: string
  description?: string
  seoDescription?: string
  seoKeyword?: string
  seoTitle?: string
  pickup_location?: string
  return: boolean
  cancellation: boolean
  uni_id_1?: string
  uni_id_2?: string
  files: string[]
  variant: boolean
  variantDetails: Array<{
    size: string
    price: number
    mrp: number
    stock: number
  }>
  currVariantSize?: string
  createdAt: string
  updatedAt: string
}

export default function ProductDetailPage() {
  const router = useRouter()
  const { id } = router.query
  const dispatch = useDispatch()
  
  const [product, setProduct] = useState<Product | null>(null)
  const [similarProducts, setSimilarProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedImage, setSelectedImage] = useState(0)
  const [quantity, setQuantity] = useState(1)

  const wishlist = useSelector((state: RootState) => state.user.wishlist)
  const inWishlist = product && wishlist.includes(product._id)

  useEffect(() => {
    if (id) {
      loadProduct()
    }
  }, [id])

  const loadProduct = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await getProductById(id as string)
      const productData = response.data
      setProduct(productData)
      
      // Load similar products
      try {
        const similarResponse = await getSimilarProducts(id as string)
        setSimilarProducts(similarResponse.data || [])
      } catch (similarError) {
        console.error('Failed to load similar products:', similarError)
        setSimilarProducts([])
      }
    } catch (error: any) {
      setError(error.response?.data?.message || 'Failed to load product')
    } finally {
      setLoading(false)
    }
  }

  const getImageUrl = (files: string[], index: number = 0) => {
    if (files && files.length > index) {
      return `http://localhost:5000/uploads/${files[index]}`
    }
    return '/products/product.png'
  }

  const handleAddToCart = () => {
    if (product) {
      dispatch(addItem({ 
        ...product, 
        quantity,
        id: product._id // Ensure cart uses _id
      }))
    }
  }

  const handleWishlistToggle = () => {
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
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="mb-8">
          <ol className="flex items-center space-x-2 text-sm text-gray-500">
            <li><Link href="/" className="hover:text-pink-500">Home</Link></li>
            <li>/</li>
            <li><Link href="/products" className="hover:text-pink-500">Products</Link></li>
            <li>/</li>
            <li className="text-gray-900">{product.name}</li>
          </ol>
        </nav>

        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-8">
            {/* Product Images */}
            <div className="space-y-4">
              <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                <img
                  src={getImageUrl(product.files, selectedImage)}
                  alt={product.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.src = '/products/product.png'
                  }}
                />
              </div>
              
              {/* Thumbnail Images */}
              {product.files && product.files.length > 1 && (
                <div className="flex space-x-2">
                  {product.files.map((file, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImage(index)}
                      className={`w-16 h-16 rounded-lg overflow-hidden border-2 ${
                        selectedImage === index ? 'border-pink-500' : 'border-gray-200'
                      }`}
                    >
                      <img
                        src={getImageUrl(product.files, index)}
                        alt={`${product.name} ${index + 1}`}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.src = '/products/product.png'
                        }}
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Product Info */}
            <div className="space-y-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{product.name}</h1>
                <p className="text-gray-600">{product.category}</p>
              </div>

              {/* Price */}
              <div className="space-y-2">
                <div className="flex items-center space-x-3">
                  <span className="text-3xl font-bold text-gray-900">₹{product.price}</span>
                  {product.mrp > product.price && (
                    <>
                      <span className="text-xl text-gray-500 line-through">₹{product.mrp}</span>
                      <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-sm font-medium">
                        {calculateDiscount()}% OFF
                      </span>
                    </>
                  )}
                </div>
                {product.discount > 0 && (
                  <p className="text-sm text-gray-600">Discount: {product.discount}%</p>
                )}
              </div>

              {/* Description */}
              {product.description && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Description</h3>
                  <p className="text-gray-600 leading-relaxed">{product.description}</p>
                </div>
              )}

              {/* Pickup Location */}
              {product.pickup_location && (
                <div className="flex items-center space-x-2 text-gray-600">
                  <Package className="h-5 w-5" />
                  <span>Pickup: {product.pickup_location}</span>
                </div>
              )}

              {/* Policies */}
              <div className="space-y-2">
                {product.return && (
                  <div className="flex items-center space-x-2 text-gray-600">
                    <RotateCcw className="h-5 w-5" />
                    <span>Returns accepted</span>
                  </div>
                )}
                {product.cancellation && (
                  <div className="flex items-center space-x-2 text-gray-600">
                    <Truck className="h-5 w-5" />
                    <span>Cancellation allowed</span>
                  </div>
                )}
              </div>

              {/* Quantity */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Quantity</label>
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-8 h-8 rounded-lg border border-gray-300 flex items-center justify-center hover:bg-gray-50"
                  >
                    -
                  </button>
                  <span className="w-12 text-center">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-8 h-8 rounded-lg border border-gray-300 flex items-center justify-center hover:bg-gray-50"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Actions */}
              <div className="flex space-x-4">
                <button
                  onClick={handleAddToCart}
                  disabled={product.available !== 'true'}
                  className="flex-1 bg-pink-500 text-white py-3 px-6 rounded-lg hover:bg-pink-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                >
                  <ShoppingCart className="h-5 w-5" />
                  <span>Add to Cart</span>
                </button>
                <button
                  onClick={handleWishlistToggle}
                  className="p-3 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center justify-center"
                >
                  <Heart className={`h-5 w-5 ${inWishlist ? 'fill-red-500 text-red-500' : 'text-gray-400'}`} />
                </button>
              </div>

              {/* Status */}
              <div className="flex items-center space-x-2">
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                  product.available === 'true' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {product.available === 'true' ? 'In Stock' : 'Out of Stock'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Similar Products */}
        {similarProducts.length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Similar Products</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {similarProducts.map((similarProduct) => (
                <Link 
                  key={similarProduct._id} 
                  href={`/products/${similarProduct._id}`}
                  className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow"
                >
                  <div className="aspect-square bg-gray-100">
                    <img
                      src={getImageUrl(similarProduct.files)}
                      alt={similarProduct.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.src = '/products/product.png'
                      }}
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-900 mb-1 line-clamp-2">{similarProduct.name}</h3>
                    <p className="text-sm text-gray-600 mb-2">{similarProduct.category}</p>
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-gray-900">₹{similarProduct.price}</span>
                      {similarProduct.mrp > similarProduct.price && (
                        <span className="text-sm text-gray-500 line-through">₹{similarProduct.mrp}</span>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
} 