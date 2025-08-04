import mongoose from 'mongoose';

const CategorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Category name is required'],
        trim: true,
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

const Category = mongoose.model('Category', CategorySchema);

export default Category; 