import mongoose from 'mongoose';

const OrderItemSchema = new mongoose.Schema({
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    proName: { type: String, required: true },
    quantity: { type: Number, required: true },
    price: { type: Number, required: true },
    mrp: { type: Number, required: true },
    variantSize: String,
    OrderStatus: { type: String, default: 'Pending' },
    secretOrderId: { type: String, required: true, unique: true },
    pickup_location: String,
    vendorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Vendor' },
    selling_price: Number,
    discount: Number,
    payId: String,
    return: Boolean,
    cancellation: Boolean,
    slug: String,
    files: [String],
    uni_id_Mix: String,
    order_id_shiprocket: String,
    shipment_id: String,
    date: { type: String, default: () => new Date().toLocaleString('en-IN') },
    details: Object,
    returnReason: String,
    updated: String,
    shipment_track_activities: Array,
    etd: String,
    track_url: String,
    payStatus: { type: String, default: 'Pending' },
}, { _id: false });

const OrderSchema = new mongoose.Schema({
    _id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    order: [OrderItemSchema],
}, { timestamps: true });

// Indexes for better query performance
OrderSchema.index({ 'order.secretOrderId': 1 });
OrderSchema.index({ 'order.OrderStatus': 1 });
OrderSchema.index({ 'order.date': -1 });

const Order = mongoose.model('Order', OrderSchema);

export default Order; 