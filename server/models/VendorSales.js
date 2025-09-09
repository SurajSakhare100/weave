import mongoose from 'mongoose';

const VendorSalesSchema = new mongoose.Schema({
  vendorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vendor',
    required: true
  },
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  
  // Sale details
  saleType: {
    type: String,
    enum: ['online', 'offline'],
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: [1, 'Quantity must be at least 1']
  },
  unitPrice: {
    type: Number,
    required: true,
    min: [0, 'Unit price cannot be negative']
  },
  totalAmount: {
    type: Number,
    required: true,
    min: [0, 'Total amount cannot be negative']
  },
  
  // Customer information (optional for offline sales)
  customerName: {
    type: String,
    trim: true
  },
  customerPhone: {
    type: String,
    trim: true
  },
  customerEmail: {
    type: String,
    trim: true,
    lowercase: true
  },
  
  // Online sale reference (if applicable)
  orderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order'
  },
  
  // Offline sale details
  invoiceNumber: {
    type: String,
    trim: true
  },
  paymentMethod: {
    type: String,
    enum: ['cash', 'card', 'upi', 'bank_transfer', 'razorpay', 'stripe', 'other'],
    required: true
  },
  
  // Sale status
  status: {
    type: String,
    enum: ['pending', 'completed', 'cancelled', 'refunded'],
    default: 'completed'
  },
  
  // Dates
  saleDate: {
    type: Date,
    default: Date.now
  },
  
  // Additional metadata
  notes: {
    type: String,
    trim: true,
    maxlength: [500, 'Notes cannot exceed 500 characters']
  },
  
  // Location for offline sales
  saleLocation: {
    type: String,
    trim: true
  },
  
  // Discount applied
  discount: {
    type: Number,
    default: 0,
    min: [0, 'Discount cannot be negative']
  },
  
  // Tax information
  taxAmount: {
    type: Number,
    default: 0,
    min: [0, 'Tax amount cannot be negative']
  },
  
  // Commission for online sales (calculated by system)
  platformCommission: {
    type: Number,
    default: 0,
    min: [0, 'Platform commission cannot be negative']
  },
  
  // Net amount vendor receives
  netAmount: {
    type: Number,
    min: [0, 'Net amount cannot be negative']
  }
  
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better query performance
VendorSalesSchema.index({ vendorId: 1, saleDate: -1 });
VendorSalesSchema.index({ productId: 1 });
VendorSalesSchema.index({ saleType: 1 });
VendorSalesSchema.index({ status: 1 });
VendorSalesSchema.index({ orderId: 1 });
VendorSalesSchema.index({ invoiceNumber: 1 });

// Virtual for profit calculation
VendorSalesSchema.virtual('profit').get(function() {
  return this.netAmount || (this.totalAmount - this.platformCommission - this.taxAmount);
});

// Pre-save middleware to calculate net amount
VendorSalesSchema.pre('save', function(next) {
  // Calculate net amount if not provided
  if (!this.netAmount) {
    this.netAmount = this.totalAmount - this.platformCommission - this.taxAmount;
  }
  
  // Validate total amount matches unit price * quantity - discount
  const expectedTotal = (this.unitPrice * this.quantity) - this.discount;
  if (Math.abs(this.totalAmount - expectedTotal) > 0.01) {
    return next(new Error('Total amount does not match unit price * quantity - discount'));
  }
  
  next();
});

// Static method to get sales summary for a vendor
VendorSalesSchema.statics.getSalesSummary = async function(vendorId, startDate, endDate) {
  const matchStage = {
    vendorId: new mongoose.Types.ObjectId(vendorId),
    status: 'completed'
  };
  
  if (startDate && endDate) {
    matchStage.saleDate = {
      $gte: new Date(startDate),
      $lte: new Date(endDate)
    };
  }
  
  return this.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: '$saleType',
        totalSales: { $sum: '$totalAmount' },
        totalQuantity: { $sum: '$quantity' },
        totalProfit: { $sum: '$netAmount' },
        salesCount: { $sum: 1 },
        averageSaleValue: { $avg: '$totalAmount' }
      }
    }
  ]);
};

// Static method to get daily sales data
VendorSalesSchema.statics.getDailySales = async function(vendorId, days = 30) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  
  return this.aggregate([
    {
      $match: {
        vendorId: new mongoose.Types.ObjectId(vendorId),
        saleDate: { $gte: startDate },
        status: 'completed'
      }
    },
    {
      $group: {
        _id: {
          date: { $dateToString: { format: '%Y-%m-%d', date: '$saleDate' } },
          type: '$saleType'
        },
        totalSales: { $sum: '$totalAmount' },
        totalQuantity: { $sum: '$quantity' },
        salesCount: { $sum: 1 }
      }
    },
    {
      $sort: { '_id.date': 1 }
    }
  ]);
};

const VendorSales = mongoose.model('VendorSales', VendorSalesSchema);

export default VendorSales;
