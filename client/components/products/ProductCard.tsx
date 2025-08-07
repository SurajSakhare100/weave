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
    <div className="group bg-white  rounded-lg p-2.5 shadow-sm h-full flex flex-col gap-3">
      <Link href={`/products/${product._id}`} className="block flex-1 ">
        {/* Product Image Container */}
        <div className="relative aspect-4/3 rounded-md  xs:p-2 w-full bg-[#FFF4EC] overflow-hidden">
          <Image
            src={getPrimaryImage()}
            alt={product.name}
            fill
            className="object-cover aspect-4/3 rounded-md  p-2"
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
            className="absolute bg-[#FFF4EC] p-1 rounded-xl top-4 right-4 z-10"
            aria-label="Add to wishlist"
          >
            <Heart
              className={`h-2.5 w-2.5 sm:h-6 sm:w-6 ${isInWishlist ? ' fill-[#FF4E8D] text-[#EE346C]' : 'text-[#EE346C]'}`}
            />
          </button>
        </div>
      </Link>

      {/* Product Details */}
      <div className=" flex flex-col gap-2.5">
        {/* Product Name */}
        <h3 className="text-sm font-medium text-gray-900">
          {product.name}
        </h3>

        {/* Color Swatches */}
        <div className="flex gap-0.5 items-center">
          {(product.colors || defaultColors).slice(0, 6).map((color) => (
            <div
              className={`flex  rounded-full items-center  p-0.5 justify-center ${selectedColor === color ? 'ring-1  ring-secondary' : ''}`} key={color}
           >   <button
                className={`w-2 h-2 rounded-full   `}
              style={{ backgroundColor: color }}
                onClick={() => setSelectedColor(color)}
                aria-label={`Select color ${color}`}
              />
            </div>
          ))}
        </div>

       

        {/* Rating */}
        <div className="flex items-center">
          <div className="flex text-yellow-400">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`h-3 w-3 ${
                  i < Math.floor(product.averageRating || 4.5)
                    ? 'fill-current'
                    : 'text-gray-300'
                }`}
              />
            ))}
          </div>
          <span className="text-gray-600 ml-1 text-sm">
            ({product.totalReviews || 745})
          </span>
        </div>

        {/* Price and Add to Cart */}
        <div className="flex items-center justify-between mt-1">
          <span className="text-sm xs:text-lg font-medium p-0.5">₹ {product.price}</span>
          <button
            onClick={handleAddToCart}
            className="text-[#FF4E8D] text-xs xs:text-sm font-medium border-1 tracking-wide border-[#FF4E8D] px-1.5 py-2 xs:px-4 xs:py-2 rounded-sm hover:bg-[#FF4E8D] hover:text-white transition-colors"
          >
            Add to cart
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;