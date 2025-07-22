import React from 'react';
import { Edit, Trash2, Check } from 'lucide-react';

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
  isSelected?: boolean;
  onSelect?: () => void;
  onEdit?: (address: Address) => void;
  onDelete?: (addressId: string) => void;
  onSetDefault?: (addressId: string) => void;
  showActions?: boolean;
  handleContinue?: () => void;
  submitting?: boolean;
}

const AddressCard: React.FC<AddressCardProps> = ({ 
  address, 
  isSelected = false,
  onSelect,
  onEdit, 
  onDelete, 
  onSetDefault,
  showActions = false,
  handleContinue,
  submitting = false
}) => {
  const addressId = address._id || address.id;

  return (
    <div className={`rounded-lg border-2 p-6 mb-4 transition-all duration-200 ${
      isSelected 
        ? 'bg-[#faf5f2] border-[#EE346C] shadow-md' 
        : 'bg-white border-[#e5e7eb] hover:border-[#d1d5db]'
    }`}>
      <div className="flex items-start space-x-4">
        {/* Radio Button */}
        <div className="flex-shrink-0 mt-1">
          <button
            onClick={onSelect}
            className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
              isSelected 
                ? 'border-[#EE346C] bg-[#EE346C]' 
                : 'border-[#d1d5db] bg-white hover:border-[#EE346C]'
            }`}
            aria-label={`Select ${address.name}'s address`}
          >
            {isSelected && (
              <Check className="w-3 h-3 text-white" />
            )}
          </button>
        </div>

        {/* Address Content */}
        <div className="flex-1">
          <div className="flex justify-between items-start mb-3">
            <h3 className="font-semibold text-[#5E3A1C] text-lg">
              {address.name}
            </h3>
            {showActions && (
              <div className="flex items-center space-x-2">
                {onEdit && (
                  <button
                    onClick={() => onEdit(address)}
                    className="p-1 text-[#6b7280] hover:text-[#EE346C] transition-colors"
                    aria-label="Edit address"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                )}
                {onDelete && (
                  <button
                    onClick={() => onDelete(addressId!)}
                    className="p-1 text-[#6b7280] hover:text-red-600 transition-colors"
                    aria-label="Delete address"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Address Details */}
          <div className="text-[#6b7280] space-y-1 mb-4">
            {address.addressLine1 ? (
              <>
                <p className="text-sm">{address.addressLine1}</p>
                {address.addressLine2 && <p className="text-sm">{address.addressLine2}</p>}
              </>
            ) : (
              <>
                <p className="text-sm">{address.address}</p>
                {address.locality && <p className="text-sm">{address.locality}</p>}
              </>
            )}
            <p className="text-sm">{address.city}, {address.state} - {address.pincode || address.pin}</p>
            {address.number && <p className="text-sm">Phone: {address.number}</p>}
          </div>

          {/* Deliver Button for Selected Address */}
          {isSelected && handleContinue && (
            <button
              onClick={handleContinue}
              disabled={submitting}
              className="w-full bg-[#EE346C] text-white font-semibold py-3 px-6 rounded-lg hover:bg-[#c2185b] transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? 'Processing...' : 'Deliver to this address'}
            </button>
          )}

          {/* Set as Default for Unselected Addresses */}
          {!isSelected && onSetDefault && !address.isDefault && (
            <button
              onClick={() => onSetDefault(addressId!)}
              className="text-sm text-[#EE346C] hover:text-[#c2185b] transition-colors underline"
            >
              Set as default
            </button>
          )}

          {/* Default Badge */}
          {address.isDefault && (
            <span className="inline-block bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full mt-2">
              Default
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default AddressCard; 