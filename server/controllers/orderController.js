import asyncHandler from 'express-async-handler';
import Order from '../models/Order.js';
import Product from '../models/Product.js';
import User from '../models/User.js';
import Coupon from '../models/Coupon.js';
import userHelpers from '../helpers/userHelpers.js';


const createOrder = asyncHandler(async (req, res) => {
  try {
    const {
      orderItems,
      shippingAddress,
      paymentMethod,
      couponCode,
      itemsPrice,
      taxPrice,
      shippingPrice,
      totalPrice
    } = req.body;

    if (orderItems && orderItems.length === 0) {
      res.status(400);
      throw new Error('No order items');
    }

    // Calculate prices if not provided
    let calculatedItemsPrice = 0;
    let calculatedTaxPrice = 0;
    let calculatedShippingPrice = 0;
    let calculatedTotalPrice = 0;

    // Verify products and calculate prices
    for (const item of orderItems) {
      const product = await Product.findById(item.productId);
      if (!product) {
        res.status(404);
        throw new Error(`Product not found: ${item.productId}`);
      }
      if (product.available !== 'true') {
        res.status(400);
        throw new Error(`Product not available: ${product.name}`);
      }
      calculatedItemsPrice += product.price * item.quantity;
    }

    // Apply coupon if provided
    let discountAmount = 0;
    if (couponCode) {
      const coupon = await Coupon.findOne({ code: couponCode, isActive: true });
      if (!coupon) {
        res.status(400);
        throw new Error('Invalid coupon code');
      }
      
      const now = new Date();
      if (now < coupon.validFrom || now > coupon.validTo) {
        res.status(400);
        throw new Error('Coupon is not valid');
      }

      if (coupon.type === 'percentage') {
        discountAmount = (calculatedItemsPrice * coupon.discount) / 100;
      } else {
        discountAmount = coupon.discount;
      }
      
      discountAmount = Math.min(discountAmount, calculatedItemsPrice);
    }

    // Calculate tax and shipping
    calculatedTaxPrice = (calculatedItemsPrice - discountAmount) * 0.18; // 18% GST
    calculatedShippingPrice = calculatedItemsPrice > 500 ? 0 : 50; // Free shipping above 500
    calculatedTotalPrice = calculatedItemsPrice - discountAmount + calculatedTaxPrice + calculatedShippingPrice;

    const order = new Order({
      orderItems,
      user: req.user._id,
      shippingAddress,
      paymentMethod,
      couponCode,
      itemsPrice: calculatedItemsPrice,
      taxPrice: calculatedTaxPrice,
      shippingPrice: calculatedShippingPrice,
      discountAmount,
      totalPrice: calculatedTotalPrice
    });

    const createdOrder = await order.save();

    // Clear the user's cart after successful order creation
    await userHelpers.emtyCart(req.user._id);

    res.status(201).json({
      success: true,
      data: createdOrder,
      message: 'Order created successfully and cart cleared'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private
const getOrderById = asyncHandler(async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('user', 'name email')
      .populate({
        path: 'orderItems.productId',
        select: 'name price mrp discount files vendorId',
        populate: {
          path: 'vendorId',
          select: 'name'
        }
      });

    if (!order) {
      res.status(404);
      throw new Error('Order not found');
    }

    // Check if user owns this order or is admin
    if (order.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      res.status(401);
      throw new Error('Not authorized to view this order');
    }

    res.json({
      success: true,
      data: order
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Update order to paid
// @route   PUT /api/orders/:id/pay
// @access  Private
const updateOrderToPaid = asyncHandler(async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      res.status(404);
      throw new Error('Order not found');
    }

    order.isPaid = true;
    order.paidAt = Date.now();
    order.paymentResult = {
      id: req.body.id,
      status: req.body.status,
      update_time: req.body.update_time,
      email_address: req.body.payer.email_address
    };

    const updatedOrder = await order.save();

    res.json({
      success: true,
      data: updatedOrder
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Update order to delivered
// @route   PUT /api/orders/:id/deliver
// @access  Private/Admin
const updateOrderToDelivered = asyncHandler(async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      res.status(404);
      throw new Error('Order not found');
    }

    order.isDelivered = true;
    order.deliveredAt = Date.now();

    const updatedOrder = await order.save();

    res.json({
      success: true,
      data: updatedOrder
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Get logged in user orders
// @route   GET /api/orders/myorders
// @access  Private
const getMyOrders = asyncHandler(async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const orders = await Order.find({ user: req.user._id })
      .populate('orderItems.productId', 'name price files images')
      .sort('-createdAt')
      .skip(skip)
      .limit(limit);

    const total = await Order.countDocuments({ user: req.user._id });

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
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Get all orders (Admin)
// @route   GET /api/orders
// @access  Private/Admin
const getOrders = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const skip = (page - 1) * limit;

  const orders = await Order.find({})
    .populate('user', 'name email')
    .populate('orderItems.productId', 'name price')
    .sort('-createdAt')
    .skip(skip)
    .limit(limit);

  const total = await Order.countDocuments({});

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

// @desc    Cancel order
// @route   PUT /api/orders/:id/cancel
// @access  Private

const cancelOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);

  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }


  
  // Check if user owns this order
  if (order.user.toString() !== req.user._id.toString()) {
    res.status(401);
    throw new Error('Not authorized to cancel this order');
  }

  order.status = 'cancelled';
  order.cancelledAt = Date.now();

  const updatedOrder = await order.save();

  res.json({
    success: true,
    data: updatedOrder
  });
});

// @desc    Update order status (Admin)
// @route   PUT /api/orders/:id/status
// @access  Private/Admin
const updateOrderStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const order = await Order.findById(req.params.id);

  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }

  order.status = status;
  if (status === 'delivered') {
    order.deliveredAt = Date.now();
  }

  const updatedOrder = await order.save();

  res.json({
    success: true,
    data: updatedOrder
  });
});

// @desc    Get order statistics (Admin)
// @route   GET /api/orders/stats
// @access  Private/Admin
const getOrderStats = asyncHandler(async (req, res) => {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - 30); // Last 30 days

  const stats = await Order.aggregate([
    {
      $match: {
        createdAt: { $gte: startDate }
      }
    },
    {
      $group: {
        _id: null,
        totalOrders: { $sum: 1 },
        totalRevenue: { $sum: '$totalPrice' },
        averageOrderValue: { $avg: '$totalPrice' },
        pendingOrders: {
          $sum: {
            $cond: [{ $eq: ['$status', 'pending'] }, 1, 0]
          }
        },
        completedOrders: {
          $sum: {
            $cond: [{ $eq: ['$status', 'delivered'] }, 1, 0]
          }
        },
        cancelledOrders: {
          $sum: {
            $cond: [{ $eq: ['$status', 'cancelled'] }, 1, 0]
          }
        }
      }
    }
  ]);

  const dailyStats = await Order.aggregate([
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
        orders: { $sum: 1 },
        revenue: { $sum: '$totalPrice' }
      }
    },
    {
      $sort: { _id: 1 }
    }
  ]);

  res.json({
    success: true,
    data: {
      summary: stats[0] || {
        totalOrders: 0,
        totalRevenue: 0,
        averageOrderValue: 0,
        pendingOrders: 0,
        completedOrders: 0,
        cancelledOrders: 0
      },
      dailyStats
    }
  });
});

// @desc    Get vendor orders
// @route   GET /api/orders/vendor
// @access  Private (Vendor)
const getVendorOrders = asyncHandler(async (req, res) => {
  console.log('getVendorOrders called');
  console.log('Vendor ID from token:', req.vendor?._id);
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const skip = (page - 1) * limit;
  const { status, search } = req.query;

  // Get vendor's product IDs
  const vendorProducts = await Product.find({ vendorId: req.vendor._id }).distinct('_id');
  console.log('Vendor product IDs:', vendorProducts);

  // Build filter
  const filter = {
    'orderItems.productId': { $in: vendorProducts }
  };

  if (status && status !== 'all') {
    filter.status = status;
  }

  if (search) {
    filter.$or = [
      { _id: { $regex: search, $options: 'i' } },
      { 'user.name': { $regex: search, $options: 'i' } }
    ];
  }

  console.log('Order filter:', filter);

  const orders = await Order.find(filter)
    .populate('user', 'name email')
    .populate({
      path: 'orderItems.productId',
      select: 'name price files vendorId',
      match: { vendorId: req.vendor._id }
    })
    .sort('-createdAt')
    .skip(skip)
    .limit(limit);

  console.log('Orders found:', orders.length);

  const total = await Order.countDocuments(filter);

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

// @desc    Get vendor order by ID
// @route   GET /api/orders/vendor/:id
// @access  Private (Vendor)
const getVendorOrderById = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id)
    .populate('user', 'name email phone')
    .populate({
      path: 'orderItems.productId',
      select: 'name price mrp discount files vendorId',
      match: { vendorId: req.vendor._id }
    });

  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }

  // Check if order contains vendor's products
  const vendorProductIds = await Product.find({ vendorId: req.vendor._id }).distinct('_id');
  const hasVendorProducts = order.orderItems.some(item => 
    vendorProductIds.includes(item.productId._id)
  );

  if (!hasVendorProducts) {
    res.status(401);
    throw new Error('Not authorized to view this order');
  }

  res.json({
    success: true,
    data: order
  });
});

// @desc    Update vendor order status
// @route   PUT /api/orders/vendor/:id/status
// @access  Private (Vendor)
const updateVendorOrderStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const order = await Order.findById(req.params.id);

  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }

  // Check if order contains vendor's products
  const vendorProductIds = await Product.find({ vendorId: req.vendor._id }).distinct('_id');
  const hasVendorProducts = order.orderItems.some(item => 
    vendorProductIds.includes(item.productId)
  );

  if (!hasVendorProducts) {
    res.status(401);
    throw new Error('Not authorized to update this order');
  }

  // Update only vendor's products in the order
  order.orderItems.forEach(item => {
    if (vendorProductIds.includes(item.productId)) {
      item.status = status;
    }
  });

  // Update overall order status if all vendor products have same status
  const vendorItems = order.orderItems.filter(item => 
    vendorProductIds.includes(item.productId)
  );
  
  if (vendorItems.every(item => item.status === status)) {
    order.status = status;
  }

  const updatedOrder = await order.save();

  res.json({
    success: true,
    data: updatedOrder
  });
});

export {
  createOrder,
  getOrderById,
  updateOrderToPaid,
  updateOrderToDelivered,
  getMyOrders,
  getOrders,
  cancelOrder,
  updateOrderStatus,
  getOrderStats,
  getVendorOrders,
  getVendorOrderById,
  updateVendorOrderStatus
}; 