import React from 'react';
import { Edit, Trash2, Check } from 'lucide-react';

interface Address {
  _id?: string;
  id?: string;
  firstName: string;
  lastName: string;
  country: string;
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
    <div className={`rounded-xl  p-6 transition-all duration-200 ${isSelected
        ? 'bg-bg-tertiary'
        : 'bg-white '
      }`}>
      <div className="flex items-start space-x-4">
        {/* Radio Button */}
        <div className="flex-shrink-0 mt-1">
          <button
            onClick={onSelect}
            className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${isSelected
                ? 'border-primary '
                : 'border-primary '
              }`}
            aria-label={`Select ${address.firstName} ${address.lastName}'s address`}
          >
            {isSelected && (
              <div className="w-2.5 h-2.5 bg-bg-selected rounded-full cursor-pointer"></div>
            )}
          </button>
        </div>

        {/* Address Content */}
        <div className="flex-1">
          <div className="flex justify-between items-start mb-1 y">
            <h3 className="font-semibold text-primary text-lg">
              {address.firstName} {address.lastName}
            </h3>
            {/* {showActions && (
              <div className="flex items-center space-x-2">
                {onEdit && (
                  <button
                    onClick={() => onEdit(address)}
                    className="p-1 text-gray-500 hover:text-button transition-colors"
                    aria-label="Edit address"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                )}
                {onDelete && (
                  <button
                    onClick={() => onDelete(addressId!)}
                    className="p-1 text-gray-500 hover:text-red-600 transition-colors"
                    aria-label="Delete address"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>
            )} */}
          </div>

          {/* Address Details */}
          <div className="text-primary  mb-4 border-b border-border-tertiary pb-4">
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
          </div>

          {/* Deliver Button for Selected Address */}
          {isSelected && handleContinue && (
            <button
              onClick={handleContinue}
              disabled={submitting}
              className="w-fit bg-bg-button text-white font-semibold py-2 px-12 rounded hover:opacity-90 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? 'Processing...' : 'Deliver to this address'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default AddressCard; 