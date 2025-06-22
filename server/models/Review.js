import mongoose from 'mongoose';

const ReviewSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'User ID is required'],
    },
    proId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: [true, 'Product ID is required'],
    },
    stars: {
        type: String,
        required: [true, 'Rating is required'],
        enum: ['one', 'two', 'three', 'four', 'five'],
    },
    title: {
        type: String,
        required: [true, 'Review title is required'],
        trim: true,
        maxlength: [100, 'Title cannot exceed 100 characters'],
    },
    review: {
        type: String,
        required: [true, 'Review content is required'],
        trim: true,
        maxlength: [1000, 'Review cannot exceed 1000 characters'],
    },
    isVerified: {
        type: Boolean,
        default: false,
    },
    isActive: {
        type: Boolean,
        default: true,
    },
}, { timestamps: true });

// Compound index for unique user-product review
ReviewSchema.index({ userId: 1, proId: 1 }, { unique: true });

// Index for better query performance
ReviewSchema.index({ proId: 1, isActive: 1 });
ReviewSchema.index({ stars: 1 });

const Review = mongoose.model('Review', ReviewSchema);

export default Review; 