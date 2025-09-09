import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const VendorSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: { type: String, required: true },
  number: { type: String },
  
  // Admin approval fields
  adminApproved: { type: Boolean, default: false },
  adminApprovedAt: { type: Date },
  adminApprovedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin' },
  adminRejectionReason: { type: String, trim: true },
  adminApprovalFeedback: { type: String, trim: true },
  status: { 
    type: String, 
    enum: ['pending', 'approved', 'rejected', 'deleted'], 
    default: 'pending' 
  },
  
  // Business details
  businessName: { type: String, trim: true },
  
  // Address information
  address: { type: String, trim: true },
  city: { type: String, trim: true },
  state: { type: String, trim: true },
  pinCode: { type: String, trim: true },
  
  // Note: Bank details removed since payments are handled offline
  
  // Sales management settings
  enableOfflineSales: { 
    type: Boolean, 
    default: true,
    description: 'Allow vendor to record offline sales'
  },
  defaultPaymentMethods: [{
    type: String,
    enum: ['cash', 'card', 'upi', 'bank_transfer', 'other'],
    default: ['cash', 'card', 'upi']
  }],
  
  // Stock management settings
  stockManagementEnabled: { 
    type: Boolean, 
    default: true,
    description: 'Enable stock tracking for this vendor'
  },
  lowStockThreshold: {
    type: Number,
    default: 10,
    min: [0, 'Low stock threshold cannot be negative']
  },
  autoStockDeduction: {
    type: Boolean,
    default: true,
    description: 'Automatically deduct stock on sales'
  },
  
  // Business settings
  businessType: {
    type: String,
    enum: ['retail', 'wholesale', 'both'],
    default: 'retail'
  },
  operatingHours: {
    monday: { open: String, close: String, closed: { type: Boolean, default: false } },
    tuesday: { open: String, close: String, closed: { type: Boolean, default: false } },
    wednesday: { open: String, close: String, closed: { type: Boolean, default: false } },
    thursday: { open: String, close: String, closed: { type: Boolean, default: false } },
    friday: { open: String, close: String, closed: { type: Boolean, default: false } },
    saturday: { open: String, close: String, closed: { type: Boolean, default: false } },
    sunday: { open: String, close: String, closed: { type: Boolean, default: true } }
  },
  
  // Sales analytics cache (updated periodically)
  salesStats: {
    totalOnlineSales: { type: Number, default: 0 },
    totalOfflineSales: { type: Number, default: 0 },
    totalSales: { type: Number, default: 0 },
    totalOrders: { type: Number, default: 0 },
    averageOrderValue: { type: Number, default: 0 },
    lastUpdated: { type: Date, default: Date.now }
  },
  
  // Stock analytics cache
  stockStats: {
    totalProducts: { type: Number, default: 0 },
    lowStockProducts: { type: Number, default: 0 },
    outOfStockProducts: { type: Number, default: 0 },
    totalStockValue: { type: Number, default: 0 },
    lastUpdated: { type: Date, default: Date.now }
  },
  
  // Notification preferences
  notifications: {
    lowStock: { type: Boolean, default: true },
    newOrder: { type: Boolean, default: true },
    stockMovement: { type: Boolean, default: false },
    dailySummary: { type: Boolean, default: true }
  }
}, { timestamps: true });

VendorSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

VendorSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Method to update sales statistics
VendorSchema.methods.updateSalesStats = async function() {
  const VendorSales = mongoose.model('VendorSales');
  
  const salesSummary = await VendorSales.aggregate([
    {
      $match: {
        vendorId: this._id,
        status: 'completed'
      }
    },
    {
      $group: {
        _id: '$saleType',
        totalSales: { $sum: '$totalAmount' },
        totalOrders: { $sum: 1 }
      }
    }
  ]);
  
  let totalOnlineSales = 0;
  let totalOfflineSales = 0;
  let totalOrders = 0;
  
  salesSummary.forEach(summary => {
    if (summary._id === 'online') {
      totalOnlineSales = summary.totalSales;
    } else if (summary._id === 'offline') {
      totalOfflineSales = summary.totalSales;
    }
    totalOrders += summary.totalOrders;
  });
  
  const totalSales = totalOnlineSales + totalOfflineSales;
  const averageOrderValue = totalOrders > 0 ? totalSales / totalOrders : 0;
  
  this.salesStats = {
    totalOnlineSales,
    totalOfflineSales,
    totalSales,
    totalOrders,
    averageOrderValue,
    lastUpdated: new Date()
  };
  
  await this.save();
  return this.salesStats;
};

// Method to update stock statistics
VendorSchema.methods.updateStockStats = async function() {
  const Product = mongoose.model('Product');
  
  const stockSummary = await Product.aggregate([
    {
      $match: {
        vendorId: this._id
      }
    },
    {
      $group: {
        _id: null,
        totalProducts: { $sum: 1 },
        lowStockProducts: {
          $sum: {
            $cond: [
              { $and: [
                { $lte: ['$stock', this.lowStockThreshold] },
                { $gt: ['$stock', 0] }
              ]},
              1,
              0
            ]
          }
        },
        outOfStockProducts: {
          $sum: {
            $cond: [{ $eq: ['$stock', 0] }, 1, 0]
          }
        },
        totalStockValue: {
          $sum: { $multiply: ['$stock', '$price'] }
        }
      }
    }
  ]);
  
  const stats = stockSummary[0] || {
    totalProducts: 0,
    lowStockProducts: 0,
    outOfStockProducts: 0,
    totalStockValue: 0
  };
  
  this.stockStats = {
    ...stats,
    lastUpdated: new Date()
  };
  
  await this.save();
  return this.stockStats;
};

// Method to check if vendor can manage offline sales
VendorSchema.methods.canManageOfflineSales = function() {
  return this.enableOfflineSales && this.adminApproved && this.status === 'approved';
};

// Method to check if vendor can manage stock
VendorSchema.methods.canManageStock = function() {
  return this.stockManagementEnabled && this.adminApproved && this.status === 'approved';
};

const Vendor = mongoose.model('Vendor', VendorSchema);

export default Vendor; 