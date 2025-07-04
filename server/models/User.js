import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const AddressEntrySchema = new mongoose.Schema({
    id: { type: String, required: true, default: () => new mongoose.Types.ObjectId().toHexString() },
    name: { type: String, required: true },
    number: { type: String, required: true },
    pin: { type: String, required: true },
    locality: { type: String, required: true },
    address: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    addressType: { type: String, default: 'Home', enum: ['Home', 'Work', 'Other'] },
    isDefault: { type: Boolean, default: false }
}, { _id: false });

const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Name is required'],
        trim: true,
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        lowercase: true,
        trim: true,
        match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email'],
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
        minlength: [6, 'Password must be at least 6 characters'],
        select: false,
    },
    number: {
        type: String,
        trim: true,
    },
    addresses: [AddressEntrySchema],
    isActive: {
        type: Boolean,
        default: true,
    },
}, { timestamps: true });

// Hash password before saving
UserSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
        return next();
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

// Compare entered password with hashed password
UserSchema.methods.comparePassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', UserSchema);

export default User; 