import asyncHandler from 'express-async-handler';
import User from '../models/User.js';
import Address from '../models/Address.js';
import Order from '../models/Order.js';
import Cart from '../models/Cart.js';
import Wishlist from '../models/Wishlist.js';
import mongoose from 'mongoose';

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

export const updateUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  const { name, firstName, lastName, email, number } = req.body;

  if (email && email !== user.email) {
    const emailExists = await User.findOne({ email });
    if (emailExists) {
      res.status(400);
      throw new Error('Email already exists');
    }
  }

  if (name !== undefined) user.name = name;
  if (firstName !== undefined) user.firstName = firstName;
  if (lastName !== undefined) user.lastName = lastName;
  if (email !== undefined) user.email = email;
  if (number !== undefined) user.number = number;

  const updatedUser = await user.save();

  res.json({
    success: true,
    data: {
      _id: updatedUser._id,
      name: updatedUser.name,
      firstName: updatedUser.firstName,
      lastName: updatedUser.lastName,
      email: updatedUser.email,
      number: updatedUser.number,
      isActive: updatedUser.isActive,
      createdAt: updatedUser.createdAt
    }
  });
});

export const getUserDashboard = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const recentOrders = await Order.find({ user: userId })
    .populate('orderItems.productId', 'name price files')
    .sort('-createdAt')
    .limit(5);

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

  const cartItemsCount = await Cart.countDocuments({ user: userId });
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

export const updateUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  const { name, firstName, lastName, email, number, isActive } = req.body;

  if (email && email !== user.email) {
    const emailExists = await User.findOne({ email });
    if (emailExists) {
      res.status(400);
      throw new Error('Email already exists');
    }
  }

  if (name !== undefined) user.name = name;
  if (firstName !== undefined) user.firstName = firstName;
  if (lastName !== undefined) user.lastName = lastName;
  if (email !== undefined) user.email = email;
  if (number !== undefined) user.number = number;
  user.isActive = isActive !== undefined ? isActive : user.isActive;

  const updatedUser = await user.save();

  res.json({
    success: true,
    data: {
      _id: updatedUser._id,
      name: updatedUser.name,
      firstName: updatedUser.firstName,
      lastName: updatedUser.lastName,
      email: updatedUser.email,
      number: updatedUser.number,
      isActive: updatedUser.isActive,
      createdAt: updatedUser.createdAt
    }
  });
});

export const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

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

export const getUserAddresses = asyncHandler(async (req, res) => {
  try {
    let addressDoc = await Address.findOne({ userId: req.user._id });
    
    if (!addressDoc) {
      addressDoc = new Address({ userId: req.user._id, saved: [] });
      await addressDoc.save();
    }

    res.json({
      success: true,
      data: addressDoc.saved || []
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export const addUserAddress = asyncHandler(async (req, res) => {
  try {
    const { firstName, lastName, country, number, pin, locality, address, city, state, addressType = 'Home' } = req.body;

    if (!firstName || !lastName || !country || !number || !pin || !locality || !address || !city || !state) {
      res.status(400);
      throw new Error('All address fields are required');
    }

    const newAddress = {
      id: new mongoose.Types.ObjectId().toHexString(),
      firstName,
      lastName,
      country,
      number,
      pin,
      locality,
      address,
      city,
      state,
      addressType
    };

    let addressDoc = await Address.findOne({ userId: req.user._id });
    
    if (!addressDoc) {
      addressDoc = new Address({ userId: req.user._id, saved: [] });
    }

    addressDoc.saved.push(newAddress);
    await addressDoc.save();

    res.status(201).json({
      success: true,
      data: newAddress,
      message: 'Address added successfully'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export const updateUserAddress = asyncHandler(async (req, res) => {
  try {
    const { addressId } = req.params;
    const { firstName, lastName, country, number, pin, locality, address, city, state, addressType } = req.body;

    const addressDoc = await Address.findOne({ userId: req.user._id });
    
    if (!addressDoc) {
      res.status(404);
      throw new Error('Address document not found');
    }

    const addressIndex = addressDoc.saved.findIndex(addr => addr.id === addressId);
    
    if (addressIndex === -1) {
      res.status(404);
      throw new Error('Address not found');
    }

    if (firstName) addressDoc.saved[addressIndex].firstName = firstName;
    if (lastName) addressDoc.saved[addressIndex].lastName = lastName;
    if (country) addressDoc.saved[addressIndex].country = country;
    if (number) addressDoc.saved[addressIndex].number = number;
    if (pin) addressDoc.saved[addressIndex].pin = pin;
    if (locality) addressDoc.saved[addressIndex].locality = locality;
    if (address) addressDoc.saved[addressIndex].address = address;
    if (city) addressDoc.saved[addressIndex].city = city;
    if (state) addressDoc.saved[addressIndex].state = state;
    if (addressType) addressDoc.saved[addressIndex].addressType = addressType;

    await addressDoc.save();

    res.json({
      success: true,
      data: addressDoc.saved[addressIndex],
      message: 'Address updated successfully'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export const deleteUserAddress = asyncHandler(async (req, res) => {
  try {
    const { addressId } = req.params;

    const addressDoc = await Address.findOne({ userId: req.user._id });
    
    if (!addressDoc) {
      res.status(404);
      throw new Error('Address document not found');
    }

    const addressIndex = addressDoc.saved.findIndex(addr => addr.id === addressId);
    
    if (addressIndex === -1) {
      res.status(404);
      throw new Error('Address not found');
    }

    addressDoc.saved.splice(addressIndex, 1);
    await addressDoc.save();

    res.json({
      success: true,
      message: 'Address deleted successfully'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export const setDefaultAddress = asyncHandler(async (req, res) => {
  try {
    const { addressId } = req.params;

    const addressDoc = await Address.findOne({ userId: req.user._id });
    
    if (!addressDoc) {
      res.status(404);
      throw new Error('Address document not found');
    }

    const addressIndex = addressDoc.saved.findIndex(addr => addr.id === addressId);
    
    if (addressIndex === -1) {
      res.status(404);
      throw new Error('Address not found');
    }

    addressDoc.saved.forEach(addr => {
      addr.isDefault = false;
    });

    addressDoc.saved[addressIndex].isDefault = true;

    await addressDoc.save();

    res.json({
      success: true,
      data: addressDoc.saved[addressIndex],
      message: 'Default address updated successfully'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}); 