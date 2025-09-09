import React, { useState, useEffect } from 'react';
import { recordOfflineSale, getVendorProducts } from '@/services/vendorService';

interface SimpleRecordOfflineSaleModalProps {
  open: boolean;
  onClose: () => void;
  onSaleRecorded: () => void;
}

interface Product {
  _id: string;
  name: string;
  price: number;
  stock: number;
  primaryImage?: string;
  category?: string;
}

const SimpleRecordOfflineSaleModal: React.FC<SimpleRecordOfflineSaleModalProps> = ({
  open,
  onClose,
  onSaleRecorded
}) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const [formData, setFormData] = useState({
    quantity: 1,
    customerName: '',
    customerPhone: '',
    customerEmail: '',
    paymentMethod: 'cash',
    discount: 0,
    notes: '',
    invoiceNumber: ''
  });

  useEffect(() => {
    if (open) {
      fetchProducts();
    }
  }, [open]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const response = await getVendorProducts({ limit: 100 });
      setProducts(response.data || []);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedProduct) {
      alert('Please select a product');
      return;
    }

    if (formData.quantity > selectedProduct.stock) {
      alert(`Insufficient stock. Available: ${selectedProduct.stock}`);
      return;
    }

    setSubmitting(true);
    try {
      await recordOfflineSale({
        productId: selectedProduct._id,
        quantity: formData.quantity,
        unitPrice: selectedProduct.price,
        customerName: formData.customerName,
        customerPhone: formData.customerPhone,
        customerEmail: formData.customerEmail,
        paymentMethod: formData.paymentMethod,
        discount: formData.discount,
        notes: formData.notes,
        invoiceNumber: formData.invoiceNumber
      });
      
      alert('Sale recorded successfully!');
      onSaleRecorded();
      handleClose();
    } catch (error: any) {
      console.error('Error recording sale:', error);
      alert(error.response?.data?.message || 'Failed to record sale');
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    setSelectedProduct(null);
    setSearchQuery('');
    setFormData({
      quantity: 1,
      customerName: '',
      customerPhone: '',
      customerEmail: '',
      paymentMethod: 'cash',
      discount: 0,
      notes: '',
      invoiceNumber: ''
    });
    onClose();
  };

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const calculateTotal = () => {
    if (!selectedProduct) return 0;
    return (selectedProduct.price * formData.quantity) - formData.discount;
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Record Offline Sale</h2>
          <button
            onClick={handleClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Product Selection */}
            <div className="space-y-4">
              <h3 className="font-medium text-lg">Select Product</h3>
              
              {/* Search */}
              <div>
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>

              {/* Product List */}
              <div className="max-h-60 overflow-y-auto space-y-2 border rounded-md p-2">
                {loading ? (
                  <div className="text-center py-4">Loading products...</div>
                ) : (
                  filteredProducts.map((product) => (
                    <div
                      key={product._id}
                      className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                        selectedProduct?._id === product._id
                          ? 'border-blue-500 bg-blue-50'
                          : 'hover:border-gray-300'
                      }`}
                      onClick={() => setSelectedProduct(product)}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-medium">{product.name}</h4>
                          <p className="text-sm text-gray-600">{product.category}</p>
                          <p className="text-sm font-medium">₹{product.price}</p>
                          <p className="text-xs text-gray-500">Stock: {product.stock}</p>
                        </div>
                        {product.primaryImage && (
                          <img
                            src={product.primaryImage}
                            alt={product.name}
                            className="w-12 h-12 object-cover rounded"
                          />
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Selected Product Summary */}
              {selectedProduct && (
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <h4 className="font-medium text-blue-900">Selected Product</h4>
                  <p className="text-blue-700">{selectedProduct.name}</p>
                  <p className="text-sm text-blue-600">Price: ₹{selectedProduct.price}</p>
                  <p className="text-sm text-blue-600">Available Stock: {selectedProduct.stock}</p>
                </div>
              )}
            </div>

            {/* Sale Details */}
            <div className="space-y-4">
              <h3 className="font-medium text-lg">Sale Details</h3>

              {/* Quantity */}
              <div>
                <label className="block text-sm font-medium mb-1">Quantity *</label>
                <input
                  type="number"
                  min="1"
                  max={selectedProduct?.stock || 1}
                  value={formData.quantity}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    quantity: parseInt(e.target.value) || 1
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  required
                />
              </div>

              {/* Customer Name */}
              <div>
                <label className="block text-sm font-medium mb-1">Customer Name</label>
                <input
                  type="text"
                  value={formData.customerName}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    customerName: e.target.value
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="Enter customer name"
                />
              </div>

              {/* Customer Phone */}
              <div>
                <label className="block text-sm font-medium mb-1">Customer Phone</label>
                <input
                  type="tel"
                  value={formData.customerPhone}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    customerPhone: e.target.value
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="Enter phone number"
                />
              </div>

              {/* Payment Method */}
              <div>
                <label className="block text-sm font-medium mb-1">Payment Method *</label>
                <select
                  value={formData.paymentMethod}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    paymentMethod: e.target.value
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  required
                >
                  <option value="cash">Cash</option>
                  <option value="card">Card</option>
                  <option value="upi">UPI</option>
                  <option value="bank_transfer">Bank Transfer</option>
                  <option value="other">Other</option>
                </select>
              </div>

              {/* Discount */}
              <div>
                <label className="block text-sm font-medium mb-1">Discount (₹)</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.discount}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    discount: parseFloat(e.target.value) || 0
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>

              {/* Invoice Number */}
              <div>
                <label className="block text-sm font-medium mb-1">Invoice Number</label>
                <input
                  type="text"
                  value={formData.invoiceNumber}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    invoiceNumber: e.target.value
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="Enter invoice number (optional)"
                />
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium mb-1">Notes</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    notes: e.target.value
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  rows={3}
                  placeholder="Additional notes (optional)"
                />
              </div>
            </div>
          </div>

          {/* Total Summary */}
          {selectedProduct && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-medium mb-2">Sale Summary</h3>
              <div className="grid grid-cols-4 gap-4 text-center">
                <div>
                  <p className="text-sm text-gray-600">Unit Price</p>
                  <p className="font-bold">₹{selectedProduct.price}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Quantity</p>
                  <p className="font-bold">{formData.quantity}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Discount</p>
                  <p className="font-bold">₹{formData.discount}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Amount</p>
                  <p className="text-xl font-bold text-green-600">₹{calculateTotal()}</p>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={handleClose}
              disabled={submitting}
              className="px-6 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!selectedProduct || submitting}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400"
            >
              {submitting ? 'Recording...' : 'Record Sale'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SimpleRecordOfflineSaleModal;
