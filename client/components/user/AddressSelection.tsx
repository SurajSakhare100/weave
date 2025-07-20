import React, { useState } from 'react';
import { ChevronRight } from 'lucide-react';

interface Address {
  id: string;
  name: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  pincode: string;
}

const addresses: Address[] = [
  {
    id: "1",
    name: "Snehal Dinde",
    addressLine1: "17B, Orchid Residency",
    addressLine2: "Link Road, Malad West",
    city: "Mumbai",
    state: "Maharashtra",
    pincode: "400064",
  },
  {
    id: "2",
    name: "Rohit Sharma",
    addressLine1: "Flat No. 402, Aster Heights",
    addressLine2: "Palm Grove Road, Indiranagar",
    city: "Bangalore",
    state: "Karnataka",
    pincode: "560038",
  },
  {
    id: "3",
    name: "Amit Desai",
    addressLine1: "Plot No. 11, Sunrise Enclave",
    addressLine2: "Sector 45, Near Metro Station",
    city: "Gurgaon",
    state: "Haryana",
    pincode: "122003",
  },
];

const AddressSelection: React.FC = () => {
  const [selectedAddress, setSelectedAddress] = useState("1");

  const handleAddressSelect = (addressId: string) => {
    setSelectedAddress(addressId);
  };

  const handleDelivery = (address: Address) => {
    // Handle delivery to this address
    console.log(`Delivering to ${address.name}`);
  };

  const handleAddNewAddress = () => {
    // Handle adding new address
    console.log("Add new address");
  };

  return (
    <div className="min-h-screen bg-[#faf9f7] p-6">
      <div className="max-w-2xl mx-auto">
        {/* Breadcrumb */}
        <nav className="flex items-center space-x-2 text-sm mb-12">
          <span className="text-[#8b7355] hover:text-[#6b5635] cursor-pointer">Home</span>
          <ChevronRight className="h-4 w-4 text-[#8b7355]" />
          <span className="text-[#8b7355] hover:text-[#6b5635] cursor-pointer">Cart</span>
          <ChevronRight className="h-4 w-4 text-[#8b7355]" />
          <span className="text-[#8b7355]">Select Address</span>
        </nav>

        {/* Address Selection */}
        <div className="space-y-8">
          {addresses.map((address) => (
            <div key={address.id} className="relative">
              <div className="flex items-start space-x-4">
                {/* Custom Radio Button */}
                <button 
                  onClick={() => handleAddressSelect(address.id)} 
                  className="mt-1 flex-shrink-0"
                >
                  <div className="w-5 h-5 rounded-full border-2 border-[#8b7355] flex items-center justify-center">
                    {selectedAddress === address.id && (
                      <div className="w-3 h-3 rounded-full bg-[#8b7355]"></div>
                    )}
                  </div>
                </button>

                {/* Address Content */}
                <div 
                  className="flex-1 cursor-pointer" 
                  onClick={() => handleAddressSelect(address.id)}
                >
                  <h3 className="font-medium text-xl text-[#8b7355] mb-1">{address.name}</h3>
                  <div className="text-[#8b7355] space-y-0.5 leading-relaxed">
                    <p>{address.addressLine1}</p>
                    {address.addressLine2 && <p>{address.addressLine2}</p>}
                    <p>
                      {address.city}, {address.state} – {address.pincode}
                    </p>
                  </div>
                </div>
              </div>

              {/* Deliver Button - only show for selected address */}
              {selectedAddress === address.id && (
                <div className="mt-6 ml-9">
                  <button
                    className="bg-[#e91e63] hover:bg-[#c2185b] text-white px-6 py-2.5 rounded-md font-medium transition-colors"
                    onClick={() => handleDelivery(address)}
                  >
                    Deliver to this address
                  </button>
                </div>
              )}

              {/* Subtle separator line */}
              {address.id !== "3" && <div className="mt-8 border-b border-[#e8e2d5]"></div>}
            </div>
          ))}
        </div>

        {/* Add New Address Link */}
        <div className="mt-16 text-center">
          <button
            className="text-[#e91e63] hover:text-[#c2185b] font-medium text-lg underline underline-offset-2 transition-colors"
            onClick={handleAddNewAddress}
          >
            Add Delivery Address
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddressSelection; 