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
  accept: { type: Boolean, default: false },
  // Admin approval fields
  adminApproved: { type: Boolean, default: false },
  adminApprovedAt: { type: Date },
  adminApprovedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin' },
  adminRejectionReason: { type: String, trim: true },
  // Business details
  businessName: { type: String, trim: true },
  businessAddress: { type: String, trim: true },
  gstin: { type: String, trim: true },
  pan: { type: String, trim: true },
  bankAccOwner: String,
  bankName: String,
  bankAccNumber: String,
  bankIFSC: String,
  bankBranchName: String,
  bankBranchNumber: String,
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