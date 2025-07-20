import MainLayout from '@/components/layout/MainLayout';
import { useState } from 'react';

export default function WholesalePage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    message: '',
    quantity: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert('Thank you for your wholesale inquiry! We will get back to you soon.');
    setFormData({
      name: '',
      email: '',
      phone: '',
      company: '',
      message: '',
      quantity: ''
    });
  };

  return (
    <MainLayout>
      <section className="py-16 bg-[#faf5f2] text-black min-h-screen">
        <div className="max-w-4xl mx-auto px-4">
          <h1 className="text-3xl font-bold text-gray-800 mb-8 text-center">Wholesale & Bulk Inquiry</h1>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Information */}
            <div className="bg-white rounded-2xl shadow p-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-6">Bulk Order Benefits</h2>
              
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="text-3xl">💰</div>
                  <div>
                    <h3 className="font-semibold text-gray-800">Competitive Pricing</h3>
                    <p className="text-gray-600 text-sm">Special wholesale rates for bulk orders</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <div className="text-3xl">🚚</div>
                  <div>
                    <h3 className="font-semibold text-gray-800">Direct Shipping</h3>
                    <p className="text-gray-600 text-sm">Efficient logistics for large orders</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <div className="text-3xl">🎯</div>
                  <div>
                    <h3 className="font-semibold text-gray-800">Custom Solutions</h3>
                    <p className="text-gray-600 text-sm">Tailored products for your business needs</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <div className="text-3xl">🤝</div>
                  <div>
                    <h3 className="font-semibold text-gray-800">Dedicated Support</h3>
                    <p className="text-gray-600 text-sm">Personal account manager for wholesale clients</p>
                  </div>
                </div>
              </div>
              
              <div className="mt-8 p-4 bg-pink-50 rounded-lg">
                <h3 className="font-semibold text-gray-800 mb-2">Minimum Order Requirements</h3>
                <p className="text-sm text-gray-600">
                  Minimum order value: ₹50,000<br/>
                  Lead time: 2-4 weeks<br/>
                  Payment terms: 50% advance, 50% before shipping
                </p>
              </div>
            </div>

            {/* Contact Form */}
            <div className="bg-white rounded-2xl shadow p-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-6">Send Inquiry</h2>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Full Name *</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-pink-500"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Email *</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-pink-500"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Phone *</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-pink-500"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Company Name</label>
                  <input
                    type="text"
                    name="company"
                    value={formData.company}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-pink-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Estimated Quantity</label>
                  <input
                    type="text"
                    name="quantity"
                    value={formData.quantity}
                    onChange={handleInputChange}
                    placeholder="e.g., 1000 pieces"
                    className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-pink-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Message *</label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    rows={4}
                    placeholder="Tell us about your requirements, preferred products, timeline, etc."
                    className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-pink-500"
                    required
                  />
                </div>
                
                <button
                  type="submit"
                  className="w-full bg-pink-500 text-white font-semibold py-3 rounded-lg hover:bg-pink-600 transition-colors"
                >
                  Send Inquiry
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>
    </MainLayout>
  );
} 