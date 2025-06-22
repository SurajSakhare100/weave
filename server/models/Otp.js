import mongoose from 'mongoose';

const OTPSchema = new mongoose.Schema({
    email: { type: String, required: true },
    otp: { type: String, required: true },
    type: { type: String, required: true },
    for: { type: String, required: true },
    createdAt: { type: Date, default: Date.now, expires: 600 } // Expires in 10 minutes
});

// Indexes for better query performance
OTPSchema.index({ email: 1, type: 1, for: 1 });
OTPSchema.index({ createdAt: 1 });

const Otp = mongoose.model('OTP', OTPSchema);

export default Otp; 