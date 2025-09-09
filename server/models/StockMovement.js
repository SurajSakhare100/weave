import mongoose from 'mongoose';

const StockMovementSchema = new mongoose.Schema({
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
  
  // Movement details
  movementType: {
    type: String,
    enum: ['in', 'out', 'adjustment', 'return', 'damage', 'transfer'],
    required: true
  },
  quantity: {
    type: Number,
    required: true
  },
  
  // Stock levels
  previousStock: {
    type: Number,
    required: true,
    min: [0, 'Previous stock cannot be negative']
  },
  newStock: {
    type: Number,
    required: true,
    min: [0, 'New stock cannot be negative']
  },
  
  // Reference information
  referenceType: {
    type: String,
    enum: ['purchase', 'sale', 'manual', 'return', 'damage', 'transfer'],
    required: true
  },
  referenceId: {
    type: String, // Can reference order ID, purchase ID, etc.
    trim: true
  },
  
  // Reason and notes
  reason: {
    type: String,
    required: true,
    trim: true,
    maxlength: [200, 'Reason cannot exceed 200 characters']
  },
  notes: {
    type: String,
    trim: true,
    maxlength: [500, 'Notes cannot exceed 500 characters']
  },
  
  // Cost information (for purchase/in movements)
  unitCost: {
    type: Number,
    min: [0, 'Unit cost cannot be negative']
  },
  totalCost: {
    type: Number,
    min: [0, 'Total cost cannot be negative']
  },
  
  // Location information
  location: {
    type: String,
    trim: true,
    default: 'main_warehouse'
  },
  
  // Batch information (optional)
  batchNumber: {
    type: String,
    trim: true
  },
  expiryDate: {
    type: Date
  },
  
  // Approval status (for large adjustments)
  approvalStatus: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'approved'
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin'
  },
  
  // Metadata
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: 'createdByModel'
  },
  createdByModel: {
    type: String,
    enum: ['Vendor', 'Admin', 'User'],
    default: 'Vendor'
  }
  
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better query performance
StockMovementSchema.index({ vendorId: 1, createdAt: -1 });
StockMovementSchema.index({ productId: 1, createdAt: -1 });
StockMovementSchema.index({ movementType: 1 });
StockMovementSchema.index({ referenceType: 1, referenceId: 1 });
StockMovementSchema.index({ approvalStatus: 1 });

// Virtual for movement direction
StockMovementSchema.virtual('isInbound').get(function() {
  return ['in', 'return'].includes(this.movementType);
});

StockMovementSchema.virtual('isOutbound').get(function() {
  return ['out', 'damage', 'transfer'].includes(this.movementType);
});

// Pre-save validation
StockMovementSchema.pre('save', function(next) {
  // Validate stock calculation
  const expectedNewStock = this.previousStock + (this.isInbound ? this.quantity : -Math.abs(this.quantity));
  
  if (this.movementType === 'adjustment') {
    // For adjustments, quantity can be positive or negative
    const adjustmentAmount = this.quantity;
    const calculatedNewStock = this.previousStock + adjustmentAmount;
    if (Math.abs(this.newStock - calculatedNewStock) > 0.01) {
      return next(new Error('New stock calculation is incorrect for adjustment'));
    }
  } else if (Math.abs(this.newStock - expectedNewStock) > 0.01) {
    return next(new Error('New stock calculation is incorrect'));
  }
  
  // Validate total cost calculation
  if (this.unitCost && this.totalCost) {
    const expectedTotalCost = this.unitCost * Math.abs(this.quantity);
    if (Math.abs(this.totalCost - expectedTotalCost) > 0.01) {
      return next(new Error('Total cost does not match unit cost * quantity'));
    }
  }
  
  next();
});

// Static method to get stock history for a product
StockMovementSchema.statics.getStockHistory = async function(productId, limit = 50) {
  return this.find({ productId })
    .populate('createdBy', 'name email')
    .populate('approvedBy', 'name email')
    .sort('-createdAt')
    .limit(limit);
};

// Static method to get stock summary for vendor
StockMovementSchema.statics.getVendorStockSummary = async function(vendorId, startDate, endDate) {
  const matchStage = {
    vendorId: new mongoose.Types.ObjectId(vendorId)
  };
  
  if (startDate && endDate) {
    matchStage.createdAt = {
      $gte: new Date(startDate),
      $lte: new Date(endDate)
    };
  }
  
  return this.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: '$movementType',
        totalQuantity: { $sum: '$quantity' },
        totalValue: { $sum: '$totalCost' },
        movementCount: { $sum: 1 }
      }
    }
  ]);
};

// Static method to calculate current stock for a product
StockMovementSchema.statics.getCurrentStock = async function(productId) {
  const latestMovement = await this.findOne({ productId })
    .sort('-createdAt')
    .select('newStock');
  
  return latestMovement ? latestMovement.newStock : 0;
};

const StockMovement = mongoose.model('StockMovement', StockMovementSchema);

export default StockMovement;
