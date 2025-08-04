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
    <div className="group bg-white rounded-xl sm:rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden border border-gray-100 h-full flex flex-col">
      <Link href={`/products/${product._id}`} className="block flex-1">
        {/* Product Image Container */}
        <div className="relative aspect-[4/3] w-full bg-[#faf5f2] overflow-hidden">
          <Image
            src={getPrimaryImage()}
            alt={product.name}
            fill
            className="object-cover transform group-hover:scale-105 transition-transform duration-300"
            onError={(e) => {
              e.currentTarget.src = '/products/product.png';
            }}
          />

          {/* Wishlist Heart Icon */}
          <button
            onClick={handleWishlistToggle}
            className="absolute top-2 sm:top-3 right-2 sm:right-3 bg-white/90 backdrop-blur-sm p-1.5 sm:p-2 rounded-full cursor-pointer hover:bg-white transition-colors shadow-sm z-10 min-w-[32px] min-h-[32px] flex items-center justify-center"
          >
            <Heart
              className={`h-4 w-4 sm:h-5 sm:w-5 ${isInWishlist ? 'text-[#EE346C] fill-[#EE346C]' : 'text-gray-500'}`}
            />
          </button>

          {/* Stock Badge */}
          {stock > 0 && stock <= 5 && (
            <div className="absolute top-2 sm:top-3 left-2 sm:left-3 bg-red-500 text-white px-2 py-1 sm:px-3 sm:py-1.5 rounded-full text-xs font-semibold">
              Only {stock} left
            </div>
          )}

          {/* MRP Badge */}
          {product.mrp && product.mrp > product.price && (
            <div className="absolute bottom-2 sm:bottom-3 left-2 sm:left-3 bg-green-500 text-white px-2 py-1 sm:px-3 sm:py-1.5 rounded-full text-xs font-semibold">
              {Math.round(((product.mrp - product.price) / product.mrp) * 100)}% OFF
            </div>
          )}
        </div>
      </Link>

      {/* Product Details */}
      <div className="p-3 sm:p-4 flex flex-col flex-1">
        <div className="flex flex-col flex-1 gap-3 sm:gap-4">
          {/* Product Name */}
          <Link href={`/products/${product._id}`} className="flex-1">
            <h3 className="text-primary text-sm sm:text-base lg:text-lg font-medium leading-tight hover:text-[#4A2E15] transition-colors line-clamp-2">
              {product.name}
            </h3>
          </Link>

          {/* Color Swatches */}
          {(product.colors && product.colors.length > 0) || defaultColors.length > 0 ? (
            <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
              {(product.colors && product.colors.length > 0 ? product.colors : defaultColors).slice(0, 6).map((color, index) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setSelectedColor(color)}
                  className={`w-3 h-3 sm:w-4 sm:h-4 rounded-full border-2 transition-all focus:outline-none relative min-w-[12px] min-h-[12px] sm:min-w-[16px] sm:min-h-[16px]`}
                  style={{
                    background: `linear-gradient(white, white) padding-box, ${color} border-box`,
                    borderColor: selectedColor === color ? '#5E3A1C' : 'transparent',
                    borderWidth: '2px',
                    padding: '1px'
                  }}
                  title={color}
                  aria-label={`Select color ${color}`}
                >
                  <span
                    className="block w-full h-full rounded-full"
                    style={{
                      backgroundColor: color,
                      display: 'block',
                      width: '100%',
                      height: '100%',
                      boxSizing: 'border-box'
                    }}
                  />
                </button>
              ))}
              {(product.colors && product.colors.length > 6) && (
                <span className="text-xs text-gray-500">+{product.colors.length - 6}</span>
              )}
            </div>
          ) : null}

          {/* Price & Rating */}
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 sm:gap-3">
            {/* Price */}
            <div className="flex items-center gap-2">
              <span className="text-[#5E3A1C] text-base sm:text-lg lg:text-xl font-semibold">
                ₹{product.price.toLocaleString()}
              </span>
              {product.mrp && product.mrp > product.price && (
                <span className="text-gray-500 text-sm line-through">
                  ₹{product.mrp.toLocaleString()}
                </span>
              )}
            </div>

            {/* Rating */}
            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`h-3 w-3 sm:h-4 sm:w-4 ${i < Math.floor(product.averageRating || 0)
                      ? 'text-[#fbbf24] fill-[#fbbf24]'
                      : 'text-[#d1d5db]'
                    }`}
                />
              ))}
              <span className="ml-1 text-xs sm:text-sm text-gray-600">
                ({product.totalReviews || 745})
              </span>
            </div>
          </div>

          {/* Add to Cart Button */}
          <button
            onClick={handleAddToCart}
            className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-[#EE346C] rounded-lg text-[#EE346C] bg-white font-medium hover:bg-[#fef2f2] transition-colors flex justify-center items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base min-h-[44px] sm:min-h-[48px]"
            disabled={!product.available}
          >
            <ShoppingCart className="h-4 w-4 sm:h-5 sm:w-5" />
            <span>{product.available ? 'Add to cart' : 'Out of Stock'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard; 