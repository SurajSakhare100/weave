import React from 'react';
import { Edit, Trash2 } from 'lucide-react';

interface Address {
  _id?: string;
  id?: string;
  name: string;
  addressLine1?: string;
  addressLine2?: string;
  address?: string;
  locality?: string;
  city: string;
  state: string;
  pincode?: string;
  pin?: string;
  number?: string;
  isDefault?: boolean;
  addressType?: string;
}

interface AddressCardProps {
  address: Address;
  onEdit: (address: Address) => void;
  onDelete: (addressId: string) => void;
  onSetDefault?: (addressId: string) => void;
}

const AddressCard: React.FC<AddressCardProps> = ({ 
  address, 
  onEdit, 
  onDelete, 
  onSetDefault 
}) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="font-semibold text-gray-900">{address.name}</h3>
            {address.isDefault && (
              <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                Default
              </span>
            )}
          </div>
          <div className="text-gray-600 space-y-1">
            {address.addressLine1 ? (
              <>
                <p>{address.addressLine1}</p>
                {address.addressLine2 && <p>{address.addressLine2}</p>}
              </>
            ) : (
              <>
                <p>{address.address}</p>
                {address.locality && <p>{address.locality}</p>}
              </>
            )}
            <p>{address.city}, {address.state} - {address.pincode || address.pin}</p>
            {address.number && <p>Phone: {address.number}</p>}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => onEdit(address)}
            className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
            aria-label="Edit address"
          >
            <Edit className="h-4 w-4" />
          </button>
          <button
            onClick={() => onDelete(address._id)}
            className="p-2 text-gray-400 hover:text-red-600 transition-colors"
            aria-label="Delete address"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>
      {!address.isDefault && onSetDefault && (
        <button
          onClick={() => onSetDefault(address._id)}
          className="text-sm text-blue-600 hover:text-blue-800 transition-colors"
        >
          Set as default
        </button>
      )}
    </div>
  );
};

export default AddressCard; 