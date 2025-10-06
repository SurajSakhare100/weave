import mongoose from 'mongoose';

const CategorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Category name is required'],
        trim: true,
        maxlength: [50, 'Category name cannot exceed 50 characters'],
    },
    description: {
        type: String,
        default: null,
    },
    slug: {
        type: String,
        unique: true,
        required: true,
    },
    image: {
        type: String,
        default: null,
    },
    imagePublicId: {
        type: String,
        default: null,
    },
    file: {
        type: String,
        default: null,
    },
    header: {
        type: Boolean,
        default: false,
    },
    uni_id1: {
        type: String,
        default: null,
    },
    uni_id2: {
        type: String,
        default: null,
    },
}, { timestamps: true });

// Cascade delete middleware
CategorySchema.pre('deleteOne', { document: true, query: false }, async function() {
    const Product = mongoose.model('Product');
    
    // Update products to remove category reference (don't delete products)
    await Product.updateMany(
        { category: this._id },
        { $unset: { category: 1 } }
    );
});

// Indexes for better query performance
CategorySchema.index({ slug: 1 });
CategorySchema.index({ header: 1 });

const Category = mongoose.model('Category', CategorySchema);

export default Category; 