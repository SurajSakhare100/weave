import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Search, Package } from 'lucide-react';
import { updateProductStock, getVendorProducts } from '@/services/vendorService';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { toast } from 'react-hot-toast';

interface StockUpdateModalProps {
  open: boolean;
  onClose: () => void;
  onStockUpdated: () => void;
}

const StockUpdateModal: React.FC<StockUpdateModalProps> = ({
  open,
  onClose,
  onStockUpdated
}) => {
  const [products, setProducts] = useState<any[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    quantity: 0,
    movementType: 'in',
    reason: '',
    notes: '',
    unitCost: 0,
    batchNumber: '',
    expiryDate: ''
  });

  const movementTypes = [
    { value: 'in', label: 'Stock In (Purchase/Return)' },
    { value: 'out', label: 'Stock Out (Sale/Transfer)' },
    { value: 'adjustment', label: 'Stock Adjustment' },
    { value: 'damage', label: 'Damaged/Lost' }
  ];

  useEffect(() => {
    if (open) {
      fetchProducts();
    }
  }, [open]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const response = await getVendorProducts({ limit: 100, search: searchQuery });
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
      toast.error('Please select a product');
      return;
    }

    if (!formData.reason.trim()) {
      toast.error('Please provide a reason for the stock update');
      return;
    }

    setSubmitting(true);
    try {
      await updateProductStock(selectedProduct._id, formData);
      toast.success('Stock updated successfully!');
      onStockUpdated();
      handleClose();
    } catch (error: any) {
      console.error('Error updating stock:', error);
      toast.error(error.response?.data?.message || 'Failed to update stock');
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    setSelectedProduct(null);
    setSearchQuery('');
    setFormData({
      quantity: 0,
      movementType: 'in',
      reason: '',
      notes: '',
      unitCost: 0,
      batchNumber: '',
      expiryDate: ''
    });
    onClose();
  };

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const calculateNewStock = () => {
    if (!selectedProduct) return 0;
    const currentStock = selectedProduct.stock || 0;
    
    switch (formData.movementType) {
      case 'in':
        return currentStock + Math.abs(formData.quantity);
      case 'out':
      case 'damage':
        return Math.max(0, currentStock - Math.abs(formData.quantity));
      case 'adjustment':
        return Math.max(0, currentStock + formData.quantity);
      default:
        return currentStock;
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Update Stock
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Product Selection */}
            <Card>
              <CardContent className="p-6 space-y-4">
                <h3 className="font-medium">Select Product</h3>
                
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
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant="outline">Current: {product.stock}</Badge>
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
                      <span className="text-sm text-blue-600">Current Stock: {selectedProduct.stock}</span>
                      <span className="text-sm text-blue-600">New Stock: {calculateNewStock()}</span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Stock Update Details */}
            <Card>
              <CardContent className="p-6 space-y-4">
                <h3 className="font-medium">Stock Update Details</h3>

                {/* Movement Type */}
                <div>
                  <Label htmlFor="movementType">Movement Type *</Label>
                  <Select
                    value={formData.movementType}
                    onValueChange={(value) => setFormData(prev => ({
                      ...prev,
                      movementType: value
                    }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {movementTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Quantity */}
                <div>
                  <Label htmlFor="quantity">Quantity *</Label>
                  <Input
                    id="quantity"
                    type="number"
                    value={formData.quantity}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      quantity: parseInt(e.target.value) || 0
                    }))}
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {formData.movementType === 'adjustment' 
                      ? 'Use positive numbers to add, negative to subtract'
                      : 'Enter the quantity to be moved'
                    }
                  </p>
                </div>

                {/* Reason */}
                <div>
                  <Label htmlFor="reason">Reason *</Label>
                  <Input
                    id="reason"
                    value={formData.reason}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      reason: e.target.value
                    }))}
                    placeholder="e.g., New purchase, Damaged goods, etc."
                    required
                  />
                </div>

                {/* Unit Cost (for stock in) */}
                {formData.movementType === 'in' && (
                  <div>
                    <Label htmlFor="unitCost">Unit Cost (Optional)</Label>
                    <Input
                      id="unitCost"
                      type="number"
                      step="0.01"
                      value={formData.unitCost}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        unitCost: parseFloat(e.target.value) || 0
                      }))}
                      placeholder="Enter cost per unit"
                    />
                  </div>
                )}

                {/* Batch Number */}
                <div>
                  <Label htmlFor="batchNumber">Batch Number (Optional)</Label>
                  <Input
                    id="batchNumber"
                    value={formData.batchNumber}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      batchNumber: e.target.value
                    }))}
                    placeholder="Enter batch number"
                  />
                </div>

                {/* Expiry Date */}
                <div>
                  <Label htmlFor="expiryDate">Expiry Date (Optional)</Label>
                  <Input
                    id="expiryDate"
                    type="date"
                    value={formData.expiryDate}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      expiryDate: e.target.value
                    }))}
                  />
                </div>

                {/* Notes */}
                <div>
                  <Label htmlFor="notes">Additional Notes</Label>
                  <Textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      notes: e.target.value
                    }))}
                    placeholder="Any additional information about this stock movement"
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Stock Summary */}
          {selectedProduct && (
            <Card>
              <CardContent className="p-6">
                <h3 className="font-medium mb-4">Stock Summary</h3>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600">Current Stock</p>
                    <p className="text-xl font-bold">{selectedProduct.stock}</p>
                  </div>
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <p className="text-sm text-gray-600">Movement</p>
                    <p className="text-xl font-bold text-blue-600">
                      {formData.movementType === 'out' || formData.movementType === 'damage' ? '-' : '+'}
                      {Math.abs(formData.quantity)}
                    </p>
                  </div>
                  <div className="p-4 bg-green-50 rounded-lg">
                    <p className="text-sm text-gray-600">New Stock</p>
                    <p className="text-xl font-bold text-green-600">{calculateNewStock()}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

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
              disabled={!selectedProduct || submitting || !formData.reason.trim()}
              className="gap-2"
            >
              {submitting ? (
                <>
                  <LoadingSpinner size="sm" />
                  Updating...
                </>
              ) : (
                'Update Stock'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default StockUpdateModal;
