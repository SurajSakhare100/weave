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
    size: {
        type: String,
        default: 'M',
        enum: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
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
    
    // Cloudinary Images
    images: [{
        url: {
            type: String,
            required: true
        },
        public_id: {
            type: String,
            required: true
        },
        width: Number,
        height: Number,
        format: String,
        bytes: Number,
        thumbnail_url: String,
        small_thumbnail_url: String,
        is_primary: {
            type: Boolean,
            default: false
        }
    }],
    
    // Legacy files field for backward compatibility
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
        enum: ['active', 'inactive', 'draft', 'scheduled'],
        default: 'active',
    },
    currVariantSize: String,
    keyFeatures: [String],
    productDetails: {
        weight: { type: String },
        dimensions: { type: String },
        capacity: { type: String },
        materials: { type: String },
    },
    tags: [String],
    
    // Scheduling fields
    isScheduled: {
        type: Boolean,
        default: false,
    },
    scheduledPublishDate: {
        type: Date,
        default: null,
    },
    scheduledPublishTime: {
        type: String,
        default: null,
    },
    scheduleStatus: {
        type: String,
        enum: ['pending', 'published', 'cancelled'],
        default: 'pending',
    },
}, { timestamps: true });

// Indexes for better query performance
ProductSchema.index({ name: 1 });
ProductSchema.index({ categorySlug: 1 });
ProductSchema.index({ vendorId: 1 });
ProductSchema.index({ available: 1 });
ProductSchema.index({ colors: 1 });
ProductSchema.index({ status: 1 });
ProductSchema.index({ isScheduled: 1 });
ProductSchema.index({ scheduledPublishDate: 1 });
ProductSchema.index({ scheduleStatus: 1 });

// Virtual for primary image
ProductSchema.virtual('primaryImage').get(function() {
    if (this.images && this.images.length > 0) {
        const primary = this.images.find(img => img.is_primary);
        return primary ? primary.url : this.images[0].url;
    }
    return null;
});

// Virtual for thumbnail
ProductSchema.virtual('thumbnail').get(function() {
    if (this.images && this.images.length > 0) {
        const primary = this.images.find(img => img.is_primary);
        const image = primary || this.images[0];
        return image.thumbnail_url || image.url;
    }
    return null;
});

// Ensure virtuals are serialized
ProductSchema.set('toJSON', { virtuals: true });
ProductSchema.set('toObject', { virtuals: true });

const Product = mongoose.model('Product', ProductSchema);

export default Product; 