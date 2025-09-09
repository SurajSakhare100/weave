import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Search, ShoppingCart, AlertCircle } from 'lucide-react';
import { recordOfflineSale } from '@/services/vendorService';
import { getVendorProducts } from '@/services/vendorService';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { toast } from 'react-hot-toast';

interface RecordOfflineSaleModalProps {
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

const RecordOfflineSaleModal: React.FC<RecordOfflineSaleModalProps> = ({
  open,
  onClose,
  onSaleRecorded
}) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    quantity: 1,
    unitPrice: 0,
    customerName: '',
    customerPhone: '',
    customerEmail: '',
    paymentMethod: 'cash',
    discount: 0,
    notes: '',
    saleLocation: '',
    invoiceNumber: ''
  });

  const paymentMethods = [
    { value: 'cash', label: 'Cash' },
    { value: 'card', label: 'Card' },
    { value: 'upi', label: 'UPI' },
    { value: 'bank_transfer', label: 'Bank Transfer' },
    { value: 'other', label: 'Other' }
  ];

  useEffect(() => {
    if (open) {
      fetchProducts();
    }
  }, [open]);

  useEffect(() => {
    if (selectedProduct) {
      setFormData(prev => ({
        ...prev,
        unitPrice: selectedProduct.price
      }));
    }
  }, [selectedProduct]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const response = await getVendorProducts({ 
        limit: 100,
        search: searchQuery,
        status: 'active'
      });
      setProducts(response.data || []);
    } catch (error) {
      console.error('Error fetching products:', error);
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedProduct) {
      toast.error('Please select a product');
      return;
    }

    if (formData.quantity > selectedProduct.stock) {
      toast.error(`Insufficient stock. Available: ${selectedProduct.stock}`);
      return;
    }

    setSubmitting(true);
    try {
      await recordOfflineSale({
        productId: selectedProduct._id,
        ...formData
      });
      
      toast.success('Offline sale recorded successfully!');
      onSaleRecorded();
      handleClose();
    } catch (error: any) {
      console.error('Error recording sale:', error);
      toast.error(error.response?.data?.message || 'Failed to record sale');
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    setSelectedProduct(null);
    setSearchQuery('');
    setFormData({
      quantity: 1,
      unitPrice: 0,
      customerName: '',
      customerPhone: '',
      customerEmail: '',
      paymentMethod: 'cash',
      discount: 0,
      notes: '',
      saleLocation: '',
      invoiceNumber: ''
    });
    onClose();
  };

  const totalAmount = (formData.unitPrice * formData.quantity) - formData.discount;
  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            Record Offline Sale
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Product Selection */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Select Product</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search products..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>

                {/* Product List */}
                <div className="max-h-60 overflow-y-auto space-y-2">
                  {loading ? (
                    <div className="flex justify-center py-4">
                      <LoadingSpinner />
                    </div>
                  ) : filteredProducts.length === 0 ? (
                    <div className="text-center py-4 text-gray-500">
                      No products found
                    </div>
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
                          <div className="flex-1">
                            <h4 className="font-medium">{product.name}</h4>
                            <p className="text-sm text-gray-600">{product.category}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant="outline">₹{product.price}</Badge>
                              <Badge 
                                variant={product.stock > 10 ? "outline" : "destructive"}
                              >
                                Stock: {product.stock}
                              </Badge>
                            </div>
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
                    <div className="flex justify-between items-center mt-2">
                      <span className="text-sm text-blue-600">Price: ₹{selectedProduct.price}</span>
                      <span className="text-sm text-blue-600">Stock: {selectedProduct.stock}</span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Sale Details */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Sale Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Quantity and Price */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="quantity">Quantity *</Label>
                    <Input
                      id="quantity"
                      type="number"
                      min="1"
                      max={selectedProduct?.stock || 1}
                      value={formData.quantity}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        quantity: parseInt(e.target.value) || 1
                      }))}
                      required
                    />
                    {selectedProduct && formData.quantity > selectedProduct.stock && (
                      <p className="text-sm text-red-600 mt-1 flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        Exceeds available stock ({selectedProduct.stock})
                      </p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="unitPrice">Unit Price *</Label>
                    <Input
                      id="unitPrice"
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.unitPrice}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        unitPrice: parseFloat(e.target.value) || 0
                      }))}
                      required
                    />
                  </div>
                </div>

                {/* Payment Method */}
                <div>
                  <Label htmlFor="paymentMethod">Payment Method *</Label>
                  <Select
                    value={formData.paymentMethod}
                    onValueChange={(value) => setFormData(prev => ({
                      ...prev,
                      paymentMethod: value
                    }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {paymentMethods.map((method) => (
                        <SelectItem key={method.value} value={method.value}>
                          {method.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Discount */}
                <div>
                  <Label htmlFor="discount">Discount (₹)</Label>
                  <Input
                    id="discount"
                    type="number"
                    min="0"
                    max={formData.unitPrice * formData.quantity}
                    value={formData.discount}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      discount: parseFloat(e.target.value) || 0
                    }))}
                  />
                </div>

                {/* Total Amount */}
                <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-green-900">Total Amount</span>
                    <span className="text-xl font-bold text-green-900">
                      ₹{totalAmount.toFixed(2)}
                    </span>
                  </div>
                  {formData.discount > 0 && (
                    <div className="text-sm text-green-700 mt-1">
                      Original: ₹{(formData.unitPrice * formData.quantity).toFixed(2)} 
                      | Discount: ₹{formData.discount.toFixed(2)}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Customer Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Customer Information (Optional)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="customerName">Customer Name</Label>
                  <Input
                    id="customerName"
                    value={formData.customerName}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      customerName: e.target.value
                    }))}
                    placeholder="Enter customer name"
                  />
                </div>
                <div>
                  <Label htmlFor="customerPhone">Phone Number</Label>
                  <Input
                    id="customerPhone"
                    value={formData.customerPhone}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      customerPhone: e.target.value
                    }))}
                    placeholder="Enter phone number"
                  />
                </div>
                <div>
                  <Label htmlFor="customerEmail">Email</Label>
                  <Input
                    id="customerEmail"
                    type="email"
                    value={formData.customerEmail}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      customerEmail: e.target.value
                    }))}
                    placeholder="Enter email address"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Additional Details */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Additional Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="invoiceNumber">Invoice Number</Label>
                  <Input
                    id="invoiceNumber"
                    value={formData.invoiceNumber}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      invoiceNumber: e.target.value
                    }))}
                    placeholder="Enter invoice number"
                  />
                </div>
                <div>
                  <Label htmlFor="saleLocation">Sale Location</Label>
                  <Input
                    id="saleLocation"
                    value={formData.saleLocation}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      saleLocation: e.target.value
                    }))}
                    placeholder="Enter sale location"
                  />
                </div>
              </div>
              <div className="mt-4">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    notes: e.target.value
                  }))}
                  placeholder="Additional notes about the sale"
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!selectedProduct || submitting || formData.quantity > (selectedProduct?.stock || 0)}
              className="gap-2"
            >
              {submitting ? (
                <>
                  <LoadingSpinner size="sm" />
                  Recording...
                </>
              ) : (
                'Record Sale'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default RecordOfflineSaleModal;
