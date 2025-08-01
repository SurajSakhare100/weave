import React from 'react';
import { Star, Heart, ShoppingCart } from 'lucide-react';
import { useSelector, useDispatch } from 'react-redux';
import { addCartItem, fetchCart } from '@/features/cart/cartSlice';
import { addToWishlist, removeFromWishlist } from '@/features/user/userSlice';
import { AppDispatch, RootState } from '@/store/store';
import { toast } from 'sonner';

interface ProductDetailsProps {
  product: {
    _id: string;
    name: string;
    price: number;
    mrp?: number;
    description?: string;
    averageRating?: number;
    totalReviews?: number;
    stock?: number;
    colors?: string[];
    sizes?: string[];
  };
}

const ProductDetails: React.FC<ProductDetailsProps> = ({ product }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { wishlist } = useSelector((state: RootState) => state.user);
  const isInWishlist = wishlist.includes(product._id);

  const handleAddToCart = () => {
    if (!product || !product._id) {
      toast.error('Product not available');
      return;
    }

    if (!product.stock || product.stock === 0) {
      toast.error('Product is out of stock');
      return;
    }

    // Determine the size to use - prioritize product sizes, then default to 'M'
    let selectedSize = 'M';
    if (product.sizes && product.sizes.length > 0) {
      selectedSize = product.sizes[0];
    }

    dispatch(addCartItem({
      product,
      quantity: 1,
      variantSize: selectedSize
    })).then(() => {
      // Refresh cart to ensure UI is updated immediately
      dispatch(fetchCart());
      toast.success('Added to cart successfully!');
    }).catch((error) => {
      console.error('Failed to add to cart:', error);
      toast.error('Failed to add to cart');
    });
  };

  const handleWishlistToggle = () => {
    if (!product || !product._id) {
      toast.error('Product not available');
      return;
    }

    if (isInWishlist) {
      dispatch(removeFromWishlist(product._id));
      toast.success('Removed from wishlist');
    } else {
      dispatch(addToWishlist(product._id));
      toast.success('Added to wishlist');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">{product.name}</h1>
        <div className="flex items-center mt-2">
          {[...Array(5)].map((_, i) => (
            <Star 
              key={i} 
              className={`h-5 w-5 ${i < (product.averageRating || 0) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} 
            />
          ))}
          <span className="ml-2 text-gray-600">({product.totalReviews || 0} reviews)</span>
        </div>
      </div>

      <div className="flex items-baseline space-x-4">
        <p className="text-3xl font-bold text-gray-900">₹{product.price}</p>
        {product.mrp && product.mrp > product.price && (
          <p className="text-xl text-gray-500 line-through">₹{product.mrp}</p>
        )}
      </div>

      {product.description && (
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Description</h3>
          <p className="text-gray-600">{product.description}</p>
        </div>
      )}

      <div className="flex space-x-4">
        <button
          onClick={handleAddToCart}
          className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
          disabled={!product.stock || product.stock === 0}
        >
          <ShoppingCart className="h-5 w-5" />
          <span>{product.stock && product.stock > 0 ? 'Add to Cart' : 'Out of Stock'}</span>
        </button>
        <button
          onClick={handleWishlistToggle}
          className={`p-3 rounded-lg border-2 transition-colors ${
            isInWishlist 
              ? 'border-red-500 bg-red-50 text-red-600' 
              : 'border-gray-300 hover:border-gray-400'
          }`}
        >
          <Heart className={`h-5 w-5 ${isInWishlist ? 'fill-current' : ''}`} />
        </button>
      </div>
    </div>
  );
};

export default ProductDetails; 