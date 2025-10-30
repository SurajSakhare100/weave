import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';


const UserSchema = new mongoose.Schema({
   
    firstName: {
        type: String,
        trim: true,
    },
    lastName: {
        type: String,
        trim: true,
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        lowercase: true,
        trim: true,
        match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Please enter a valid email'],
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
        match: [/^[6-9]\d{9}$/, 'Please enter a valid 10-digit phone number'],
    },
    isActive: {
        type: Boolean,
        default: true,
    },
    address:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Address'
    }],
    },
    
{ timestamps: true });

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

// Cascade delete middleware
UserSchema.pre('deleteOne', { document: true, query: false }, async function() {
    const Cart = mongoose.model('Cart');
    const Wishlist = mongoose.model('Wishlist');
    const Order = mongoose.model('Order');
    const Review = mongoose.model('Review');
    const Address = mongoose.model('Address');
    
    // Delete related documents
    await Cart.deleteOne({ user: this._id });
    await Wishlist.deleteOne({ user: this._id });
    await Order.deleteMany({ user: this._id });
    await Review.deleteMany({ userId: this._id });
    await Address.deleteOne({ userId: this._id });
});

// Indexes for better query performance
// UserSchema.index({ email: 1 });
UserSchema.index({ isActive: 1 });

const User = mongoose.model('User', UserSchema);

export default User; 