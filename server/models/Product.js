import mongoose from 'mongoose';

const ProductSchema = new mongoose.Schema({
    name: { 
        type: String, 
        required: true,
        trim: true,
    },
    slug: {
        type: String,
        required: true,
        unique: true,
        trim: true,
    },
    price: {
        type: Number,
        required: true,
        min: [0, 'Price cannot be negative'],
    },
    mrp: {
        type: Number,
        required: true,
        min: [0, 'MRP cannot be negative'],
    },
    discount: {
        type: Number,
        default: 0,
        min: [0, 'Discount cannot be negative'],
    },
    vendorId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Vendor', 
        required: true 
    },
    vendor: {
        type: Boolean,
        default: false,
    },
    available: { 
        type: String, 
        default: 'true',
        enum: ['true', 'false'],
    },
    category: {
        type: String,
        required: true,
    },
    categorySlug: {
        type: String,
        // required: true,
    },
    srtDescription: {
        type: String,
        trim: true,
    },
    description: {
        type: String,
        trim: true,
    },
    seoDescription: {
        type: String,
        trim: true,
    },
    seoKeyword: {
        type: String,
        trim: true,
    },
    seoTitle: {
        type: String,
        trim: true,
    },
    pickup_location: String,
    return: {
        type: Boolean,
        default: true,
    },
    cancellation: {
        type: Boolean,
        default: true,
    },
    uni_id_1: String,
    uni_id_2: String,
    files: [String],
    variant: {
        type: Boolean,
        default: false,
    },
    variantDetails: [{
        size: String,
        color: String,
        price: Number,
        mrp: Number,
        stock: Number,
    }],
    reviews: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Review'
    }],
    colors: [String],
    stock: {
        type: Number,
        default: 0,
    },
    totalReviews: {
        type: Number,
        default: 0,
    },
    averageRating: {
        type: Number,
        default: 0,
    },
    status: {
        type: String,
        enum: ['active', 'inactive', 'draft'],
        default: 'active',
    },
    currVariantSize: String,
}, { timestamps: true });

// Indexes for better query performance
ProductSchema.index({ name: 1 });
ProductSchema.index({ categorySlug: 1 });
ProductSchema.index({ vendorId: 1 });
ProductSchema.index({ available: 1 });
ProductSchema.index({ colors: 1 });
ProductSchema.index({ status: 1 });

const Product = mongoose.model('Product', ProductSchema);

export default Product; 