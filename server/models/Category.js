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
    file: {
        type: String,
        default: null,
    },
    header: {
        type: String,
        default: "false",
    },
    mainSub: [MainSubCategorySchema],
    sub: [SubCategorySchema],
}, { timestamps: true });

const Category = mongoose.model('Category', CategorySchema);

export default Category; 