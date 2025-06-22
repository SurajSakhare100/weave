import mongoose from 'mongoose';

const CouponSchema = new mongoose.Schema({
    code: {
        type: String,
        required: [true, 'Coupon code is required'],
        unique: true,
        trim: true,
        uppercase: true,
    },
    discount: {
        type: Number,
        required: [true, 'Discount percentage is required'],
        min: [1, 'Discount must be at least 1%'],
        max: [100, 'Discount cannot exceed 100%'],
    },
    min: {
        type: Number,
        required: [true, 'Minimum order amount is required'],
        min: [0, 'Minimum amount cannot be negative'],
    },
    max: {
        type: Number,
        required: [true, 'Maximum discount amount is required'],
        min: [0, 'Maximum discount cannot be negative'],
    },
    validFrom: {
        type: Date,
        required: [true, 'Valid from date is required'],
    },
    validTo: {
        type: Date,
        required: [true, 'Valid to date is required'],
    },
    isActive: {
        type: Boolean,
        default: true,
    },
    usageLimit: {
        type: Number,
        default: -1, // -1 means unlimited
    },
    usedCount: {
        type: Number,
        default: 0,
    },
}, { timestamps: true });

// Add index for better query performance
CouponSchema.index({ isActive: 1, validFrom: 1, validTo: 1 });

const Coupon = mongoose.model('Coupon', CouponSchema);

export default Coupon; 