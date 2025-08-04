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

const Vendor = mongoose.model('Vendor', VendorSchema);

export default Vendor; 