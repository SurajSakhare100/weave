import React from 'react';
import { Truck, Clock, Shield } from 'lucide-react';

const ShippingPolicy: React.FC = () => {
  return (
    <div className="bg-gray-50 rounded-lg p-6 space-y-4">
      <h3 className="text-lg font-semibold text-gray-900">Shipping Policy</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="flex items-center space-x-3">
          <Truck className="h-5 w-5 text-blue-600" />
          <div>
            <p className="font-medium text-gray-900">Free Shipping</p>
            <p className="text-sm text-gray-600">On orders over ₹500</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <Clock className="h-5 w-5 text-green-600" />
          <div>
            <p className="font-medium text-gray-900">Fast Delivery</p>
            <p className="text-sm text-gray-600">2-5 business days</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <Shield className="h-5 w-5 text-purple-600" />
          <div>
            <p className="font-medium text-gray-900">Secure Packaging</p>
            <p className="text-sm text-gray-600">100% safe delivery</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShippingPolicy; 