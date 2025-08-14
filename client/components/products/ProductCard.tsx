import React, { useState } from 'react';
import Image from 'next/image';
import { Star, Heart } from 'lucide-react';
import Link from 'next/link';
import { useSelector, useDispatch } from 'react-redux';
import { addCartItem, fetchCart } from '@/features/cart/cartSlice';
import { addToWishlist, removeFromWishlist } from '@/features/user/userSlice';
import { AppDispatch, RootState } from '@/store/store';
import { toast } from 'sonner';

interface Product {
  _id: string;
  name: string;
  price: number;
  mrp?: number;
  available: boolean; // Changed from string to boolean
  stock?: number;
  variant?: boolean;
  variantDetails?: Array<{ stock: number }>;
  colors?: string[];
  sizes?: string[]; // Added sizes field
  currVariantSize?: string;
  images?: Array<{ url: string; is_primary?: boolean }>;
  averageRating?: number;
  totalReviews?: number;
  files?: string[];
}

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { wishlist } = useSelector((state: RootState) => state.user);
  const isInWishlist = wishlist ? wishlist.includes(product._id) : false;
  const [selectedColor, setSelectedColor] = useState<string | null>(
    product.colors ? product.colors[0] : null
  );

  const resolvedSize = React.useMemo(() => {
    if (product.sizes && product.sizes.length > 0) {
      return product.sizes[0];
    }
    if (product.currVariantSize) {
      return product.currVariantSize;
    }
    return 'M';
  }, [product.sizes, product.currVariantSize]);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    
    if (!product || !product._id) {
      toast.error('Product not available');
      return;
    }

    if (!product.available || stock <= 0) {
      toast.error('Product is not available');
      return;
    }

    dispatch(addCartItem({
      product,
      quantity: 1,
      variantSize: resolvedSize
    })).then(() => {
      // Refresh cart to ensure UI is updated immediately
      dispatch(fetchCart());
    }).catch((error) => {
      console.error('Failed to add to cart:', error);
      toast.error('Failed to add to cart');
    });
  };

  const handleWishlistToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    
    if (!product || !product._id) {
      toast.error('Product not available');
      return;
    }

    if (isInWishlist) {
      dispatch(removeFromWishlist(product._id));
    } else {
      dispatch(addToWishlist(product._id));
    }
  };

  const stock = product.variant
    ? product.variantDetails?.reduce((acc, v) => acc + v.stock, 0) || 0
    : product.stock || 0;

  // Get the primary image (is_primary: true) or fallback to first image
  const getPrimaryImage = () => {
    if (product.images && product.images.length > 0) {
      const primary = product.images.find(img => img.is_primary);
      return primary ? primary.url : product.images[0].url;
    }
    return '/products/product.png';
  };

  // Default colors for the bag from the image description
  const defaultColors = ['#FF69B4', '#000000', '#8B4513', '#006400', '#FF8C00', '#808000'];

  return (
    <div className=" bg-white rounded-2xl p-2 sm:p-4 h-full flex flex-col gap-2 sm:gap-3 w-full lg:max-w-[320px]">
      <Link href={`/products/${product._id}`} className="block flex-1 ">
        {/* Product Image Container */}
        <div className="relative  w-full aspect-[4/3] rounded-xl bg-[#FFFBF8] overflow-hidden">
          <Image
            src={getPrimaryImage()}
            alt={product.name}
            fill
            className="object-contain p-2 sm:p-4"
            onError={(e) => {
              e.currentTarget.src = '/products/product.png';
            }}
          />

          {/* Stock Badge */}
          {stock > 0 && stock <= 5 && (
            <div className="absolute top-2 left-2 bg-[#FF4E8D] text-white px-2 py-0.5 text-[10px] sm:text-xs font-medium rounded">
              Only {stock} left
            </div>
          )}

          {/* Wishlist Heart Icon */}
          <button
            onClick={handleWishlistToggle}
            className="absolute bg-[#FFF4EC] p-1.5 rounded-full top-2 right-2 border border-[#E7D9CC] z-10"
            aria-label="Add to wishlist"
          >
            <Heart
              className={`h-4 w-4 sm:h-5 sm:w-5 ${isInWishlist ? ' fill-[#FF4E8D] text-[#EE346C]' : 'text-[#EE346C]'}`}
            />
          </button>
        </div>
      </Link>

      {/* Product Details */}
      <div className="flex flex-col gap-1 sm:gap-2">
        {/* Product Name */}
        <h3 className="sm:text-base   font-semibold  text-[#6c4323] line-clamp-1 sm:line-clamp-none">
          {product.name}
        </h3>

        {/* Color Swatches */}
        <div className="flex gap-2 items-center">
          {(product.colors || defaultColors).slice(0, 6).map((color) => (
            <div
              key={color}
            >
              <button
              style={{ backgroundColor: color }}
              className={`w-2.5 h-2.5 sm:w-4 sm:h-4  rounded-full transition-transform duration-150 focus:outline-none focus:ring-1 focus:ring-offset-2 ${
                selectedColor === color ? 'ring-1 ring-secondary ring-offset-2 scale-105' : 'hover:scale-105'
              }`}
                onClick={() => setSelectedColor(color)}
                aria-label={`Select color ${color}`}
              />
            </div>
          ))}
        </div>

        {/* Rating */}
        <div className="flex items-center">
          <div className="flex text-yellow-400 text-xs sm:text-sm  items-center">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`h-3 w-3 sm:h-4 sm:w-4 ${
                  i < Math.floor(product.averageRating || 4.5)
                    ? 'fill-current'
                    : 'text-gray-300'
                }`}
              />
            ))}
          </div>
          <span className="text-gray-600 ml-1 text-xs sm:text-sm">
            ({product.totalReviews || 745})
          </span>
        </div>

        {/* Price and Add to Cart */}
        <div className="flex items-center justify-between mt-1">
          <span className="text-sm sm:text-base font-bold text-[#6c4323]">₹ {product.price.toLocaleString('en-IN')}</span>
          <button
            onClick={handleAddToCart}
            disabled={!product.available || stock <= 0}
            className={`text-[#FF4E8D] text-xs sm:text-sm font-medium border border-[#FF4E8D] px-3 py-2 rounded-lg transition-colors sm:hidden ${(!product.available || stock <= 0) ? 'opacity-50 cursor-not-allowed' : 'hover:bg-[#FF4E8D] hover:text-white'}`}
          >
            Add to cart
          </button>
        </div>

        {/* sm+ full-width Add button */}
        <button
          onClick={handleAddToCart}
          disabled={!product.available || stock <= 0}
          className={`hidden sm:block w-full text-[#FF4E8D] border border-[#FF4E8D] py-3 rounded-lg font-semibold transition-colors ${(!product.available || stock <= 0) ? 'opacity-50 cursor-not-allowed' : 'hover:bg-[#FF4E8D] hover:text-white'}`}
        >
          Add to cart
        </button>
      </div>
    </div>
  );
};

export default ProductCard;