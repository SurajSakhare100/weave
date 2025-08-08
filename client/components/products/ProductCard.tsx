import React, { useState } from 'react';
import Image from 'next/image';
import { Star, Heart, ShoppingCart } from 'lucide-react';
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

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    
    if (!product || !product._id) {
      toast.error('Product not available');
      return;
    }

    if (!product.available) {
      toast.error('Product is not available');
      return;
    }

    let selectedSize = 'M';
    if (selectedColor && product.sizes && product.sizes.includes(selectedColor)) {
      selectedSize = selectedColor;
    } else if (product.sizes && product.sizes.length > 0) {
      selectedSize = product.sizes[0];
    } else if (product.currVariantSize) {
      selectedSize = product.currVariantSize;
    }

    dispatch(addCartItem({
      product,
      quantity: 1,
      variantSize: selectedSize
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
    <div className="group bg-white rounded-2xl p-3 sm:p-4  h-full flex flex-col gap-3 ">
      <Link href={`/products/${product._id}`} className="block flex-1 ">
        {/* Product Image Container */}
        <div className="relative aspect-4/3 rounded-xl xs:p-2 w-full bg-[#FFFBF8] overflow-hidden">
          <Image
            src={getPrimaryImage()}
            alt={product.name}
            fill
            className="object-cover aspect-4/3 rounded-2xl  sm:p-6"
            onError={(e) => {
              e.currentTarget.src = '/products/product.png';
            }}
          />

          {/* Stock Badge */}
          {stock > 0 && stock <= 5 && (
            <div className="absolute top-4 left-4 bg-[#FF4E8D] text-white px-3 py-1 text-sm xs:text-base font-normal rounded">
              Only {stock} left
            </div>
          )}

          {/* Wishlist Heart Icon */}
          <button
            onClick={handleWishlistToggle}
            className="absolute bg-[#FFF4EC] p-1.5 rounded-full top-2 right-2  z-10"
            aria-label="Add to wishlist"
          >
            <Heart
              className={`h-4 w-4 sm:h-5 sm:w-5 ${isInWishlist ? ' fill-[#FF4E8D] text-[#EE346C]' : 'text-[#EE346C]'}`}
            />
          </button>
        </div>
      </Link>

      {/* Product Details */}
      <div className="flex flex-col gap-3">
        {/* Product Name */}
        <h3 className="text-base sm:text-xl font-semibold text-[#6c4323]">
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
              className={`w-2 h-2 sm:w-4 sm:h-4  rounded-full transition-transform duration-150 focus:outline-none focus:ring-1 focus:ring-offset-2 ${
                selectedColor === color ? 'ring-1 ring-secondary ring-offset-2 scale-105' : 'hover:scale-105'
              }`}
                onClick={() => setSelectedColor(color)}
                aria-label={`Select color ${color}`}
              />
            </div>
          ))}
        </div>

        
        {/* Rating */}
        <div className='flex flex-row justify-between gap-1'>
        <span className="text-base sm:text-2xl font-bold text-[#6c4323]">₹ {product.price.toLocaleString('en-IN')}</span>
        <div className="flex items-center">
          <div className="flex text-yellow-400">
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
        </div>

        {/* Price and Add to Cart */}
        <div className="flex items-center justify-between mt-1">
          
          <button
            onClick={handleAddToCart}
            className="text-[#FF4E8D] text-xs xs:text-sm font-medium border border-[#FF4E8D] px-2 py-2 rounded-md hover:bg-[#FF4E8D] hover:text-white transition-colors sm:hidden"
          >
            Add to cart
          </button>
        </div>

        {/* sm+ full-width Add button */}
        <button
          onClick={handleAddToCart}
          className="hidden sm:block w-full text-[#FF4E8D] border border-[#FF4E8D] py-3 rounded-lg font-semibold hover:bg-[#FF4E8D] hover:text-white transition-colors"
        >
          Add to cart
        </button>
      </div>
    </div>
  );
};

export default ProductCard;