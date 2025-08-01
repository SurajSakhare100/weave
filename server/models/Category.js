import mongoose from 'mongoose';

const MainSubCategorySchema = new mongoose.Schema({
    name: { type: String, required: true },
    category: { type: String, required: true },
    uni_id: { type: String, required: true },
    slug: { type: String, required: true },
}, { _id: false });

const SubCategorySchema = new mongoose.Schema({
    uni_id: { type: String, required: true },
    slug: { type: String, required: true },
    name: { type: String, required: true },
    mainSubSlug: { type: String, required: true },
    mainSub: { type: String, required: true },
    category: { type: String, required: true },
}, { _id: false });

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
    mainSub: [MainSubCategorySchema],
    sub: [SubCategorySchema],
}, { timestamps: true });

const Category = mongoose.model('Category', CategorySchema);

export default Category; 