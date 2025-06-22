import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

const ProductDetails = ({ details }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className=" p-4 rounded-lg mt-4">
      <h3 className="font-bold text-lg mb-4">Product Details</h3>
      <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
        <div>
          <p className="text-gray-400">Product Weight</p>
          <p className="font-medium">{details.weight}</p>
        </div>
        <div>
          <p className="text-gray-400">Dimensions</p>
          <p className="font-medium">{details.dimensions}</p>
        </div>
        <div>
          <p className="text-gray-400">Capacity</p>
          <p className="font-medium">{details.capacity}</p>
        </div>
        <div>
          <p className="text-gray-400">Materials</p>
          <p className="font-medium">{details.materials}</p>
        </div>
        <div>
          <p className="text-gray-400">Product Category</p>
          <p className="font-medium">{details.category}</p>
        </div>
      </div>
      <button 
        onClick={() => setIsExpanded(!isExpanded)} 
        className="text-center w-full mt-4 flex items-center justify-center text-pink-500"
      >
        <span>View more</span>
        <ChevronDown className={`h-5 w-5 ml-1 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
      </button>
    </div>
  );
};

export default ProductDetails; 