import { ShieldCheck } from 'lucide-react';

const ShippingPolicy = () => {
  return (
    <div className=" p-4 rounded-lg mt-4">
      <h3 className="font-bold text-lg mb-3">Enjoy a worry-free shopping experience.</h3>
      <div className="border border-gray-700 rounded-md p-3 flex items-center">
        <ShieldCheck className="h-5 w-5 mr-3 text-gray-400" />
        <span className="text-sm">5 days Return & Exchange</span>
      </div>
    </div>
  );
};

export default ShippingPolicy; 