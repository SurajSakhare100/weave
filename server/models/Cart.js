import mongoose from 'mongoose';

const CartItemSchema = new mongoose.Schema({
    proId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    quantity: { type: Number, required: true, min: 1, default: 1 },
    price: { type: Number, required: true },
    mrp: { type: Number, required: true },
    variantSize: String,
}, { _id: false });

const CartSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    items: [CartItemSchema],
}, { timestamps: true });

const Cart = mongoose.model('Cart', CartSchema);

export default Cart; 