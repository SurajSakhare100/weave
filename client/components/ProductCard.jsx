import Image from 'next/image';
import { useState } from 'react';
import { Star, Heart, ShoppingCart } from 'lucide-react';
import Link from 'next/link';
import { useSelector, useDispatch } from 'react-redux';
import { addCartItem } from '../features/cart/cartSlice';
import { addToWishlist, removeFromWishlist } from '../features/user/userSlice';
import { getPrimaryImageUrl, getThumbnailUrl, convertLegacyFilesToImages } from '../utils/imageUtils';

const ProductCard = ({ product }) => {
  const dispatch = useDispatch();
  const { wishlist } = useSelector((state) => state.user);
  const isInWishlist = wishlist.includes(product._id);
  const [selectedColor, setSelectedColor] = useState(product.colors ? product.colors[0] : null);

  

  const calculateDiscount = () => {
    if (!product) return 0;
    return Math.round(((product.mrp - product.price) / product.mrp) * 100);
  };

  const handleAddToCart = (e) => {
    e.preventDefault();
    if (product.available === 'true') {
      dispatch(addCartItem({
        product: product,
        quantity: 1,
        variantSize: selectedColor || product.currVariantSize || 'M'
      }));
    }
  };

  const handleWishlistToggle = (e) => {
    e.preventDefault();
    if (isInWishlist) {
      dispatch(removeFromWishlist(product._id));
    } else {
      dispatch(addToWishlist(product._id));
    }
  };

  const stock = product.variant ? product.variantDetails.reduce((acc, v) => acc + v.stock, 0) : product.stock;

  // Get the primary image (is_primary: true) or fallback to first image
  const getPrimaryImage = () => {
    if (product.images && product.images.length > 0) {
      const primary = product.images.find(img => img.is_primary);
      return primary ? primary.url : product.images[0].url;
    }
    return '/products/product.png';
  };

  return (
    <div className="p-4 bg-white rounded-xl inline-flex flex-col justify-start items-center gap-5 w-full max-w-xs mx-auto">
      <Link href={`/products/${product._id}`}>
        <div className="self-stretch h-48 relative bg-stone-50 rounded-[10px] overflow-hidden">
          <Image
            src={getPrimaryImage()}
            alt={product.name}
            width={139}
            height={129}
            className="w-36 h-32 left-[63px] top-[30px] absolute object-cover"
            onError={(e) => {
              e.currentTarget.src = '/products/product.png';
            }}
          />
          <button 
            onClick={handleWishlistToggle}
            className="w-7 h-7 p-1 left-[219px] top-[10px] absolute bg-white rounded-2xl inline-flex justify-center items-center gap-4 shadow"
            style={{ zIndex: 2 }}
          >
            <Heart className={`w-4 h-4 ${isInWishlist ? 'text-rose-500' : 'text-gray-400'}`} />
          </button>
          {/* Stock Badge */}
          {stock > 0 && stock <= 5 && (
            <div className="px-2.5 py-1 left-0 top-0 absolute bg-gray-700 bg-opacity-80 inline-flex justify-center items-center gap-4 rounded-br-lg">
              <div className="text-center text-white text-xs font-medium font-['Montserrat'] leading-tight">Only {stock} left</div>
            </div>
          )}
        </div>
      </Link>
      <div className="self-stretch flex flex-col justify-start items-start gap-5">
        <div className="self-stretch flex flex-col justify-start items-start gap-4">
          <div className="self-stretch flex flex-col justify-start items-start gap-3.5">
            <Link href={`/products/${product._id}`}>
              <div className="self-stretch text-[var(--primary)] text-xl font-medium font-['Montserrat'] leading-relaxed">{product.name}</div>
            </Link>
            {/* Color Swatches */}
            {product.colors && product.colors.length > 0 && (
              <div className="inline-flex justify-start items-center gap-1.5">
                {product.colors.map((color) => (
                  <button
                    key={color}
                    onClick={() => setSelectedColor(color)}
                    className={`w-5 h-5 p-1 bg-white rounded-[10px] outline outline-1 outline-offset-[-1px] ${selectedColor === color ? 'outline-rose-500' : 'outline-gray-300'} flex justify-start items-center gap-4`}
                    style={{ backgroundColor: color, outline: selectedColor === color ? '2px solid #EE346C' : '1px solid #e5e7eb' }}
                    title={color}
                  >
                    <div className="w-3.5 h-3.5 rounded-full" style={{ backgroundColor: color }} />
                  </button>
                ))}
              </div>
            )}
            <div className="self-stretch inline-flex justify-between items-center">
              <div className="flex justify-start items-center gap-1">
                <div className="text-center text-[var(--primary)] text-xl font-semibold font-['Montserrat'] leading-relaxed">₹{product.price}</div>
              </div>
              <div className="inline-flex flex-col justify-start items-start gap-1.5">
                <div className="inline-flex justify-start items-center gap-2.5">
                  <div className="flex justify-start items-center">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className={`w-5 h-5 ${i < product.averageRating ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'}`} />
                    ))}
                  </div>
                  <div className="text-center text-gray-500 text-base font-normal font-['Montserrat'] leading-tight">({product.totalReviews})</div>
                </div>
              </div>
            </div>
          </div>
          <button 
            onClick={handleAddToCart}
            className="w-64 px-2.5 py-3.5 rounded-md outline outline-1 outline-offset-[-1px] outline-rose-500 inline-flex justify-center items-center gap-4 bg-white text-rose-500 text-base font-semibold font-['Montserrat'] leading-tight hover:bg-rose-50 transition-colors"
            disabled={stock === 0}
          >
            Add to cart
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard; 