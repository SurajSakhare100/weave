import React, { useState } from 'react';
import Image from 'next/image';
import { Heart, Star, Share2, Copy, ChevronLeft, ChevronRight, BarChart3 } from 'lucide-react';
import { ProductWithReviews } from '@/types';
import { toast } from 'sonner';

interface ProductDetailsProps {
  product: ProductWithReviews;
  inWishlist: boolean;
  onWishlistToggle: () => void;
  onAddToCart: () => void;
  onCompare?: () => void;
  onNext?: () => void;
  onPrevious?: () => void;
}

const ProductDetails: React.FC<ProductDetailsProps> = ({
  product,
  inWishlist,
  onWishlistToggle,
  onAddToCart,
  onCompare,
  onNext,
  onPrevious,
}) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showShareOptions, setShowShareOptions] = useState(false);
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

  const getCurrentImage = () => {
    if (product.images && product.images.length > 0) {
      return product.images[currentImageIndex]?.url || getPrimaryImage();
    }
    return getPrimaryImage();
  };

  const handlePreviousImage = () => {
    if (product.images && product.images.length > 1) {
      setCurrentImageIndex((prev) => (prev - 1 + product.images.length) % product.images.length);
    }
  };

  const handleNextImage = () => {
    if (product.images && product.images.length > 1) {
      setCurrentImageIndex((prev) => (prev + 1) % product.images.length);
    }
  };

  const handleShare = () => {
    setShowShareOptions(!showShareOptions);
  };

  const handleCopyUrl = async () => {
    try {
      const url = window.location.href;
      await navigator.clipboard.writeText(url);
      toast.success('Product URL copied to clipboard!');
      setShowShareOptions(false);
    } catch (error) {
      toast.error('Failed to copy URL');
    }
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: product.name,
          text: `Check out this ${product.name}`,
          url: window.location.href,
        });
        setShowShareOptions(false);
      } catch (error) {
        console.log('Share canceled or failed');
      }
    } else {
      handleCopyUrl();
    }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-12">
      {/* Left: Images */}
      <div className="lg:w-1/2">
        {/* Main Image */}
        <div className="relative w-full h-[500px] bg-[#FFFBF9] flex items-center justify-center rounded-lg overflow-hidden">
          <Image
            src={getCurrentImage()}
            alt={product.name}
            fill
            className="object-contain sm:p-8 p-4 rounded-lg"
          />
          
          {/* Top Right Icons */}
          <div className="absolute top-4 right-4 flex flex-col gap-2">
            {/* Wishlist Icon */}
            <button
              onClick={onWishlistToggle}
              className="bg-white/90 backdrop-blur-sm p-2 rounded-full shadow-md  transition-all"
              title="Add to Wishlist"
            >
              <Heart
                className={`h-5 w-5 ${
                  inWishlist ? 'fill-[#EE346C] text-[#EE346C]' : 'text-[#5E3A1C]'
                }`}
              />
            </button>

            {/* Share Icon */}
            <div className="relative">
              <button
                onClick={handleShare}
                className="bg-white/90 backdrop-blur-sm p-2 rounded-full shadow-md  transition-all"
                title="Share Product"
              >
                <Share2 className="h-5 w-5 text-[#5E3A1C]" />
              </button>

              {/* Share Options Dropdown */}
              {showShareOptions && (
                <div className="absolute right-0 top-full mt-2 bg-white rounded-lg shadow-lg border border-gray-200 p-3 z-20 min-w-[200px]">
                  <div className="text-sm font-medium text-[#5E3A1C] mb-2">Share this product</div>
                  <button
                    onClick={handleCopyUrl}
                    className="flex items-center gap-2 w-full p-2 text-left text-sm text-[#5E3A1C] hover:bg-gray-50 rounded transition-colors"
                  >
                    <Copy className="h-4 w-4" />
                    Copy URL
                  </button>
                  <button
                    onClick={handleNativeShare}
                    className="flex items-center gap-2 w-full p-2 text-left text-sm text-[#5E3A1C] hover:bg-gray-50 rounded transition-colors"
                  >
                    <Share2 className="h-4 w-4" />
                    Share via...
                  </button>
                </div>
              )}
            </div>

            {/* Compare Icon */}
            {onCompare && (
              <button
                onClick={onCompare}
                className="bg-white/90 backdrop-blur-sm p-2 rounded-full shadow-md  transition-all"
                title="Compare Products"
              >
                <BarChart3 className="h-5 w-5 text-[#5E3A1C]" />
              </button>
            )}
          </div>

          {/* Image Navigation Arrows */}
          {product.images && product.images.length > 1 && (
            <>
              <button
                onClick={handlePreviousImage}
                className="absolute bottom-4 right-1/2  transform -translate-y-1/2 bg-secondary backdrop-blur-sm p-2 rounded-full shadow-md  transition-all"
                title="Previous Image"
              >
                <ChevronLeft className="h-5 w-5 text-white" />
              </button>
              
              <button
                onClick={handleNextImage}
                className="absolute bottom-4 left-1/2 ml-3 transform -translate-y-1/2 bg-primary backdrop-blur-sm p-2 rounded-full shadow-md  transition-all mr-16"
                title="Next Image"
              >
                <ChevronRight className="h-5 w-5 text-white " />
              </button>
            </>
          )}

          {/* Product Navigation Buttons */}
          {/* <div className="absolute bottom-4 left-4 flex gap-2">
            {onPrevious && (
              <button
                onClick={onPrevious}
                className="bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full shadow-md  transition-all flex items-center gap-2"
                title="Previous Product"
              >
                <ChevronLeft className="h-4 w-4 text-[#5E3A1C]" />
                <span className="text-sm font-medium text-[#5E3A1C]">Previous</span>
              </button>
            )}
            
            {onNext && (
              <button
                onClick={onNext}
                className="bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full shadow-md  transition-all flex items-center gap-2"
                title="Next Product"
              >
                <span className="text-sm font-medium text-[#5E3A1C]">Next</span>
                <ChevronRight className="h-4 w-4 text-[#5E3A1C]" />
              </button>
            )}
          </div> */}
        </div>

        {/* Thumbnails */}
        {product.images && product.images.length > 1 && (
          <div className="flex gap-4 mt-4 justify-start overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {product.images.map((img, idx) => (
              <button
                key={img.public_id || idx}
                onClick={() => setCurrentImageIndex(idx)}
                className={`shrink-0 w-16 h-16 overflow-hidden rounded-lg border-2 transition-all ${
                  currentImageIndex === idx
                    ? 'border-[#EE346C] ring-2 ring-[#EE346C]/20'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <Image
                  src={img.url}
                  alt={`${product.name} - Image ${idx + 1}`}
                  width={64}
                  height={64}
                  className="object-cover w-full h-full"
                />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Right: Product Info */}
      <div className="flex-1 flex flex-col gap-6">
        {/* Title */}
        <div>
          <h1 className="text-2xl font-medium text-[#5E3A1C] mb-2">{product.name}</h1>
          <p className="text-[#5E3A1C] text-sm font-medium">
            {product.description || product.srtDescription || 'No description available'}
          </p>
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
              <p className="text-[#5E3A1C] font-medium">{product.category || 'Tote'}</p>
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