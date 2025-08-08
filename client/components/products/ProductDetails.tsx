import React from 'react';
import Image from 'next/image';
import { Heart, Star } from 'lucide-react';
import { ProductWithReviews } from '@/types';

interface ProductDetailsProps {
  product: ProductWithReviews;
  inWishlist: boolean;
  onWishlistToggle: () => void;
  onAddToCart: () => void;
}

const ProductDetails: React.FC<ProductDetailsProps> = ({
  product,
  inWishlist,
  onWishlistToggle,
  onAddToCart,
}) => {
  const getPrimaryImage = () => {
    if (product.images && product.images.length > 0) {
      const primary = product.images.find(img => img.is_primary);
      return primary ? primary.url : product.images[0].url;
    }
    return '/products/product.png';
  };

  const getStarRating = (rating: number) => {
    return Math.round(rating);
  };

  const calculateDiscount = () => {
    if (!product) return 0;
    return Math.round(((product.mrp - product.price) / product.mrp) * 100);
  };

  return (
    <div className="flex flex-col lg:flex-row gap-12">
      {/* Left: Images */}
      <div className="lg:w-1/2">
        {/* Main Image */}
        <div className="relative w-full bg-white flex items-center justify-center">
          <Image
            src={getPrimaryImage()}
            alt={product.name}
            width={500}
            height={500}
            className="object-contain"
          />
        </div>

        {/* Thumbnails */}
        {product.images && product.images.length > 0 && (
          <div className="flex gap-4 mt-4 justify-center">
            {product.images.map((img, idx) => (
              <div key={img.public_id || idx} className="shrink-0 w-16 h-16 overflow-hidden">
                <Image
                  src={img.url}
                  alt={product.name}
                  width={64}
                  height={64}
                  className="object-cover w-full h-full"
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Right: Product Info */}
      <div className="flex-1 flex flex-col gap-6">
        {/* Title + Wishlist */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-medium text-[#5E3A1C] mb-2">{product.name}</h1>
            <p className="text-[#5E3A1C] text-sm font-medium">
              {product.description || product.srtDescription || 'No description available'}
            </p>
          </div>
          <button
            onClick={onWishlistToggle}
            className="p-2"
          >
            <Heart
              className={`h-5 w-5 ${
                inWishlist ? 'fill-[#EE346C] text-[#EE346C]' : 'text-[#5E3A1C]'
              }`}
            />
          </button>
        </div>

        {/* Star Rating */}
        <div className="flex items-center gap-1">
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              className={`h-4 w-4 ${
                i < getStarRating(product.averageRating) ? 'text-[#FFB800] fill-[#FFB800]' : 'text-[#E7D9CC]'
              }`}
            />
          ))}
          <span className="ml-2 text-sm text-[#5E3A1C]">({product.totalReviews})</span>
        </div>

        {/* Colors */}
        {product.colors && product.colors.length > 0 && (
          <div>
            <span className="text-[#5E3A1C] text-sm mb-2 block">Color: {product.colors[0]}</span>
            <div className="flex gap-2">
              {product.colors.map((color) => (
                <span
                  key={color}
                  className="w-5 h-5 rounded-full border border-[#E7D9CC]"
                  style={{ backgroundColor: color }}
                ></span>
              ))}
            </div>
          </div>
        )}

        {/* Price Section */}
        <div className="flex items-center gap-4">
          <div className="text-[#5E3A1C] text-2xl font-medium">-{calculateDiscount()}% ₹{product.price}</div>
          {product.mrp > product.price && (
            <span className="text-sm text-[#5E3A1C] line-through">₹{product.mrp}</span>
          )}
        </div>

        {/* Note */}
        <div className="text-[#EE346C] text-sm">
          Note: We offer worldwide shipping for all orders.
        </div>
        <div className="text-[#5E3A1C] text-sm">
          Delivery expected within the next 3-4 business days to 🇮🇳
        </div>

        {/* Buttons */}
        <div className="flex gap-4">
          <button
            onClick={onAddToCart}
            className="flex-1 bg-white border border-[#E7D9CC] text-[#5E3A1C] h-12 rounded-lg font-medium hover:bg-[#FFF4EC] transition"
          >
            Add to Cart
          </button>
          <button
            className="flex-1 bg-[#EE346C] text-white h-12 rounded-lg font-medium hover:bg-[#D62A5A] transition"
          >
            Buy Now
          </button>
        </div>

        {/* Product Details */}
        <div className="border-t border-[#E7D9CC] pt-6">
          <h3 className="text-[#5E3A1C] font-medium mb-4">Product Details</h3>
          <div className="grid grid-cols-2 gap-y-4 text-sm">
            <div>
              <span className="text-[#5E3A1C]">Category</span>
              <p className="text-[#5E3A1C] font-medium">{product.category?.name || 'Tote'}</p>
            </div>
            <div>
              <span className="text-[#5E3A1C]">Dimensions</span>
              <p className="text-[#5E3A1C] font-medium">{product.productDetails?.dimensions || '12.7"W X 9.1"H'}</p>
            </div>
            <div>
              <span className="text-[#5E3A1C]">Tags</span>
              <p className="text-[#5E3A1C] font-medium">{product.tags?.join(', ') || 'Straw Weave'}</p>
            </div>
            <div>
              <span className="text-[#5E3A1C]">View more</span>
              <p className="text-[#5E3A1C] font-medium">→</p>
            </div>
          </div>
        </div>

        {/* Return Policy */}
        <div className="text-[#5E3A1C] text-sm">
          Enjoy a worry-free shopping experience.
          <div className="flex items-center gap-2 mt-2">
            <span className="inline-flex items-center gap-1 border border-[#E7D9CC] px-3 py-1.5 rounded-lg text-[#5E3A1C]">
              🛡️ 5 days Return & Exchange
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;