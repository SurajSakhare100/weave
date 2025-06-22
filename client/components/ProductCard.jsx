import Image from 'next/image';
import { useState } from 'react';
import { Star, Heart, ShoppingCart } from 'lucide-react';
import Link from 'next/link';
import { useSelector, useDispatch } from 'react-redux';
import { addItem } from '../features/cart/cartSlice';
import { addToWishlist, removeFromWishlist } from '../features/user/userSlice';

const ProductCard = ({ product }) => {
  const dispatch = useDispatch();
  const { wishlist } = useSelector((state) => state.user);
  const isInWishlist = wishlist.includes(product._id);

  const getImageUrl = (files, index = 0) => {
    if (files && files.length > index) {
      return `http://localhost:5000/uploads/${files[index]}`;
    }
    return '/products/product.png';
  };

  const calculateDiscount = () => {
    if (!product) return 0;
    return Math.round(((product.mrp - product.price) / product.mrp) * 100);
  };

  const handleAddToCart = (e) => {
    e.preventDefault();
    if (product.available === 'true') {
      dispatch(addItem({
        id: product._id,
        name: product.name,
        price: product.price,
        quantity: 1
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

  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm hover:shadow-lg transition-shadow duration-300 group">
      <Link href={`/products/${product._id}`}>
        <div className="relative bg-[#faf5f2] rounded-xl overflow-hidden">
          <Image
            src={'/products/product.png'}
            alt={product.name}
            width={400}
            height={400}
            className="object-cover transform group-hover:scale-105 transition-transform duration-300"
            onError={(e) => {
              e.currentTarget.src = '/products/product.png';
            }}
          />
          <button 
            onClick={handleWishlistToggle}
            className="absolute top-3 right-3 bg-white/80 backdrop-blur-sm p-2 rounded-full cursor-pointer hover:bg-white"
          >
            <Heart className={`h-5 w-5 ${isInWishlist ? 'text-red-500 fill-red-500' : 'text-gray-500'}`} />
          </button>
          
          {/* Discount Badge */}
          {product.mrp > product.price && (
            <div className="absolute top-3 left-3 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-medium">
              {calculateDiscount()}% OFF
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
          <h3 className="text-xl font-medium text-gray-800 hover:text-pink-500 transition-colors">
            {product.name}
          </h3>
        </Link>
        
        <p className="text-sm text-gray-600 mt-1">{product.category}</p>

        <div className="flex justify-between items-center mt-3">
          <div className="flex items-center space-x-2">
            <p className="text-xl font-bold text-gray-900">₹{product.price}</p>
            {product.mrp > product.price && (
              <p className="text-sm text-gray-500 line-through">₹{product.mrp}</p>
            )}
          </div>
          
          {/* Rating (placeholder - you can add actual rating logic later) */}
          <div className="flex items-center">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="h-4 w-4 text-gray-300" />
            ))}
            <span className="text-sm text-gray-500 ml-1">(0)</span>
          </div>
        </div>

        <button 
          onClick={handleAddToCart}
          className="mt-4 w-full bg-pink-500 text-white font-semibold py-2.5 rounded-lg hover:bg-pink-600 transition-colors duration-300 flex items-center justify-center space-x-2 disabled:bg-gray-400 disabled:cursor-not-allowed"
          disabled={product.available !== 'true'}
        >
          <ShoppingCart className="h-4 w-4" />
          <span>{product.available === 'true' ? 'Add to cart' : 'Out of Stock'}</span>
        </button>
      </div>
    </div>
  );
};

export default ProductCard; 