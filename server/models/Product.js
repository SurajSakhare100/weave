import mongoose from 'mongoose';

const ProductSchema = new mongoose.Schema({
    name: { 
        type: String, 
        required: true,
        trim: true,
        maxlength: [100, 'Product name cannot exceed 100 characters']
    },
    slug: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true
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
        max: [100, 'Discount cannot exceed 100%']
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
        type: Boolean, 
        default: true,
    },
    
    // Single size for simple products
    size: {
        type: String,
        default: 'M',
        enum: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
    },
    // Multiple sizes for products with size variants
    sizes: [{
        type: String,
        enum: ['XS', 'S', 'M', 'L', 'XL', 'XXL']
    }],
    category: {
        type: String,
        required: true,
        trim: true
    },
    categorySlug: {
        type: String,
        required: true,
        trim: true
    },
    srtDescription: {
        type: String,
        trim: true,
        maxlength: [200, 'Short description cannot exceed 200 characters']
    },
    description: {
        type: String,
        trim: true,
        maxlength: [1000, 'Description cannot exceed 1000 characters']
    },
    seoDescription: {
        type: String,
        trim: true,
        maxlength: [160, 'SEO description cannot exceed 160 characters']
    },
    seoKeyword: {
        type: String,
        trim: true,
        maxlength: [200, 'SEO keywords cannot exceed 200 characters']
    },
    seoTitle: {
        type: String,
        trim: true,
        maxlength: [60, 'SEO title cannot exceed 60 characters']
    },
    pickup_location: {
        type: String,
        trim: true
    },
    return: {
        type: Boolean,
        default: true,
    },
    cancellation: {
        type: Boolean,
        default: true,
    },
    
    // Cloudinary Images - Single source of truth
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
        min: [0, 'Stock cannot be negative']
    },
    totalReviews: {
        type: Number,
        default: 0,
        min: [0, 'Total reviews cannot be negative']
    },
    averageRating: {
        type: Number,
        default: 0,
        min: [0, 'Average rating cannot be negative'],
        max: [5, 'Average rating cannot exceed 5']
    },
    status: {
        type: String,
        enum: ['active', 'inactive', 'draft', 'scheduled'],
        default: 'active',
    },
    currVariantSize: String,
    keyFeatures: [{
        type: String,
        maxlength: [100, 'Key feature cannot exceed 100 characters']
    }],
    productDetails: {
        weight: { 
            type: String,
            trim: true
        },
        dimensions: { 
            type: String,
            trim: true
        },
        capacity: { 
            type: String,
            trim: true
        },
        materials: { 
            type: String,
            trim: true
        },
    },
    tags: [{
        type: String,
        trim: true,
        maxlength: [30, 'Tag cannot exceed 30 characters']
    }],
    
    // Pricing and offers
    offers: {
        type: Boolean,
        default: false
    },
    salePrice: {
        type: Number,
        min: [0, 'Sale price cannot be negative']
    },
    
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
}, { 
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

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
ProductSchema.index({ slug: 1 });
ProductSchema.index({ price: 1 });
ProductSchema.index({ tags: 1 });
ProductSchema.index({ sizes: 1 });

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

// Virtual for discount percentage
ProductSchema.virtual('discountPercentage').get(function() {
    if (this.mrp && this.price && this.mrp > this.price) {
        return Math.round(((this.mrp - this.price) / this.mrp) * 100);
    }
    return 0;
});

// Virtual for available sizes
ProductSchema.virtual('availableSizes').get(function() {
    if (this.sizes && this.sizes.length > 0) {
        return this.sizes;
    }
    if (this.size) {
        return [this.size];
    }
    return [];
});

// Pre-save middleware to generate slug if not provided
ProductSchema.pre('save', function(next) {
    if (!this.slug && this.name) {
        this.slug = this.name.toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '');
    }
    
    // Generate categorySlug if not provided
    if (!this.categorySlug && this.category) {
        this.categorySlug = this.category.toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '');
    }
    
    // Calculate discount if not set
    if (this.mrp && this.price && !this.discount) {
        this.discount = Math.round(((this.mrp - this.price) / this.mrp) * 100);
    }
    
    // Normalize sizes array
    if (this.sizes && this.sizes.length > 0) {
        // Remove duplicates and normalize
        this.sizes = [...new Set(this.sizes.map(size => size.trim()))];
    }
    
    next();
});

// Method to check if product is in stock
ProductSchema.methods.isInStock = function() {
    if (this.variant && this.variantDetails && this.variantDetails.length > 0) {
        return this.variantDetails.some(variant => variant.stock > 0);
    }
    return this.stock > 0;
};

// Method to get available variants
ProductSchema.methods.getAvailableVariants = function() {
    if (this.variant && this.variantDetails) {
        return this.variantDetails.filter(variant => variant.stock > 0);
    }
    return [];
};

// Method to get available sizes
ProductSchema.methods.getAvailableSizes = function() {
    if (this.sizes && this.sizes.length > 0) {
        return this.sizes;
    }
    if (this.size) {
        return [this.size];
    }
    return [];
};

const Product = mongoose.model('Product', ProductSchema);

export default Product; 