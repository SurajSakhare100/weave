import React, { useState } from 'react';
import Image from 'next/image';
import { Star, Heart, ShoppingCart } from 'lucide-react';
import Link from 'next/link';
import { useSelector, useDispatch } from 'react-redux';
import { addCartItem } from '@/features/cart/cartSlice';
import { addToWishlist, removeFromWishlist } from '@/features/user/userSlice';
import { AppDispatch, RootState } from '@/store/store';

interface Product {
  _id: string;
  name: string;
  price: number;
  mrp?: number;
  available: string;
  stock?: number;
  variant?: boolean;
  variantDetails?: Array<{ stock: number }>;
  colors?: string[];
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
  const isInWishlist = wishlist.includes(product._id);
  const [selectedColor, setSelectedColor] = useState<string | null>(
    product.colors ? product.colors[0] : null
  );

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    if (product.available === 'true') {
      dispatch(addCartItem({
        product,
        quantity: 1,
        variantSize: selectedColor || product.currVariantSize || 'M'
      }));
    }
  };

  const handleWishlistToggle = (e: React.MouseEvent) => {
    e.preventDefault();
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
<div className="p-4 bg-white rounded-2xl inline-flex flex-col justify-start items-center gap-5 transition-shadow duration-300 group w-full">
  <Link href={`/products/${product._id}`} className="w-full">
    {/* Product Image Container */}
    <div className="relative aspect-[4/3] w-full bg-[#faf5f2] rounded-xl overflow-hidden">
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
        className="absolute top-3 right-3 bg-[#FFF4EC] backdrop-blur-sm p-2 rounded-full cursor-pointer hover:bg-[#FFF2EC] transition-colors"
      >
        <Heart
          className={`h-5 w-5 ${
            isInWishlist ? 'text-[#EE346C] fill-[#EE346C]' : 'text-gray-500'
          }`}
        />
      </button>

      {/* Stock Badge */}
      {stock > 0 && stock <= 5 && (
        <div className="absolute top-3 left-3 bg-gray-100 text-gray-800 px-3 py-1.5 rounded-full text-xs font-semibold">
          Only {stock} left
        </div>
      )}
    </div>
  </Link>

  {/* Product Details */}
  <div className="w-full flex flex-col justify-start items-start gap-5">
    <div className="w-full flex flex-col justify-start items-start gap-4">
      <div className="w-full flex flex-col justify-start items-start gap-3.5">
        {/* Product Name */}
        <Link href={`/products/${product._id}`}>
          <h3 className="text-primary text-lg font-medium leading-relaxed hover:text-[#4A2E15] transition-colors">
            {product.name}
          </h3>
        </Link>

        {/* Color Swatches */}
        <div className="flex items-center gap-2">
          {(product.colors || defaultColors).map((color, index) => (
            <button
              key={color}
              onClick={() => setSelectedColor(color)}
              className={`w-4 h-4 rounded-full border-2 transition-all ${
                selectedColor === color
                  ? 'border-[#EE346C] scale-110'
                  : 'border-transparent hover:scale-105'
              }`}
              style={{ backgroundColor: color }}
              title={color}
            />
          ))}
        </div>

        {/* Price & Rating */}
        <div className="w-full flex justify-between items-center">
          {/* Price */}
          <div className="flex items-center gap-1">
            <span className="text-[#5E3A1C] text-xl font-semibold leading-relaxed">
              ₹{product.price.toLocaleString()}
            </span>
          </div>

          {/* Rating */}
          <div className="flex items-center gap-1">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`h-4 w-4 ${
                  i < Math.floor(product.averageRating || 0)
                    ? 'text-[#fbbf24] fill-[#fbbf24]'
                    : 'text-[#d1d5db]'
                }`}
              />
            ))}
            <span className="ml-1 text-sm text-gray-600">
              ({product.totalReviews || 745})
            </span>
          </div>
        </div>
      </div>

      {/* Add to Cart */}
      <button
        onClick={handleAddToCart}
        className="w-full px-4 py-3 border border-[#EE346C] rounded-md text-[#EE346C] bg-white font-semibold hover:bg-[#fef2f2] transition-colors flex justify-center items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        disabled={stock === 0}
      >
        <ShoppingCart className="h-5 w-5" />
        <span>{stock > 0 ? 'Add to cart' : 'Out of Stock'}</span>
      </button>
    </div>
  </div>
</div>

  );
};

export default ProductCard; 