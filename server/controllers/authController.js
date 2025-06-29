import User from '../models/User.js';
import generateToken from '../utils/generateToken.js';
import asyncHandler from 'express-async-handler';
import { sendEmail } from '../utils/emailService.js';
import crypto from 'crypto';
import Vendor from '../models/Vendor.js';
import jwt from 'jsonwebtoken';

// Generate JWT token
// const generateToken = (userId, userType = 'user') => {
//   return jwt.sign(
//     { userId, userType },
//     process.env.JWT_SECRET,
//     { expiresIn: '7d' }
//   );
// };

// Generate refresh token
const generateRefreshToken = (userId, userType = 'user') => {
  return jwt.sign(
    { userId, userType, type: 'refresh' },
    process.env.JWT_SECRET,
    { expiresIn: '30d' }
  );
};


const loginUser = asyncHandler(async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email }).select('+password');

    if (user && (await user.comparePassword(password))) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        token: generateToken(user._id),
      });
    } else {
      res.status(401);
      throw new Error('Invalid email or password');
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});


const registerUser = asyncHandler(async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const userExists = await User.findOne({ email });

    if (userExists) {
      res.status(400);
      throw new Error('User already exists');
    }

    const user = await User.create({ name, email, password });

    if (user) {
      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        token: generateToken(user._id),
      });
    } else {
      res.status(400);
      throw new Error('Invalid user data');
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Logout user / clear cookie
// @route   POST /api/auth/logout
// @access  Private
const logoutUser = (req, res) => {
  res.status(200).json({ message: 'Logged out successfully' });
};

// @desc    Get user profile
// @route   GET /api/auth/profile
// @access  Private
const getUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  if (user) {
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
    });
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
const updateUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user) {
    user.name = req.body.name || user.name;
    user.email = req.body.email || user.email;
    if (req.body.password) {
      user.password = req.body.password;
    }
    const updatedUser = await user.save();
    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      token: generateToken(updatedUser._id),
    });
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});

// @desc    Vendor login
// @route   POST /api/auth/vendor/login
// @access  Public
const loginVendor = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const vendor = await Vendor.findOne({ email });

  if (vendor && (await vendor.comparePassword(password))) {
    res.json({
      success: true,
      token: generateToken(vendor._id, 'vendor'),
      vendor: {
        _id: vendor._id,
        name: vendor.name,
        email: vendor.email,
        number: vendor.number,
        accept: vendor.accept,
        bankAccOwner: vendor.bankAccOwner,
        bankName: vendor.bankName,
        bankAccNumber: vendor.bankAccNumber,
        bankIFSC: vendor.bankIFSC,
        bankBranchName: vendor.bankBranchName,
        bankBranchNumber: vendor.bankBranchNumber,
        createdAt: vendor.createdAt
      }
    });
  } else {
    res.status(401);
    throw new Error('Invalid email or password');
  }
});

// @desc    Vendor registration
// @route   POST /api/auth/vendor/register
// @access  Public
const registerVendor = asyncHandler(async (req, res) => {
  const {
    name,
    email,
    password,
    number,
    bankAccOwner,
    bankName,
    bankAccNumber,
    bankIFSC,
    bankBranchName,
    bankBranchNumber
  } = req.body;

  const vendorExists = await Vendor.findOne({ email });

  if (vendorExists) {
    res.status(400);
    throw new Error('Vendor with this email already exists');
  }

  const vendor = await Vendor.create({
    name,
    email,
    password,
    number,
    bankAccOwner,
    bankName,
    bankAccNumber,
    bankIFSC,
    bankBranchName,
    bankBranchNumber,
    accept: true
  });

  if (vendor) {
    res.status(201).json({
      success: true,
      token: generateToken(vendor._id, 'vendor'),
      vendor: {
        _id: vendor._id,
        name: vendor.name,
        email: vendor.email,
        number: vendor.number,
        accept: vendor.accept,
        bankAccOwner: vendor.bankAccOwner,
        bankName: vendor.bankName,
        bankAccNumber: vendor.bankAccNumber,
        bankIFSC: vendor.bankIFSC,
        bankBranchName: vendor.bankBranchName,
        bankBranchNumber: vendor.bankBranchNumber,
        createdAt: vendor.createdAt
      }
    });
  } else {
    res.status(400);
    throw new Error('Invalid vendor data');
  }
});

// @desc    Vendor logout
// @route   POST /api/auth/vendor/logout
// @access  Private
const logoutVendor = (req, res) => {
  res.status(200).json({ 
    success: true,
    message: 'Vendor logged out successfully' 
  });
};

// Forgot password
const forgotPassword = async (req, res) => {
  const { email } = req.body;

  const user = await User.findOne({ email });
  if (!user) {
    // Don't reveal if user exists or not
    return res.json({
      success: true,
      message: 'If an account with that email exists, a password reset link has been sent.'
    });
  }

  // Generate reset token
  const resetToken = crypto.randomBytes(32).toString('hex');
  user.resetPasswordToken = resetToken;
  user.resetPasswordExpires = Date.now() + 60 * 60 * 1000; // 1 hour
  await user.save();

  // Send reset email
  const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;
  await sendEmail({
    to: user.email,
    subject: 'Reset your password',
    template: 'passwordReset',
    data: {
      name: user.firstName,
      resetUrl
    }
  });

  res.json({
    success: true,
    message: 'If an account with that email exists, a password reset link has been sent.'
  });
};

// Reset password
const resetPassword = async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;

  const user = await User.findOne({
    resetPasswordToken: token,
    resetPasswordExpires: { $gt: Date.now() }
  });

  if (!user) {
    return res.status(400).json({
      success: false,
      message: 'Invalid or expired reset token'
    });
  }

  // Update password
  user.password = password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;
  await user.save();

  res.json({
    success: true,
    message: 'Password reset successful'
  });
};

// Verify email
const verifyEmail = async (req, res) => {
  const { token } = req.params;

  const user = await User.findOne({
    emailVerificationToken: token,
    emailVerificationExpires: { $gt: Date.now() }
  });

  if (!user) {
    return res.status(400).json({
      success: false,
      message: 'Invalid or expired verification token'
    });
  }

  // Verify email
  user.isEmailVerified = true;
  user.emailVerificationToken = undefined;
  user.emailVerificationExpires = undefined;
  await user.save();

  res.json({
    success: true,
    message: 'Email verified successfully'
  });
};

// Resend verification email
const resendVerification = async (req, res) => {
  const { email } = req.body;

  const user = await User.findOne({ email });
  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }

  if (user.isEmailVerified) {
    return res.status(400).json({
      success: false,
      message: 'Email is already verified'
    });
  }

  // Generate new verification token
  const verificationToken = crypto.randomBytes(32).toString('hex');
  user.emailVerificationToken = verificationToken;
  user.emailVerificationExpires = Date.now() + 24 * 60 * 60 * 1000; // 24 hours
  await user.save();

  // Send verification email
  const verificationUrl = `${process.env.CLIENT_URL}/verify-email/${verificationToken}`;
  await sendEmail({
    to: user.email,
    subject: 'Verify your email address',
    template: 'emailVerification',
    data: {
      name: user.firstName,
      verificationUrl
    }
  });

  res.json({
    success: true,
    message: 'Verification email sent successfully'
  });
};

// Refresh token
const refreshToken = async (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(401).json({
      success: false,
      message: 'Refresh token is required'
    });
  }

  try {
    const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET);
    
    if (decoded.type !== 'refresh') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token type'
      });
    }

    // Generate new access token
    const newAccessToken = generateToken(decoded.userId, decoded.userType);

    res.json({
      success: true,
      token: newAccessToken
    });
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Invalid refresh token'
    });
  }
};

// Change password
const changePassword = async (req, res) => {
  const { currentPassword, password } = req.body;

  const user = await User.findById(req.user._id).select('+password');
  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }

  // Verify current password
  const isCurrentPasswordValid = await user.comparePassword(currentPassword);
  if (!isCurrentPasswordValid) {
    return res.status(400).json({
      success: false,
      message: 'Current password is incorrect'
    });
  }

  // Update password
  user.password = password;
  await user.save();

  res.json({
    success: true,
    message: 'Password changed successfully'
  });
};

// Update profile
const updateProfile = async (req, res) => {
  const { firstName, lastName, phone, addresses, preferences } = req.body;

  const user = await User.findById(req.user._id);
  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }

  // Update fields
  if (firstName) user.firstName = firstName;
  if (lastName) user.lastName = lastName;
  if (phone) user.phone = phone;
  if (addresses) user.addresses = addresses;
  if (preferences) user.preferences = { ...user.preferences, ...preferences };

  await user.save();

  res.json({
    success: true,
    message: 'Profile updated successfully',
    data: {
      user: user.getPublicProfile()
    }
  });
};

// Delete account
const deleteAccount = async (req, res) => {
  const user = await User.findById(req.user._id);
  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }

  // Soft delete - mark as inactive
  user.isActive = false;
  await user.save();

  res.json({
    success: true,
    message: 'Account deleted successfully'
  });
};

export {
  loginUser,
  registerUser,
  logoutUser,
  getUserProfile,
  updateUserProfile,
  registerVendor,
  loginVendor,
  logoutVendor,
  forgotPassword,
  resetPassword,
  verifyEmail,
  resendVerification,
  refreshToken,
  changePassword,
  updateProfile,
  deleteAccount
}; 