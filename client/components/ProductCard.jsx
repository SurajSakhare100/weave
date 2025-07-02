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

  return (
    <div className="bg-white rounded-2xl p-6 w-full shadow-sm hover:shadow-lg transition-shadow duration-300 group">
      <Link href={`/products/${product._id}` }>
        <div className="relative bg-[#faf5f2] rounded-xl overflow-hidden">
          <Image
            src={product.Images && product.Images.length > 0 && getPrimaryImageUrl(product.Images[0])
              ? getPrimaryImageUrl(product.Images[0])
              : '/products/product.png'}
            alt={product.name}
            width={400}
            height={400}
            className="object-cover w-full h-full transform group-hover:scale-105 transition-transform duration-300"
            onError={(e) => {
              e.currentTarget.src = '/products/product.png';
            }}
          />
          <button 
            onClick={handleWishlistToggle}
            className="absolute top-3 right-3 bg-[#FFF4EC] backdrop-blur-sm p-2 rounded-full cursor-pointer hover:bg-[#FFF2EC]"
          >
            <Heart className={`h-5 w-5 ${isInWishlist ? 'text-[#EE346C] ' : 'text-gray-500'}`} />
          </button>
          
          {/* Discount Badge */}
          {product.mrp > product.price && (
            <div className="absolute top-3 left-3 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-medium">
              {calculateDiscount()}% OFF
            </div>
          )}
          
          {/* Stock Badge */}
          {stock > 0 && stock <= 5 && (
            <div className="absolute top-3 left-3 bg-gray-100 text-gray-800 px-3 py-1.5 rounded-full text-xs font-semibold">
              Only {stock} left
            </div>
          )}
          
          {/* Status Badge */}
          <div className="absolute bottom-3 left-3">
            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
              product.available === 'true' 
                ? 'bg-green-100 text-green-800' 
                : 'bg-red-100 text-red-800'
            }`}>
              {product.available === 'true' ? 'In Stock' : 'Out of Stock'}
            </span>
          </div>
        </div>
      </Link>
      
      <div className="mt-4">
        <Link href={`/products/${product._id}`}>
          <h3 className="text-xl font-semibold text-[#5E3A1C] hover:text-pink-500 transition-colors duration-200">
            {product.name}
          </h3>
        </Link>
        
        {/* Color Swatches */}
        {product.colors && product.colors.length > 0 && (
          <div className="flex items-center space-x-2 mt-2">
            {product.colors.map((color) => (
              <button
                key={color}
                onClick={() => setSelectedColor(color)}
                className={`w-6 h-6 rounded-full border-2 ${selectedColor === color ? 'border-pink-500' : 'border-transparent'}`}
                style={{ backgroundColor: color, outline: 'none' }}
                title={color}
              />
            ))}
          </div>
        )}

        <div className="w-full  flex justify-between items-center mt-3">
          <div className="flex items-baseline space-x-2 w-full">
            <p className="text-2xl font-bold ">₹{product.price}</p>
            {/* {product.mrp > product.price && (
              <p className="text-md text-gray-500 line-through">₹{product.mrp}</p>
            )} */}
          </div>
          
          <div className="flex items-center w-full">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className={`h-5 w-5 ${i < product.averageRating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} />
            ))}
            <span className="text-sm  ml-2">({product.totalReviews})</span>
          </div>
        </div>

        <button 
          onClick={handleAddToCart}
          className="mt-4 w-full border border-[#EE346C]  text-[#EE346C] font-semibold py-3 rounded-md hover:bg-white flex items-center justify-center space-x-2"
          disabled={stock === 0}
        >
          <ShoppingCart className="h-5 w-5" />
          <span>{stock > 0 ? 'Add to cart' : 'Out of Stock'}</span>
        </button>
      </div>
    </div>
  );
};

export default ProductCard; 