import React, { useState, useEffect } from 'react';
import { Loader2, Save, X } from 'lucide-react';

interface Address {
  _id?: string;
  id?: string;
  firstName: string;
  lastName: string;
  number: string;
  pin: string;
  locality: string;
  address: string;
  city: string;
  state: string;
  country: string;
  addressType?: string;
  isDefault?: boolean;
}

interface AddressFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (address: Address) => void;
  address?: Address | null;
  loading?: boolean;
}

const AddressFormModal: React.FC<AddressFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  address,
  loading = false
}) => {
  const [formData, setFormData] = useState<Address>({
    firstName: '',
    lastName: '',
    number: '',
    pin: '',
    locality: '',
    address: '',
    city: '',
    state: '',
    country: 'India',
    addressType: 'Home',
    isDefault: false
  });

  const [errors, setErrors] = useState<Partial<Address>>({});

  useEffect(() => {
    if (address) {
      setFormData(address);
    } else {
      setFormData({
        firstName: '',
        lastName: '',
        number: '',
        pin: '',
        locality: '',
        address: '',
        city: '',
        state: '',
        country: 'India',
        addressType: 'Home',
        isDefault: false
      });
    }
    setErrors({});
  }, [address, isOpen]);

  const validateForm = () => {
    const newErrors: Partial<Address> = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }

    if (!formData.number.trim()) {
      newErrors.number = 'Mobile number is required';
    }

    if (!formData.address.trim()) {
      newErrors.address = 'Address is required';
    }

    if (!formData.locality.trim()) {
      newErrors.locality = 'Area, street, sector is required';
    }

    if (!formData.city.trim()) {
      newErrors.city = 'Town/City is required';
    }

    if (!formData.state.trim()) {
      newErrors.state = 'State is required';
    }

    if (!formData.pin.trim()) {
      newErrors.pin = 'Pincode is required';
    } else if (!/^\d{6}$/.test(formData.pin)) {
      newErrors.pin = 'Pincode must be 6 digits';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    if (errors[name as keyof Address]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }
  };

  if (!isOpen) return null;

  return (
    <div className='fixed inset-0 z-50 h-full flex items-center justify-center text-primary'>
      <div className='fixed inset-0 bg-[#F0F0F0] opacity-20 z-10'>

      </div>
      {/* Modal/Form container */}
      <div className="relative bg-gradient-to-b from-[#5E3A1C] to-[#FCFCFC] rounded-xl md:h-[98%] w-full md:w-[400px] mx-auto h-full flex flex-col items-center justify-center gap-2 z-50 p-4 border border-border-border-tertiary">
      {/* Close button outside modal */}
      <button
        onClick={onClose}
        className="self-end top-6 right-6 text-white hover:text-gray-200 transition-colors z-10"
        disabled={loading}
      >
        <X className="h-6 w-6 cursor-pointer" />
      </button>
      
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md h-full overflow-y-auto">
        {/* Header */}
        <div className="py-4 px-6 ">
          <h2 className="text-lg font-semibold text-primary">
            Add Delivery Address
          </h2>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-6 space-y-4">
          {/* Country */}
          <div>
            <label className="block text-sm font-medium text-primary mb-2">
              Country
            </label>
            <select
              name="country"
              value={formData.country}
              onChange={handleInputChange}
              className="w-full px-3 py-2.5 border border-border-tertiary rounded focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="India">India</option>
            </select>
          </div>

          {/* First Name */}
          <div>
            <label className="block text-sm font-medium text-primary mb-2">
              First name
            </label>
            <input
              type="text"
              name="firstName"
              value={formData.firstName}
              onChange={handleInputChange}
              className={`w-full px-3 py-2.5 border rounded focus:outline-none focus:ring-2 focus:ring-primary ${
                errors.firstName ? 'border-red-300' : 'border-border-tertiary'
              }`}
              placeholder="First name"
            />
            {errors.firstName && (
              <p className="mt-1 text-sm text-red-600">{errors.firstName}</p>
            )}
          </div>

          {/* Last Name */}
          <div>
            <label className="block text-sm font-medium text-primary mb-2">
              Last name
            </label>
            <input
              type="text"
              name="lastName"
              value={formData.lastName}
              onChange={handleInputChange}
              className={`w-full px-3 py-2.5 border rounded focus:outline-none focus:ring-2 focus:ring-primary ${
                errors.lastName ? 'border-red-300' : 'border-border-tertiary'
              }`}
              placeholder="Last name"
            />
            {errors.lastName && (
              <p className="mt-1 text-sm text-red-600">{errors.lastName}</p>
            )}
          </div>

          {/* Mobile Number */}
          <div>
            <label className="block text-sm font-medium text-primary mb-2">
              Mobile number
            </label>
            <input
              type="tel"
              name="number"
              value={formData.number}
              onChange={handleInputChange}
              className={`w-full px-3 py-2.5 border rounded focus:outline-none focus:ring-2 focus:ring-primary ${
                errors.number ? 'border-red-300' : 'border-border-tertiary'
              }`}
              placeholder="Mobile number"
            />
            {errors.number && (
              <p className="mt-1 text-sm text-red-600">{errors.number}</p>
            )}
          </div>

          {/* Flat, House no., Building */}
          <div>
            <label className="block text-sm font-medium text-primary mb-2">
              Flat, House no., Building
            </label>
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleInputChange}
              className={`w-full px-3 py-2.5 border rounded focus:outline-none focus:ring-2 focus:ring-primary ${
                errors.address ? 'border-red-300' : 'border-border-tertiary'
              }`}
              placeholder="Flat, House no., Building"
            />
            {errors.address && (
              <p className="mt-1 text-sm text-red-600">{errors.address}</p>
            )}
          </div>

          {/* Area, street, sector */}
          <div>
            <label className="block text-sm font-medium text-primary mb-2">
              Area, street, sector
            </label>
            <input
              type="text"
              name="locality"
              value={formData.locality}
              onChange={handleInputChange}
              className={`w-full px-3 py-2.5 border rounded focus:outline-none focus:ring-2 focus:ring-primary ${
                errors.locality ? 'border-red-300' : 'border-border-tertiary'
              }`}
              placeholder="Area, street, sector"
            />
            {errors.locality && (
              <p className="mt-1 text-sm text-red-600">{errors.locality}</p>
            )}
          </div>

          {/* State */}
          <div>
            <label className="block text-sm font-medium text-primary mb-2">
              State
            </label>
            <select
              name="state"
              value={formData.state}
              onChange={handleInputChange}
              className={`w-full px-3 py-2.5 border rounded focus:outline-none focus:ring-2 focus:ring-primary text-primary bg-white h-10 ${
                errors.state ? 'border-red-300' : 'border-border-tertiary'
              }`}
            >
              <option value="">Select State</option>
              <option value="Maharashtra">Maharashtra</option>
              <option value="Delhi">Delhi</option>
              <option value="Karnataka">Karnataka</option>
              <option value="Tamil Nadu">Tamil Nadu</option>
              <option value="Telangana">Telangana</option>
              <option value="Gujarat">Gujarat</option>
              <option value="West Bengal">West Bengal</option>
              <option value="Uttar Pradesh">Uttar Pradesh</option>
              <option value="Kerala">Kerala</option>
              <option value="Rajasthan">Rajasthan</option>
              <option value="Andhra Pradesh">Andhra Pradesh</option>
              <option value="Madhya Pradesh">Madhya Pradesh</option>
              <option value="Haryana">Haryana</option>
              <option value="Punjab">Punjab</option>
              <option value="Bihar">Bihar</option>
              <option value="Odisha">Odisha</option>
              <option value="Assam">Assam</option>
              <option value="Jharkhand">Jharkhand</option>
              <option value="Chhattisgarh">Chhattisgarh</option>
              <option value="Uttarakhand">Uttarakhand</option>
              <option value="Himachal Pradesh">Himachal Pradesh</option>
              <option value="Tripura">Tripura</option>
              <option value="Meghalaya">Meghalaya</option>
              <option value="Manipur">Manipur</option>
              <option value="Nagaland">Nagaland</option>
              <option value="Goa">Goa</option>
              <option value="Arunachal Pradesh">Arunachal Pradesh</option>
              <option value="Mizoram">Mizoram</option>
              <option value="Sikkim">Sikkim</option>
            </select>
            {errors.state && (
              <p className="mt-1 text-sm text-red-600">{errors.state}</p>
            )}
          </div>

          {/* Pincode and City */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-primary mb-2">
                Pincode
              </label>
              <input
                type="text"
                name="pin"
                value={formData.pin}
                onChange={handleInputChange}
                className={`w-full px-3 py-2.5 border rounded focus:outline-none focus:ring-2 focus:ring-primary ${
                  errors.pin ? 'border-red-300' : 'border-border-tertiary'
                }`}
                placeholder="Pincode"
                maxLength={6}
              />
              {errors.pin && (
                <p className="mt-1 text-sm text-red-600">{errors.pin}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-primary mb-2">
                Town/City
              </label>
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleInputChange}
                className={`w-full px-3 py-2.5 border rounded focus:outline-none focus:ring-2 focus:ring-primary ${
                  errors.city ? 'border-red-300' : 'border-border-tertiary'
                }`}
                placeholder="Town/City"
              />
              {errors.city && (
                <p className="mt-1 text-sm text-red-600">{errors.city}</p>
              )}
            </div>
          </div>

          {/* Address Type */}
          <div>
            <label className="block text-sm font-medium text-primary mb-3">
              Address Type
            </label>
            <div className="flex  items-center gap-2">
              <label className="flex w-full items-center gap-2 p-3 border border-border-tertiary rounded cursor-pointer hover:bg-gray-50">
                <input
                  type="radio"
                  name="addressType"
                  value="Home"
                  checked={formData.addressType === 'Home'}
                  onChange={handleInputChange}
                  className="h-4 w-4 accent-primary  text-primary focus:ring-primary border-border-tertiary"
                />
                <span className="ml-3 text-primary font-medium">Home</span>
              </label>
              <label className="flex w-full items-center p-3 border border-border-tertiary rounded cursor-pointer hover:bg-gray-50">
                <input
                  type="radio"
                  name="addressType"
                  value="Work"
                  checked={formData.addressType === 'Work'}
                  onChange={handleInputChange}
                  className="h-4 w-4 accent-primary focus:ring-primary border-border-tertiary"
                />
                <span className="ml-3 text-primary font-medium">Work</span>
              </label>
            </div>
            {errors.addressType && (
              <p className="mt-1 text-sm text-red-600">{errors.addressType}</p>
            )}
          </div>

          {/* Continue Button */}
          <div className="pt-2 pb-4">
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-bg-button text-white font-semibold py-3 px-6 rounded hover:opacity-90 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Processing...' : 'Continue'}
            </button>
          </div>
        </form>
      </div>
    </div>
    </div>
  );
};

export default AddressFormModal; 