import { useState } from 'react';
import Image from 'next/image';
import { Heart, Share2, ChevronLeft, ChevronRight } from 'lucide-react';
import { getGalleryImages, getOptimizedImageUrl } from '../../utils/imageUtils';

const ProductImageGallery = ({ images, legacyFiles, productName }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Get gallery images with fallback support
  const galleryImages = getGalleryImages(images, legacyFiles);

  if (!galleryImages || galleryImages.length === 0) {
    return (
      <div className="w-full">
        <div className="relative">
          <Image
            src="/products/product.png"
            alt={productName || 'Product'}
            width={600}
            height={600}
            className="w-full h-auto object-cover rounded-lg"
          />
        </div>
        <div className="flex justify-center space-x-2 mt-4">
          <div className="w-20 h-20 border-2 border-gray-200 rounded-md bg-gray-50" />
        </div>
      </div>
    );
  }

  const handlePrev = () => {
    setCurrentIndex((prevIndex) => (prevIndex === 0 ? galleryImages.length - 1 : prevIndex - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex === galleryImages.length - 1 ? 0 : prevIndex + 1));
  };

  const currentImage = galleryImages[currentIndex];

  return (
    <div className="w-full">
      <div className="relative">
        <Image
          src={getOptimizedImageUrl(currentImage.src, { width: 800, height: 800, quality: 85 })}
          alt={currentImage.alt}
          width={600}
          height={600}
          className="w-full h-auto object-cover rounded-lg"
          onError={(e) => {
            e.currentTarget.src = '/products/product.png';
          }}
        />
        <div className="absolute top-4 right-4 flex space-x-2">
          <button className="p-2 rounded-full bg-white/80 hover:bg-white transition-colors">
            <Heart className="h-6 w-6 text-gray-800" />
          </button>
          <button className="p-2 rounded-full bg-white/80 hover:bg-white transition-colors">
            <Share2 className="h-6 w-6 text-gray-800" />
          </button>
        </div>
        
        {/* Navigation arrows - only show if there are multiple images */}
        {galleryImages.length > 1 && (
          <>
            <button 
              onClick={handlePrev} 
              className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/80 hover:bg-white transition-colors"
            >
              <ChevronLeft className="h-6 w-6 text-gray-800" />
            </button>
            <button 
              onClick={handleNext} 
              className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/80 hover:bg-white transition-colors"
            >
              <ChevronRight className="h-6 w-6 text-gray-800" />
            </button>
          </>
        )}
      </div>
      
      {/* Thumbnail navigation */}
      <div className="flex justify-center space-x-2 mt-4">
        {galleryImages.map((image, index) => (
          <div
            key={index}
            className={`w-20 h-20 border-2 rounded-md cursor-pointer transition-all ${
              currentIndex === index 
                ? 'border-pink-500 shadow-md' 
                : 'border-gray-200 hover:border-gray-300'
            }`}
            onClick={() => setCurrentIndex(index)}
          >
            <Image
              src={getOptimizedImageUrl(image.thumbnail, { width: 80, height: 80, quality: 75 })}
              alt={image.alt}
              width={80}
              height={80}
              className="object-cover w-full h-full rounded"
              onError={(e) => {
                e.currentTarget.src = '/products/product.png';
              }}
            />
          </div>
        ))}
        
        {/* Add empty placeholders to maintain consistent layout */}
        {[...Array(Math.max(0, 4 - galleryImages.length))].map((_, i) => (
          <div key={`placeholder-${i}`} className="w-20 h-20 border-2 border-gray-200 rounded-md bg-gray-50" />
        ))}
      </div>
      
      {/* Image counter */}
      {galleryImages.length > 1 && (
        <div className="text-center mt-2 text-sm text-gray-600">
          {currentIndex + 1} of {galleryImages.length}
        </div>
      )}
    </div>
  );
};

export default ProductImageGallery; 