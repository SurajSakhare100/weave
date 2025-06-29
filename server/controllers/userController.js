import asyncHandler from 'express-async-handler';
import User from '../models/User.js';
import Order from '../models/Order.js';
import Cart from '../models/Cart.js';
import Wishlist from '../models/Wishlist.js';
import mongoose from 'mongoose';

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
export const getUserProfile = asyncHandler(async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');

    if (!user) {
      res.status(404);
      throw new Error('User not found');
    }

    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
export const updateUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  const { name, email, number } = req.body;

  // Check if email is being changed and if it's already taken
  if (email && email !== user.email) {
    const emailExists = await User.findOne({ email });
    if (emailExists) {
      res.status(400);
      throw new Error('Email already exists');
    }
  }

  user.name = name || user.name;
  user.email = email || user.email;
  user.number = number || user.number;

  const updatedUser = await user.save();

  res.json({
    success: true,
    data: {
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      number: updatedUser.number,
      isActive: updatedUser.isActive,
      createdAt: updatedUser.createdAt
    }
  });
});

// @desc    Get user dashboard data
// @route   GET /api/users/dashboard
// @access  Private
export const getUserDashboard = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  // Get recent orders
  const recentOrders = await Order.find({ user: userId })
    .populate('orderItems.productId', 'name price files')
    .sort('-createdAt')
    .limit(5);

  // Get order statistics
  const orderStats = await Order.aggregate([
    { $match: { user: userId } },
    {
      $group: {
        _id: null,
        totalOrders: { $sum: 1 },
        totalSpent: { $sum: '$totalPrice' },
        pendingOrders: {
          $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] }
        },
        completedOrders: {
          $sum: { $cond: [{ $eq: ['$status', 'delivered'] }, 1, 0] }
        }
      }
    }
  ]);

  // Get cart items count
  const cartItemsCount = await Cart.countDocuments({ user: userId });

  // Get wishlist items count
  const wishlistItemsCount = await Wishlist.countDocuments({ user: userId });

  res.json({
    success: true,
    data: {
      recentOrders,
      stats: orderStats[0] || {
        totalOrders: 0,
        totalSpent: 0,
        pendingOrders: 0,
        completedOrders: 0
      },
      cartItemsCount,
      wishlistItemsCount
    }
  });
});

// @desc    Get all users (Admin)
// @route   GET /api/users
// @access  Private/Admin
export const getUsers = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const skip = (page - 1) * limit;

  const { search, status } = req.query;

  const filter = {};

  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } }
    ];
  }

  if (status) {
    filter.isActive = status === 'active';
  }

  const users = await User.find(filter)
    .select('-password')
    .sort('-createdAt')
    .skip(skip)
    .limit(limit);

  const total = await User.countDocuments(filter);

  res.json({
    success: true,
    data: users,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    }
  });
});

// @desc    Get user by ID (Admin)
// @route   GET /api/users/:id
// @access  Private/Admin
export const getUserById = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).select('-password');

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  res.json({
    success: true,
    data: user
  });
});

// @desc    Update user (Admin)
// @route   PUT /api/users/:id
// @access  Private/Admin
export const updateUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  const { name, email, number, isActive } = req.body;

  // Check if email is being changed and if it's already taken
  if (email && email !== user.email) {
    const emailExists = await User.findOne({ email });
    if (emailExists) {
      res.status(400);
      throw new Error('Email already exists');
    }
  }

  user.name = name || user.name;
  user.email = email || user.email;
  user.number = number || user.number;
  user.isActive = isActive !== undefined ? isActive : user.isActive;

  const updatedUser = await user.save();

  res.json({
    success: true,
    data: {
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      number: updatedUser.number,
      isActive: updatedUser.isActive,
      createdAt: updatedUser.createdAt
    }
  });
});

// @desc    Delete user (Admin)
// @route   DELETE /api/users/:id
// @access  Private/Admin
export const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  // Check if user has orders
  const orderCount = await Order.countDocuments({ user: req.params.id });
  if (orderCount > 0) {
    res.status(400);
    throw new Error(`Cannot delete user. User has ${orderCount} orders.`);
  }

  await User.findByIdAndDelete(req.params.id);

  res.json({
    success: true,
    message: 'User deleted successfully'
  });
});

// @desc    Get user orders (Admin)
// @route   GET /api/users/:id/orders
// @access  Private/Admin
export const getUserOrders = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const orders = await Order.find({ user: req.params.id })
    .populate('orderItems.productId', 'name price files')
    .sort('-createdAt')
    .skip(skip)
    .limit(limit);

  const total = await Order.countDocuments({ user: req.params.id });

  res.json({
    success: true,
    data: orders,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    }
  });
});

// @desc    Get user statistics (Admin)
// @route   GET /api/users/stats
// @access  Private/Admin
export const getUserStats = asyncHandler(async (req, res) => {
  const { period = '30' } = req.query;
  const days = parseInt(period);

  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const stats = await User.aggregate([
    {
      $match: {
        createdAt: { $gte: startDate }
      }
    },
    {
      $group: {
        _id: null,
        totalUsers: { $sum: 1 },
        activeUsers: {
          $sum: { $cond: ['$isActive', 1, 0] }
        },
        inactiveUsers: {
          $sum: { $cond: ['$isActive', 0, 1] }
        }
      }
    }
  ]);

  const dailyStats = await User.aggregate([
    {
      $match: {
        createdAt: { $gte: startDate }
      }
    },
    {
      $group: {
        _id: {
          $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
        },
        users: { $sum: 1 }
      }
    },
    {
      $sort: { _id: 1 }
    }
  ]);

  const totalUsers = await User.countDocuments();
  const activeUsers = await User.countDocuments({ isActive: true });

  res.json({
    success: true,
    data: {
      summary: stats[0] || {
        totalUsers: 0,
        activeUsers: 0,
        inactiveUsers: 0
      },
      overall: {
        totalUsers,
        activeUsers,
        inactiveUsers: totalUsers - activeUsers
      },
      dailyStats
    }
  });
});

// @desc    Get user addresses
// @route   GET /api/users/addresses
// @access  Private
export const getUserAddresses = asyncHandler(async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('addresses');
    
    if (!user) {
      res.status(404);
      throw new Error('User not found');
    }

    res.json({
      success: true,
      data: user.addresses || []
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Add new address
// @route   POST /api/users/addresses
// @access  Private
export const addUserAddress = asyncHandler(async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    
    if (!user) {
      res.status(404);
      throw new Error('User not found');
    }

    const { name, number, pin, locality, address, city, state, addressType = 'Home' } = req.body;

    // Validate required fields
    if (!name || !number || !pin || !locality || !address || !city || !state) {
      res.status(400);
      throw new Error('All address fields are required');
    }

    const newAddress = {
      id: new mongoose.Types.ObjectId().toHexString(),
      name,
      number,
      pin,
      locality,
      address,
      city,
      state,
      addressType
    };

    // Initialize addresses array if it doesn't exist
    if (!user.addresses) {
      user.addresses = [];
    }

    user.addresses.push(newAddress);
    await user.save();

    res.status(201).json({
      success: true,
      data: newAddress,
      message: 'Address added successfully'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Update address
// @route   PUT /api/users/addresses/:addressId
// @access  Private
export const updateUserAddress = asyncHandler(async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    
    if (!user) {
      res.status(404);
      throw new Error('User not found');
    }

    const { addressId } = req.params;
    const { name, number, pin, locality, address, city, state, addressType } = req.body;

    // Find the address in user's addresses array
    const addressIndex = user.addresses.findIndex(addr => addr.id === addressId);
    
    if (addressIndex === -1) {
      res.status(404);
      throw new Error('Address not found');
    }

    // Update address fields
    if (name) user.addresses[addressIndex].name = name;
    if (number) user.addresses[addressIndex].number = number;
    if (pin) user.addresses[addressIndex].pin = pin;
    if (locality) user.addresses[addressIndex].locality = locality;
    if (address) user.addresses[addressIndex].address = address;
    if (city) user.addresses[addressIndex].city = city;
    if (state) user.addresses[addressIndex].state = state;
    if (addressType) user.addresses[addressIndex].addressType = addressType;

    await user.save();

    res.json({
      success: true,
      data: user.addresses[addressIndex],
      message: 'Address updated successfully'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Delete address
// @route   DELETE /api/users/addresses/:addressId
// @access  Private
export const deleteUserAddress = asyncHandler(async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    
    if (!user) {
      res.status(404);
      throw new Error('User not found');
    }

    const { addressId } = req.params;

    // Find and remove the address from user's addresses array
    const addressIndex = user.addresses.findIndex(addr => addr.id === addressId);
    
    if (addressIndex === -1) {
      res.status(404);
      throw new Error('Address not found');
    }

    user.addresses.splice(addressIndex, 1);
    await user.save();

    res.json({
      success: true,
      message: 'Address deleted successfully'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Set default address
// @route   PUT /api/users/addresses/:addressId/default
// @access  Private
export const setDefaultAddress = asyncHandler(async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    
    if (!user) {
      res.status(404);
      throw new Error('User not found');
    }

    const { addressId } = req.params;

    // Find the address in user's addresses array
    const addressIndex = user.addresses.findIndex(addr => addr.id === addressId);
    
    if (addressIndex === -1) {
      res.status(404);
      throw new Error('Address not found');
    }

    // Remove default from all addresses
    user.addresses.forEach(addr => {
      addr.isDefault = false;
    });

    // Set the selected address as default
    user.addresses[addressIndex].isDefault = true;

    await user.save();

    res.json({
      success: true,
      data: user.addresses[addressIndex],
      message: 'Default address updated successfully'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}); 