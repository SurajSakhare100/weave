import { useState } from 'react';
import Image from 'next/image';
import { Heart, Share2, ChevronLeft, ChevronRight } from 'lucide-react';

const ProductImageGallery = ({ images, productName }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const handlePrev = () => {
    setCurrentIndex((prevIndex) => (prevIndex === 0 ? images.length - 1 : prevIndex - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex === images.length - 1 ? 0 : prevIndex + 1));
  };

  return (
    <div className="w-full">
      <div className="relative">
        <Image
          src={images[currentIndex].src}
          alt={images[currentIndex].alt}
          width={600}
          height={600}
          className="w-full h-auto object-cover rounded-lg"
        />
        <div className="absolute top-4 right-4 flex space-x-2">
          <button className="p-2 rounded-full bg-white/80 hover:bg-white">
            <Heart className="h-6 w-6 text-gray-800" />
          </button>
          <button className="p-2 rounded-full bg-white/80 hover:bg-white">
            <Share2 className="h-6 w-6 text-gray-800" />
          </button>
        </div>
        <button onClick={handlePrev} className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/80 hover:bg-white">
          <ChevronLeft className="h-6 w-6 text-gray-800" />
        </button>
        <button onClick={handleNext} className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/80 hover:bg-white">
          <ChevronRight className="h-6 w-6 text-gray-800" />
        </button>
      </div>
      <div className="flex justify-center space-x-2 mt-4">
        {images.map((image, index) => (
          <div
            key={index}
            className={`w-20 h-20 border-2 rounded-md cursor-pointer ${currentIndex === index ? 'border-pink-500' : 'border-gray-200'}`}
            onClick={() => setCurrentIndex(index)}
          >
            <Image
              src={image.src}
              alt={image.alt}
              width={80}
              height={80}
              className="object-cover w-full h-full rounded"
            />
          </div>
        ))}
        {/* Adding empty placeholders to match UI */}
        {[...Array(Math.max(0, 4 - images.length))].map((_, i) => (
             <div key={`placeholder-${i}`} className="w-20 h-20 border-2 border-gray-200 rounded-md bg-gray-50" />
        ))}
      </div>
    </div>
  );
};

export default ProductImageGallery; 