import React, { useState, useMemo, useEffect } from 'react';
import Image from 'next/image';
import { Heart, Star, Share2, Copy, ChevronLeft, ChevronRight, BarChart3, ChevronDown } from 'lucide-react';
import { ProductWithReviews } from '@/types';
import { toast } from 'sonner';

interface ProductDetailsProps {
  product: ProductWithReviews;
  product_id?: string | number;
  inWishlist: boolean;
  onWishlistToggle: () => void;
  // onAddToCart now receives a detailed payload so cart can differentiate color/size/variant
  onAddToCart: (item: {
    productId: string;
    variantId?: string;
    color?: string;
    colorCode?: string;
    size?: string | null;
    price: number;
    mrp: number;
    quantity?: number;
    name?: string;
    image?: string;
  }) => void;
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
  const [showMoreDetails, setShowMoreDetails] = useState(false);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);

  // Auto-select first color with images when component mounts
  useEffect(() => {
    if (product?.colorVariants && product.colorVariants.length > 0 && !selectedColor) {
      const firstActiveColorWithImages = product.colorVariants.find(variant =>
        variant.isActive &&
        variant.stock > 0 &&
        variant.images &&
        variant.images.length > 0
      );
      if (firstActiveColorWithImages) {
        setSelectedColor(firstActiveColorWithImages.colorName);
      }
    }
  }, [product, selectedColor]);

  // Selected variant object (if any)
  const selectedVariant = useMemo(() => {
    if (!selectedColor || !product?.colorVariants) return null;
    return product.colorVariants.find((v: any) => v.colorName === selectedColor && v.isActive) || null;
  }, [product, selectedColor]);

  // Sizes available for selection - prefer variant-specific sizes, fallback to product.sizes
  const availableSizes = useMemo(() => {
    if (selectedVariant && Array.isArray((selectedVariant as any).sizes) && (selectedVariant as any).sizes.length > 0) {
      return (selectedVariant as any).sizes;
    }
    return Array.isArray(product?.sizes) && product.sizes.length > 0 ? product.sizes : [];
  }, [product, selectedVariant]);
  
  // Get display images based on selected color - only use colorVariants system
  const displayImages = useMemo(() => {
    // If no color selected, use main product images or first color variant's images
    if (!selectedColor) {
      if (product?.images && product.images.length > 0) {
        return product.images;
      }
      // If no main images, use first color variant's images
      if (product?.colorVariants && product.colorVariants.length > 0) {
        const firstVariant = product.colorVariants.find(variant =>
          variant.isActive && variant.images && variant.images.length > 0
        );
        if (firstVariant) {
          return firstVariant.images;
        }
      }
      return [];
    }

    // Find color-specific images from colorVariants
    if (product?.colorVariants && product.colorVariants.length > 0) {
      const sel = product.colorVariants.find(variant =>
        variant.colorName === selectedColor && variant.isActive
      );

      if (sel && sel.images && sel.images.length > 0) {
        return sel.images;
      }
    }

    // If selected color variant has no images, return empty array
    return [];
  }, [product, selectedColor]);

  // reset current image index when images list changes
  useEffect(() => {
    setCurrentImageIndex(0);
  }, [displayImages]);

  // derive primary image url from displayImages + currentIndex with fallbacks
  const getPrimaryImage = () => {
    const imgItem = (displayImages && displayImages.length > 0) ? displayImages[currentImageIndex] : null;

    const resolveUrl = (it: any) => {
      if (!it) return null;
      if (typeof it === 'string') return it;
      if (it.url) return it.url;
      return null;
    };

    const url =
      resolveUrl(imgItem) ||
      resolveUrl(displayImages?.[0]) ||
      (product.primaryImage as string | undefined) ||
      resolveUrl(product.images?.[0]) ||
      '/products/product.png';

    return url;
  };

  // Price/mrp based on selected variant fallback to main product
  const displayPrice = (selectedVariant?.price ?? product.price) as number;
  const displayMrp = (selectedVariant?.mrp ?? product.mrp) as number;

  const calculateDiscount = () => {
    if (!displayMrp || !displayPrice || displayMrp <= displayPrice) return 0;
    return Math.round(((displayMrp - displayPrice) / displayMrp) * 100);
  };

  // helper used by star rendering remains unchanged
  const getStarRating = (rating: number) => {
    return Math.round(rating);
  };

  const handlePreviousImage = () => {
    if (displayImages && displayImages.length > 1) {
      setCurrentImageIndex((prev) => (prev - 1 + displayImages.length) % displayImages.length);
    }
  };

  const handleNextImage = () => {
    if (displayImages && displayImages.length > 1) {
      setCurrentImageIndex((prev) => (prev + 1) % displayImages.length);
    }
  };

  const handleColorSelect = (colorName: string) => {
    setSelectedColor(selectedColor === colorName ? null : colorName);
    setCurrentImageIndex(0); // Reset to first image when color changes
    // reset size selection when color changes (optional but helpful)
    setSelectedSize(null);
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

  // Color variant logic - only use new colorVariants system
  const availableColors = useMemo(() => {
    if (!product?.colorVariants || product.colorVariants.length === 0) return [];

    return product.colorVariants
      .filter(variant => variant.isActive && variant.images && variant.images.length > 0)
      .map(variant => ({
        name: variant.colorName,
        code: variant.colorCode,
        stock: variant.stock,
        isActive: variant.isActive,
        imageCount: variant.images.length
      }));
  }, [product]);

  return (
    <div className="flex flex-col lg:flex-row gap-12">
      {/* Left: Images */}
      <div className="lg:max-w-3xl w-full">
        {/* Main Image */}
        <div className="relative w-full h-[500px] bg-[#FFFBF9] flex items-center justify-center rounded-lg overflow-hidden">
          {displayImages.length > 0 ? (
            <Image
              src={getPrimaryImage()}
              alt={product.name}
              fill
              className="object-contain sm:p-8 p-4 rounded-lg"
            />
          ) : (
            <div className="text-center text-gray-500">
              <p className="text-lg font-medium">No images available</p>
              {selectedColor ? (
                <p className="text-sm mt-1">for the selected color "{selectedColor}"</p>
              ) : (
                <p className="text-sm mt-1">Please select a color to view images</p>
              )}
            </div>
          )}

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
          {displayImages && displayImages.length > 1 && (
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
        </div>

        {/* Thumbnails */}
        {displayImages && displayImages.length > 1 && (
          <div className="flex gap-4 mt-4 justify-start overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {displayImages.map((img: any, idx: number) => {
              const url = typeof img === 'string' ? img : img?.url;
              const key = (img && img.public_id) || url || idx;
              return (
                <button
                  key={key}
                  onClick={() => setCurrentImageIndex(idx)}
                  className={`shrink-0 w-16 h-16 overflow-hidden rounded-lg border-2 transition-all ${
                    currentImageIndex === idx
                      ? 'border-[#EE346C] ring-2 ring-[#EE346C]/20'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <Image
                    src={url || '/products/product.png'}
                    alt={`${product.name} - Image ${idx + 1}`}
                    width={64}
                    height={64}
                    className="object-cover w-full h-full"
                  />
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Right: Product Info */}
      <div className="flex-1 flex flex-col gap-6 lg:max-w-xl">
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

        {/* Color Variants */}
        {availableColors.length > 0 && (
          <div>
            <span className="text-[#5E3A1C] text-sm mb-2 block">
              Color: {selectedColor || 'Select a color'}
            </span>
            <div className="flex gap-2 flex-wrap">
              {availableColors.map(colorVariant => (
                <div key={colorVariant.name} className="relative">
                  <button
                    onClick={() => handleColorSelect(colorVariant.name)}
                    className={`w-8 h-8 rounded-full border-2 ${
                      selectedColor === colorVariant.name
                        ? 'border-[#EE346C] scale-110'
                        : 'border-gray-300 hover:border-[#EE346C]'
                    } ${!colorVariant.isActive || colorVariant.stock <= 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
                    style={{
                      backgroundColor: colorVariant.code || colorVariant.name.toLowerCase(),
                      filter: ['white', 'beige', 'tan', 'yellow'].includes(colorVariant.name.toLowerCase())
                        ? 'brightness(0.9)'
                        : 'none'
                    }}
                    title={`${colorVariant.name} - ${colorVariant.stock} in stock, ${colorVariant.imageCount} images`}
                    disabled={!colorVariant.isActive || colorVariant.stock <= 0}
                  />
                  {/* Image count indicator */}
                  {colorVariant.imageCount > 0 && (
                    <div className="absolute -top-1 -right-1 bg-[#EE346C] text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                      {colorVariant.imageCount}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Stock Status */}
        {selectedColor && availableColors.length > 0 && (
          <div className="text-sm">
            {(() => {
              const selectedVariant = availableColors.find(c => c.name === selectedColor);
              if (selectedVariant) {
                if (selectedVariant.stock <= 0) {
                  return <span className="text-red-600 font-medium">Out of Stock</span>;
                } else if (selectedVariant.stock <= 5) {
                  return <span className="text-orange-600 font-medium">Only {selectedVariant.stock} left in stock</span>;
                } else {
                  return <span className="text-green-600 font-medium">{selectedVariant.stock} in stock</span>;
                }
              }
              return null;
            })()}
          </div>
        )}


{
  availableSizes && availableSizes.length > 0 && (
    <div>
      <span className="text-[#5E3A1C] text-sm mb-2 block">
        Size:
      </span>
      <div className="flex gap-2 flex-wrap">
        {availableSizes.map((size) => (
          <button
            key={size}
            onClick={() => setSelectedSize(selectedSize === size ? null : size)}
            className={`px-3 py-1 border rounded text-sm text-[#5E3A1C] ${
              selectedSize === size ? 'border-[#EE346C] bg-[#FFF4EC] font-medium' : 'border-gray-300 hover:border-[#EE346C]'
            }`}
            title={`Select size ${size}`}
          >
            {size}
          </button>
        ))}
      </div>
    </div>
  )
}
        {/* Price Section */}
        <div>
          <div className="flex items-center gap-4">
            <div className="text-[#B04848] text-2xl font-medium">
              -{calculateDiscount()}%
            </div>
            <div className="text-[#5E3A1C] text-2xl font-bold">
              ₹{Number(displayPrice).toLocaleString('en-IN')}
            </div>

            <div className="bg-[#B59C8A] w-fit text-white px-3 py-1 rounded-md inline-flex items-center gap-2 text-sm">
              <span className="font-medium">Limited Deal</span>
            </div>
          </div>
          {displayMrp > displayPrice && (
            <span className="text-sm text-[#5E3A1C] line-through opacity-70">
              M.R.P.: ₹{Number(displayMrp).toLocaleString('en-IN')}
            </span>
          )}
        </div>

        {/* Note */}
        <div className=''>
          <div className="text-[#EE346C] text-sm sm:text-base pb-2 ">
            Note: We offer worldwide shipping for all orders.
          </div>
          <div className="text-[#5E3A1C] text-sm sm:text-base">
            Delivery expected within the next 3-4 business days to 🇮🇳
          </div>
        </div>

        {/* Buttons */}
        <div className="flex gap-4">
          <button
            onClick={() => {
              // Validate selection: if color variants exist, require color
              if (availableColors.length > 0 && !selectedColor) {
                toast.error('Please select a color before adding to cart');
                return;
              }
              // If product has sizes, require size selection
              if (product.sizes && product.sizes.length > 0 && !selectedSize) {
                toast.error('Please select a size before adding to cart');
                return;
              }

              // Resolve the selected variant object (if any)
              const selVariant = selectedVariant as any;
              const variantId = selVariant?.id ?? selVariant?._id ?? undefined;

              const price = Number(selVariant?.price ?? product.price ?? 0);
              const mrp = Number(selVariant?.mrp ?? product.mrp ?? 0);

              const payload = {
                productId: product?.id ?? (product._id as any),
                variantId,
                color: selectedColor ?? undefined,
                colorCode: selVariant?.colorCode ?? undefined,
                size: selectedSize ?? null,
                // send both keys so server/services accept either naming
                variantSize: selectedSize ?? null,
                price,
                mrp,
                quantity: 1,
                name: product.name,
                image: getPrimaryImage(),
              };

              onAddToCart(payload);
            }}
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

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-5 gap-x-8 text-sm">
            <div>
              <span className="text-[#9B7C62]">Product Weight</span>
              <p className="text-[#5E3A1C] font-medium mt-1">{product.productDetails?.weight || '—'}</p>
            </div>
            <div>
              <span className="text-[#9B7C62]">Dimensions</span>
              <p className="text-[#5E3A1C] font-medium mt-1">{product.productDetails?.dimensions || '—'}</p>
            </div>
            <div>
              <span className="text-[#9B7C62]">Capacity</span>
              <p className="text-[#5E3A1C] font-medium mt-1">{product.productDetails?.capacity || '—'}</p>
            </div>
            <div>
              <span className="text-[#9B7C62]">Materials</span>
              <p className="text-[#5E3A1C] font-medium mt-1">{product.productDetails?.materials || '—'}</p>
            </div>
            <div>
              <span className="text-[#9B7C62]">Product Category</span>
              <p className="text-[#5E3A1C] font-medium mt-1">{product.category || '—'}</p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setShowMoreDetails(v => !v)}
            className="mt-4 inline-flex items-center gap-2 text-[#5E3A1C] font-medium"
          >
            <span>View {showMoreDetails ? 'less' : 'more'}</span>
            <ChevronDown className={`h-4 w-4 transition-transform ${showMoreDetails ? 'rotate-180' : ''}`} />
          </button>

          {showMoreDetails && (
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-y-5 gap-x-8 text-sm">
              {product.tags && product.tags.length > 0 && (
                <div>
                  <span className="text-[#9B7C62]">Tags</span>
                  <p className="text-[#5E3A1C] font-medium mt-1">{product.tags.join(', ')}</p>
                </div>
              )}
              {product.keyFeatures && product.keyFeatures.length > 0 && (
                <div className="sm:col-span-2">
                  <span className="text-[#9B7C62]">Key Features</span>
                  <ul className="mt-2 list-disc pl-5 text-[#5E3A1C] space-y-1">
                    {product.keyFeatures.map((feature, idx) => (
                      <li key={idx} className="font-medium">{feature}</li>
                    ))}
                  </ul>
                </div>
              )}
              {product.vendorId && (typeof product.vendorId === 'object') && (
                <div>
                  <span className="text-[#9B7C62]">Vendor</span>
                  <p className="text-[#5E3A1C] font-medium mt-1">{(product.vendorId as any).name}</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Return Policy */}
        <div className="text-[#5E3A1C] text-sm">
          <p className="text-base font-medium mb-2">Enjoy a worry-free shopping experience.</p>
          <div className="mt-2">
            <div className="flex items-center gap-2 border border-[#E7D9CC] rounded-lg px-4 py-3 bg-[#FFFBF9]">
              <span className="text-lg">🧾</span>
              <span className="font-medium">5 days Return & Exchange</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;