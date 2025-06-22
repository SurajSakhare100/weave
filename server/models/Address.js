import mongoose from 'mongoose';

const AddressEntrySchema = new mongoose.Schema({
    id: { type: String, required: true, default: () => new mongoose.Types.ObjectId().toHexString() },
    name: { type: String, required: true },
    number: { type: String, required: true },
    pin: { type: String, required: true },
    locality: { type: String, required: true },
    address: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
}, { _id: false });

const AddressSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    saved: [AddressEntrySchema],
}, { timestamps: true });

// Index for better query performance
AddressSchema.index({ userId: 1 });

const Address = mongoose.model('Address', AddressSchema);

export default Address; 