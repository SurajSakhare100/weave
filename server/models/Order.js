import mongoose from 'mongoose';

const OrderItemSchema = new mongoose.Schema({
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    name: { type: String, required: true },
    quantity: { type: Number, required: true },
    price: { type: Number, required: true },
    mrp: { type: Number, required: true },
    variantSize: String,
    image: String
}, { _id: false });

const OrderSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    orderItems: [OrderItemSchema],
    shippingAddress: {
        name: { type: String, required: true },
        address: { type: String, required: true },
        city: { type: String, required: true },
        state: { type: String, required: true },
        pincode: { type: String, required: true },
        phone: { type: String, required: true }
    },
    paymentMethod: { type: String, required: true },
    couponCode: String,
    itemsPrice: { type: Number, required: true, default: 0.0 },
    taxPrice: { type: Number, required: true, default: 0.0 },
    shippingPrice: { type: Number, required: true, default: 0.0 },
    discountAmount: { type: Number, required: true, default: 0.0 },
    totalPrice: { type: Number, required: true, default: 0.0 },
    isPaid: { type: Boolean, required: true, default: false },
    paidAt: Date,
    isDelivered: { type: Boolean, required: true, default: false },
    deliveredAt: Date,
    paymentResult: {
        id: String,
        status: String,
        update_time: String,
        email_address: String
    }
}, {
    timestamps: true
});

// Indexes for better query performance
OrderSchema.index({ user: 1, createdAt: -1 });
OrderSchema.index({ 'orderItems.productId': 1 });
OrderSchema.index({ isPaid: 1 });
OrderSchema.index({ isDelivered: 1 });

const Order = mongoose.model('Order', OrderSchema);

export default Order; 