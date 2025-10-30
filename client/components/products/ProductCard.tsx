import React, { useState } from 'react';
import Image from 'next/image';
import { Star, Heart } from 'lucide-react';
import Link from 'next/link';
import { useSelector, useDispatch } from 'react-redux';
import { addCartItem, fetchCart } from '@/features/cart/cartSlice';
import { addToWishlist, removeFromWishlist } from '@/features/user/userSlice';
import { AppDispatch, RootState } from '@/store/store';
import { toast } from 'sonner';

interface ColorImage {
  url: string;
  public_id?: string;
  is_primary?: boolean;
}

interface ColorVariant {
  colorName: string;
  colorCode?: string;
  images?: ColorImage[];
  stock?: number;
  price?: number;
  mrp?: number;
  isActive?: boolean;
}

interface Product {
  _id: string;
  name: string;
  price: number;
  mrp?: number;
  available: boolean;
  stock?: number;
  sizes?: string[];
  currVariantSize?: string;
  // New model: colorVariants
  colorVariants?: ColorVariant[];
  // keep optional fallback fields if backend sends them
  images?: Array<{ url: string; is_primary?: boolean }>;
  primaryImage?: string;
  averageRating?: number;
  totalReviews?: number;
  // any extra fields
  [key: string]: any;
}

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { wishlist } = useSelector((state: RootState) => state.user);
  const isInWishlist = wishlist ? wishlist.includes(product._id) : false;

  // choose initial selected color: first active variant with images or first variant
  const firstAvailableVariant = (product.colorVariants || []).find(v => v.isActive && Array.isArray(v.images) && v.images.length > 0) || (product.colorVariants && product.colorVariants[0]);
  const [selectedColor, setSelectedColor] = useState<string | null>(firstAvailableVariant?.colorName || null);

  // find selected variant object
  const selectedVariant = React.useMemo(() => {
    if (!selectedColor || !product.colorVariants) return null;
    return product.colorVariants.find(v => v.colorName === selectedColor && v.isActive) || null;
  }, [product.colorVariants, selectedColor]);

  // compute stock: sum of variant stocks if variants exist, otherwise top-level stock
  const stock = React.useMemo(() => {
    if (Array.isArray(product.colorVariants) && product.colorVariants.length > 0) {
      return product.colorVariants.reduce((acc, v) => acc + (v.stock || 0), 0);
    }
    return product.stock || 0;
  }, [product.colorVariants, product.stock]);

  // display price based on selected variant fallback to main product price
  const displayPrice = selectedVariant?.price ?? product.price;
  const displayMrp = selectedVariant?.mrp ?? product.mrp;

  // get display image: prefer selected color's primary -> selected color first -> first active variant primary/first -> product.primaryImage -> product.images -> default
  const displayImage = React.useMemo(() => {
    // helper to extract url from image item
    const imgUrlFrom = (img: any) => (typeof img === 'string' ? img : img?.url);

    if (selectedVariant && Array.isArray(selectedVariant.images) && selectedVariant.images.length > 0) {
      const primary = selectedVariant.images.find((i: any) => !!i?.is_primary) || selectedVariant.images[0];
      const url = imgUrlFrom(primary);
      if (url) return { url };
    }

    // if no selected or selected has no images -> try first active variant
    if (Array.isArray(product.colorVariants) && product.colorVariants.length > 0) {
      const variant =
        product.colorVariants.find((v: any) => v.isActive && Array.isArray(v.images) && v.images.length > 0) ||
        product.colorVariants.find((v: any) => Array.isArray(v.images) && v.images.length > 0);
      if (variant && Array.isArray(variant.images) && variant.images.length > 0) {
        const primary = variant.images.find((i: any) => !!i?.is_primary) || variant.images[0];
        const url = imgUrlFrom(primary);
        if (url) return { url };
      }
    }

    // fallback explicit primaryImage
    if (product.primaryImage) return { url: product.primaryImage };

    // fallback top-level images array
    if (Array.isArray(product.images) && product.images.length > 0) {
      const primary = product.images.find((i: any) => !!i?.is_primary) || product.images[0];
      const url = imgUrlFrom(primary);
      if (url) return { url };
    }

    return { url: '/products/product.png' };
  }, [product, selectedVariant]);

  const availableColors = React.useMemo(() => {
    if (!product.colorVariants) return [];
    return product.colorVariants
      .filter(v => v.isActive)
      .map(v => ({
        name: v.colorName,
        code: v.colorCode || v.colorName,
        stock: v.stock || 0,
        imageCount: Array.isArray(v.images) ? v.images.length : 0
      }));
  }, [product.colorVariants]);

  const resolvedSize = React.useMemo(() => {
    if (product.sizes && product.sizes.length > 0) return product.sizes[0];
    if (product.currVariantSize) return product.currVariantSize;
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

    // pass selected variant id/name in payload if needed by backend
    const payload: any = {
      product,
      quantity: 1,
      variantColor: selectedVariant ? selectedVariant.colorName : undefined,
      variantPrice: selectedVariant ? selectedVariant.price : undefined,
      variantSize: resolvedSize,
    };

    dispatch(addCartItem(payload)).then(() => {
      dispatch(fetchCart());
      toast.success('Added to cart');
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

  // Primary image helper (kept for compatibility)
  const getPrimaryImage = () => displayImage.url || '/products/product.png';

  return (
    <div className=" bg-white rounded-lg p-2 sm:p-4 h-full flex flex-col gap-2  w-full lg:max-w-[420px]">
      <Link href={`/products/${product._id}`} className="block flex-1 ">
        {/* Product Image Container */}
        <div className="relative  w-full aspect-[4/3] rounded-xl bg-[#FFFBF8] overflow-hidden">
          <Image
            src={getPrimaryImage()}
            alt={product.name + (selectedColor ? ` - ${selectedColor}` : '')}
            fill
            className="object-contain p-2 sm:p-4"
            sizes="(max-width: 768px) 100vw, 33vw"
          />

          {/* Color Image Indicator */}
          {selectedColor && availableColors.find(c => c.name === selectedColor)?.imageCount > 0 && (
            <div className="absolute bottom-2 left-2 bg-primary/90 text-white text-xs px-1.5 py-0.5 rounded">
              {availableColors.find(c => c.name === selectedColor)?.imageCount}
            </div>
          )}

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
      <div className="flex flex-col gap-1 sm:gap-3.5">
        {/* Product Name */}
        <h3 className=" text-sm sm:text-md font-medium self-stretch  text-primary line-clamp-none  sm:leading-snug">
          {product.name}
        </h3>

        {/* Color Swatches */}
        {availableColors.length > 0 && (
          <div className="flex gap-2 items-center">
            {availableColors.slice(0, 6).map((c) => (
              <div key={c.name} className='flex items-center justify-center'>
                <button
                  style={{ backgroundColor: c.code }}
                  className={`w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 rounded-full transition-transform duration-150 focus:outline-none focus:ring-1 focus:ring-offset-2 ${selectedColor === c.name ? 'ring-1 ring-secondary ring-offset-2 scale-105' : 'hover:scale-105'}`}
                  onClick={() => setSelectedColor(c.name)}
                  aria-label={`Select color ${c.name}`}
                />
              </div>
            ))}
          </div>
        )}

        {/* Rating & Price */}
       <div className='flex items-center justify-between'>
        <span className="hidden sm:block text-sm sm:text-base font-bold text-primary">₹ {Number(displayPrice).toLocaleString('en-IN')}</span>
        <div className="flex items-center">
          <div className="flex text-yellow-400 text-xs sm:text-sm  items-center">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`h-3 w-3 sm:h-4 sm:w-4 ${i < Math.floor(product.averageRating || 4.5) ? 'fill-current' : 'text-gray-300'}`}
              />
            ))}
          </div>
          <span className="text-secondary ml-1 text-sm sm:text-base">({product.totalReviews || 0})</span>
        </div>
       </div>

      </div>

      <div className="flex items-center justify-between ">
          <span className="block sm:hidden text-sm sm:text-base font-bold text-primary">₹ {Number(displayPrice).toLocaleString('en-IN')}</span>
          <button
            onClick={handleAddToCart}
            disabled={!product.available || stock <= 0}
            className={`text-[#FF4E8D] text-xs sm:text-sm font-medium border border-[#FF4E8D] px-2 py-1 rounded-sm transition-colors sm:hidden ${(!product.available || stock <= 0) ? 'opacity-50 cursor-not-allowed' : 'hover:bg-[#FF4E8D] hover:text-white'}`}
          >
            Add to cart
          </button>
        </div>

        {/* sm+ full-width Add button */}
        <button
          onClick={handleAddToCart}
          disabled={!product.available || stock <= 0}
          className={`hidden sm:block w-full text-[#FF4E8D] border border-[#FF4E8D] py-2 rounded-sm font-semibold transition-colors ${(!product.available || stock <= 0) ? 'opacity-50 cursor-not-allowed' : 'hover:bg-[#FF4E8D] hover:text-white'}`}
        >
          Add to cart
        </button>
    </div>
  );
};

export default ProductCard;