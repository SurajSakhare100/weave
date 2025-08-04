import MainLayout from '@/components/layout/MainLayout';
import { useState } from 'react';

export default function WholesalePage() {
  const [formData, setFormData] = useState({
    businessName: '',
    email: '',
    quantity: '',
    products: '',
    city: '',
    orderType: 'bulk',
    mobile: '',
    state: 'Maharashtra'
  });

  const [errors, setErrors] = useState<{[key: string]: string}>({});

  const states = [
    'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
    'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
    'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
    'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
    'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal'
  ];

  const quantityOptions = [
    '50-100 units',
    '100-500 units', 
    '500-1000 units',
    '1000-5000 units',
    '5000+ units'
  ];

  const productOptions = [
    'Traditional Wear',
    'Western Wear',
    'Accessories',
    'Home Decor',
    'Jewelry',
    'Footwear',
    'All Products'
  ];

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};

    if (!formData.businessName.trim()) {
      newErrors.businessName = 'Business name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.mobile.trim()) {
      newErrors.mobile = 'Mobile number is required';
    } else if (!/^\d{10}$/.test(formData.mobile.replace(/\s/g, ''))) {
      newErrors.mobile = 'Please enter a valid 10-digit mobile number';
    }

    if (!formData.quantity) {
      newErrors.quantity = 'Quantity is required';
    }

    if (!formData.products) {
      newErrors.products = 'Product selection is required';
    }

    if (!formData.city.trim()) {
      newErrors.city = 'City is required';
    }

    if (!formData.state) {
      newErrors.state = 'State is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ''
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    // Here you would typically send the data to your backend
    console.log('Wholesale inquiry submitted:', formData);
    
    alert('Thank you for your wholesale inquiry! We will get back to you within 24 hours.');
    
    // Reset form
    setFormData({
      businessName: '',
      email: '',
      quantity: '',
      products: '',
      city: '',
      orderType: 'bulk',
      mobile: '',
      state: 'Maharashtra'
    });
    setErrors({});
  };

  return (
    <MainLayout>
      <section className="py-8 sm:py-12 lg:py-16 bg-[#faf5f2] text-black min-h-screen">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-8 sm:mb-12">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-800 mb-3 sm:mb-4">Wholesale & Bulk Inquiry</h1>
            <p className="text-base sm:text-lg text-gray-600">Request a Bulk Purchase or Wholesale Deal</p>
          </div>
          
          <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6 lg:p-8">
            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
                {/* Left Column */}
                <div className="space-y-4 sm:space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Business Name / Store Name *
                    </label>
                    <input
                      type="text"
                      name="businessName"
                      value={formData.businessName}
                      onChange={handleInputChange}
                      className={`w-full border rounded-lg px-3 sm:px-4 py-2.5 sm:py-3 focus:outline-none focus:ring-2 focus:ring-pink-500 text-sm sm:text-base ${
                        errors.businessName ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Enter your business name"
                    />
                    {errors.businessName && (
                      <p className="text-red-500 text-xs sm:text-sm mt-1">{errors.businessName}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className={`w-full border rounded-lg px-3 sm:px-4 py-2.5 sm:py-3 focus:outline-none focus:ring-2 focus:ring-pink-500 text-sm sm:text-base ${
                        errors.email ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="example@example.com"
                    />
                    <p className="text-xs sm:text-sm text-gray-500 mt-1">
                      Note: Enter a valid email address (e.g., example@example.com).
                    </p>
                    {errors.email && (
                      <p className="text-red-500 text-xs sm:text-sm mt-1">{errors.email}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Quantity Required *
                    </label>
                    <select
                      name="quantity"
                      value={formData.quantity}
                      onChange={handleInputChange}
                      className={`w-full border rounded-lg px-3 sm:px-4 py-2.5 sm:py-3 focus:outline-none focus:ring-2 focus:ring-pink-500 text-sm sm:text-base ${
                        errors.quantity ? 'border-red-500' : 'border-gray-300'
                      }`}
                    >
                      <option value="">Select quantity range</option>
                      {quantityOptions.map((option) => (
                        <option key={option} value={option}>{option}</option>
                      ))}
                    </select>
                    {errors.quantity && (
                      <p className="text-red-500 text-xs sm:text-sm mt-1">{errors.quantity}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Product(s) Interested In *
                    </label>
                    <select
                      name="products"
                      value={formData.products}
                      onChange={handleInputChange}
                      className={`w-full border rounded-lg px-3 sm:px-4 py-2.5 sm:py-3 focus:outline-none focus:ring-2 focus:ring-pink-500 text-sm sm:text-base ${
                        errors.products ? 'border-red-500' : 'border-gray-300'
                      }`}
                    >
                      <option value="">Select products</option>
                      {productOptions.map((option) => (
                        <option key={option} value={option}>{option}</option>
                      ))}
                    </select>
                    {errors.products && (
                      <p className="text-red-500 text-xs sm:text-sm mt-1">{errors.products}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      City name *
                    </label>
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      className={`w-full border rounded-lg px-3 sm:px-4 py-2.5 sm:py-3 focus:outline-none focus:ring-2 focus:ring-pink-500 text-sm sm:text-base ${
                        errors.city ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Enter your city"
                    />
                    {errors.city && (
                      <p className="text-red-500 text-xs sm:text-sm mt-1">{errors.city}</p>
                    )}
                  </div>
                </div>

                {/* Right Column */}
                <div className="space-y-4 sm:space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Order Type
                    </label>
                    <div className="space-y-3">
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="orderType"
                          value="bulk"
                          checked={formData.orderType === 'bulk'}
                          onChange={handleInputChange}
                          className="mr-3 text-pink-500 focus:ring-pink-500"
                        />
                        <span className="text-gray-700 text-sm sm:text-base">Bulk Purchase</span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="orderType"
                          value="wholesale"
                          checked={formData.orderType === 'wholesale'}
                          onChange={handleInputChange}
                          className="mr-3 text-pink-500 focus:ring-pink-500"
                        />
                        <span className="text-gray-700 text-sm sm:text-base">Wholesale Deal</span>
                      </label>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Mobile number *
                    </label>
                    <p className="text-xs sm:text-sm text-gray-500 mb-2">
                      Note: Enter a 10-digit mobile number (e.g., 9876543210).
                    </p>
                    <input
                      type="tel"
                      name="mobile"
                      value={formData.mobile}
                      onChange={handleInputChange}
                      className={`w-full border rounded-lg px-3 sm:px-4 py-2.5 sm:py-3 focus:outline-none focus:ring-2 focus:ring-pink-500 text-sm sm:text-base ${
                        errors.mobile ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="9876543210"
                      maxLength={10}
                    />
                    {errors.mobile && (
                      <p className="text-red-500 text-xs sm:text-sm mt-1">{errors.mobile}</p>
                    )}
                  </div>

                  <div className="bg-pink-50 border border-pink-200 rounded-lg p-3 sm:p-4">
                    <p className="text-xs sm:text-sm text-pink-700 font-medium">
                      Note: A minimum quantity of 50 units is required per order.
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      State *
                    </label>
                    <select
                      name="state"
                      value={formData.state}
                      onChange={handleInputChange}
                      className={`w-full border rounded-lg px-3 sm:px-4 py-2.5 sm:py-3 focus:outline-none focus:ring-2 focus:ring-pink-500 text-sm sm:text-base ${
                        errors.state ? 'border-red-500' : 'border-gray-300'
                      }`}
                    >
                      {states.map((state) => (
                        <option key={state} value={state}>{state}</option>
                      ))}
                    </select>
                    {errors.state && (
                      <p className="text-red-500 text-xs sm:text-sm mt-1">{errors.state}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Additional Notes */}
              <div className="border-t pt-4 sm:pt-6">
                <div className="space-y-2">
                  <p className="text-pink-600 text-xs sm:text-sm">
                    Note: We accept bulk orders for weddings, customized orders, corporate gifts, and events, as well as wholesale inquiries.
                  </p>
                  <p className="text-pink-600 text-xs sm:text-sm">
                    Worldwide shipping is available.
                  </p>
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex justify-center pt-4 sm:pt-6">
                <button
                  type="submit"
                  className="bg-pink-500 text-white font-semibold py-2.5 sm:py-3 px-6 sm:px-8 rounded-lg hover:bg-pink-600 transition-colors text-base sm:text-lg w-full sm:w-auto"
                >
                  Continue
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>
    </MainLayout>
  );
} 