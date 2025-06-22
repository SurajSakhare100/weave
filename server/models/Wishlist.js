import mongoose from 'mongoose';

const WishlistItemSchema = new mongoose.Schema({
    proId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    price: { type: Number, required: true },
    mrp: { type: Number, required: true },
    variantSize: String,
}, { _id: false });

const WishlistSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    items: [WishlistItemSchema],
}, { timestamps: true });

// Index for better query performance
WishlistSchema.index({ user: 1 });

const Wishlist = mongoose.model('Wishlist', WishlistSchema);

export default Wishlist; 