import asyncHandler from 'express-async-handler';
import Order from '../models/Order.js';
import Product from '../models/Product.js';
import User from '../models/User.js';
import Coupon from '../models/Coupon.js';
import userHelpers from '../helpers/userHelpers.js';

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
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

    if (!orderItems || orderItems.length === 0) {
      res.status(400);
      throw new Error('No order items provided');
    }

    // Validate shipping address
    if (!shippingAddress || !shippingAddress.address || !shippingAddress.city || !shippingAddress.pincode) {
      res.status(400);
      throw new Error('Complete shipping address is required');
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
      if (item.quantity <= 0) {
        res.status(400);
        throw new Error(`Invalid quantity for product: ${product.name}`);
      }
      calculatedItemsPrice += product.price * item.quantity;
    }

    // Apply coupon if provided
    let discountAmount = 0;
    let appliedCoupon = null;
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
      appliedCoupon = coupon._id;
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
      couponCode: appliedCoupon,
      itemsPrice: calculatedItemsPrice,
      taxPrice: calculatedTaxPrice,
      shippingPrice: calculatedShippingPrice,
      discountAmount,
      totalPrice: calculatedTotalPrice,
      status: 'pending'
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
      .populate('user', 'firstName lastName email number')
      .populate({
        path: 'orderItems.productId',
        select: 'name price mrp discount files vendorId category',
        populate: {
          path: 'vendorId',
          select: 'name email'
        }
      })
      .populate('couponCode', 'code discount type');

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

    if (order.isPaid) {
      res.status(400);
      throw new Error('Order is already paid');
    }

    order.isPaid = true;
    order.paidAt = Date.now();
    order.paymentResult = {
      id: req.body.id,
      status: req.body.status,
      update_time: req.body.update_time,
      email_address: req.body.payer?.email_address
    };

    const updatedOrder = await order.save();

    res.json({
      success: true,
      data: updatedOrder,
      message: 'Order marked as paid successfully'
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

    if (order.isDelivered) {
      res.status(400);
      throw new Error('Order is already delivered');
    }

    order.isDelivered = true;
    order.deliveredAt = Date.now();
    order.status = 'delivered';

    const updatedOrder = await order.save();

    res.json({
      success: true,
      data: updatedOrder,
      message: 'Order marked as delivered successfully'
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
    const { status, search } = req.query;

    // Build filter
    const filter = { user: req.user._id };
    
    if (status && status !== 'all') {
      filter.status = status;
    }

    if (search) {
      filter.$or = [
        { _id: { $regex: search, $options: 'i' } },
        { 'orderItems.productId.name': { $regex: search, $options: 'i' } }
      ];
    }

    const orders = await Order.find(filter)
      .populate('orderItems.productId', 'name price files images category')
      .populate('couponCode', 'code discount type')
      .sort('-createdAt')
      .skip(skip)
      .limit(limit);

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
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Get all orders (Admin)
// @route   GET /api/orders
// @access  Private/Admin
const getOrders = asyncHandler(async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    const { status, search, startDate, endDate, paymentStatus } = req.query;

    // Build filter
    const filter = {};
    
    if (status && status !== 'all') {
      filter.status = status;
    }

    if (paymentStatus && paymentStatus !== 'all') {
      filter.isPaid = paymentStatus === 'paid';
    }

    if (search) {
      filter.$or = [
        { _id: { $regex: search, $options: 'i' } },
        { 'user.firstName': { $regex: search, $options: 'i' } },
        { 'user.lastName': { $regex: search, $options: 'i' } },
        { 'user.email': { $regex: search, $options: 'i' } },
        { 'orderItems.productId.name': { $regex: search, $options: 'i' } }
      ];
    }

    if (startDate && endDate) {
      filter.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const orders = await Order.find(filter)
      .populate('user', 'firstName lastName email number')
      .populate('orderItems.productId', 'name price category vendorId')
      .populate('couponCode', 'code discount type')
      .sort('-createdAt')
      .skip(skip)
      .limit(limit);

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
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Cancel order
// @route   PUT /api/orders/:id/cancel
// @access  Private
const cancelOrder = asyncHandler(async (req, res) => {
  try {
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

    // Check if order can be cancelled
    if (order.status === 'cancelled') {
      res.status(400);
      throw new Error('Order is already cancelled');
    }

    if (order.status === 'delivered') {
      res.status(400);
      throw new Error('Cannot cancel a delivered order');
    }

    if (order.status === 'shipped') {
      res.status(400);
      throw new Error('Cannot cancel a shipped order. Please contact support.');
    }

    order.status = 'cancelled';
    order.cancelledAt = Date.now();

    const updatedOrder = await order.save();

    res.json({
      success: true,
      data: updatedOrder,
      message: 'Order cancelled successfully'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Update order status (Admin)
// @route   PUT /api/orders/:id/status
// @access  Private/Admin
const updateOrderStatus = asyncHandler(async (req, res) => {
  try {
    const { status } = req.body;
    
    if (!status) {
      res.status(400);
      throw new Error('Status is required');
    }

    const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) {
      res.status(400);
      throw new Error('Invalid status');
    }

    const order = await Order.findById(req.params.id);

    if (!order) {
      res.status(404);
      throw new Error('Order not found');
    }

    order.status = status;
    
    if (status === 'delivered') {
      order.deliveredAt = Date.now();
      order.isDelivered = true;
    } else if (status === 'cancelled') {
      order.cancelledAt = Date.now();
    }

    const updatedOrder = await order.save();

    res.json({
      success: true,
      data: updatedOrder,
      message: `Order status updated to ${status}`
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

const getOrderStats = asyncHandler(async (req, res) => {
  try {
    const { period = '30' } = req.query;
    const days = parseInt(period);
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

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
          processingOrders: {
            $sum: {
              $cond: [{ $eq: ['$status', 'processing'] }, 1, 0]
            }
          },
          shippedOrders: {
            $sum: {
              $cond: [{ $eq: ['$status', 'shipped'] }, 1, 0]
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
          },
          paidOrders: {
            $sum: {
              $cond: [{ $eq: ['$isPaid', true] }, 1, 0]
            }
          },
          totalDiscount: { $sum: '$discountAmount' }
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
          revenue: { $sum: '$totalPrice' },
          discount: { $sum: '$discountAmount' }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);

    const statusDistribution = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
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
          processingOrders: 0,
          shippedOrders: 0,
          completedOrders: 0,
          cancelledOrders: 0,
          paidOrders: 0,
          totalDiscount: 0
        },
        dailyStats,
        statusDistribution
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Get vendor orders
// @route   GET /api/orders/vendor
// @access  Private (Vendor)
const getVendorOrders = asyncHandler(async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    const { status, search, startDate, endDate } = req.query;

    // Get vendor's product IDs
    const vendorProducts = await Product.find({ vendorId: req.vendor._id }).distinct('_id');

    if (vendorProducts.length === 0) {
      return res.json({
        success: true,
        data: [],
        pagination: {
          page,
          limit,
          total: 0,
          pages: 0
        }
      });
    }

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
        { 'user.firstName': { $regex: search, $options: 'i' } },
        { 'user.lastName': { $regex: search, $options: 'i' } },
        { 'user.email': { $regex: search, $options: 'i' } },
        { 'orderItems.productId.name': { $regex: search, $options: 'i' } }
      ];
    }

    if (startDate && endDate) {
      filter.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const orders = await Order.find(filter)
      .populate('user', 'firstName lastName email number')
      .populate({
        path: 'orderItems.productId',
        select: 'name price files vendorId category',
        match: { vendorId: req.vendor._id }
      })
      .populate('couponCode', 'code discount type')
      .sort('-createdAt')
      .skip(skip)
      .limit(limit);

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
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});


const getVendorOrderById = asyncHandler(async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('user', 'firstName lastName email number')
      .populate({
        path: 'orderItems.productId',
        select: 'name price mrp discount files vendorId category'
      })
      .populate('couponCode', 'code discount type');

    if (!order) {
      res.status(404);
      throw new Error('Order not found');
    }

    // Return the full order with all items
    res.json({
      success: true,
      data: order
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

const updateVendorOrderStatus = asyncHandler(async (req, res) => {
  try {
    const { status } = req.body;
    
    if (!status) {
      res.status(400);
      throw new Error('Status is required');
    }

    const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) {
      res.status(400);
      throw new Error('Invalid status');
    }
    
    const vendorProductIds = await Product.find({ vendorId: req.vendor._id }).distinct('_id');
    
    const order = await Order.findById(req.params.id);

    if (!order) {
      res.status(404);
      throw new Error('Order not found');
    }

    let updatedItems = 0;

    // order.orderItems.forEach(item => {
    //   if (vendorProductIds.includes(item.productId)) {
    //     item.status = status;
    //     updatedItems++;
    //   }
    // });

    // if (updatedItems === 0) {
    //   res.status(400);
    //   throw new Error('No vendor products found in this order');
    // }

    const vendorItems = order.orderItems.filter(item => 
      vendorProductIds.includes(item.productId)
    );
    if (vendorItems.length > 0 && vendorItems.every(item => item.status === status)) {
      order.status = status;
    }

    const updatedOrder = await order.save();

    res.json({
      success: true,
      data: updatedOrder,
      message: `Updated ${updatedItems} item(s) status to ${status}`
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Get vendor order statistics
// @route   GET /api/orders/vendor/stats
// @access  Private (Vendor)
const getVendorOrderStats = asyncHandler(async (req, res) => {
  try {
    const { period = '30' } = req.query;
    const days = parseInt(period);
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Get vendor's product IDs
    const vendorProductIds = await Product.find({ vendorId: req.vendor._id }).distinct('_id');

    if (vendorProductIds.length === 0) {
      return res.json({
        success: true,
        data: {
          summary: {
            totalOrders: 0,
            totalRevenue: 0,
            averageOrderValue: 0,
            pendingOrders: 0,
            processingOrders: 0,
            shippedOrders: 0,
            completedOrders: 0,
            cancelledOrders: 0
          },
          dailyStats: [],
          statusDistribution: []
        }
      });
    }

    const stats = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate },
          'orderItems.productId': { $in: vendorProductIds }
        }
      },
      {
        $unwind: '$orderItems'
      },
      {
        $match: {
          'orderItems.productId': { $in: vendorProductIds }
        }
      },
      {
        $group: {
          _id: null,
          totalOrders: { $addToSet: '$_id' },
          totalRevenue: { $sum: '$orderItems.price' },
          totalItems: { $sum: '$orderItems.quantity' },
          pendingOrders: {
            $sum: {
              $cond: [{ $eq: ['$status', 'pending'] }, 1, 0]
            }
          },
          processingOrders: {
            $sum: {
              $cond: [{ $eq: ['$status', 'processing'] }, 1, 0]
            }
          },
          shippedOrders: {
            $sum: {
              $cond: [{ $eq: ['$status', 'shipped'] }, 1, 0]
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
          createdAt: { $gte: startDate },
          'orderItems.productId': { $in: vendorProductIds }
        }
      },
      {
        $unwind: '$orderItems'
      },
      {
        $match: {
          'orderItems.productId': { $in: vendorProductIds }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
          },
          orders: { $addToSet: '$_id' },
          revenue: { $sum: '$orderItems.price' },
          items: { $sum: '$orderItems.quantity' }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);

    const statusDistribution = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate },
          'orderItems.productId': { $in: vendorProductIds }
        }
      },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const summary = stats[0] || {
      totalOrders: [],
      totalRevenue: 0,
      totalItems: 0,
      pendingOrders: 0,
      processingOrders: 0,
      shippedOrders: 0,
      completedOrders: 0,
      cancelledOrders: 0
    };

    res.json({
      success: true,
      data: {
        summary: {
          ...summary,
          totalOrders: summary.totalOrders.length,
          averageOrderValue: summary.totalOrders.length > 0 ? summary.totalRevenue / summary.totalOrders.length : 0
        },
        dailyStats: dailyStats.map(stat => ({
          ...stat,
          orders: stat.orders.length
        })),
        statusDistribution
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
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
  updateVendorOrderStatus,
  getVendorOrderStats
}; 