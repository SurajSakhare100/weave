import asyncHandler from 'express-async-handler';
import Order from '../../models/Order.js';
import Product from '../../models/Product.js';
import User from '../../models/User.js';
import Vendor from '../../models/Vendor.js';
import Coupon from '../../models/Coupon.js';
import userHelpers from '../../helpers/userHelpers.js';

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
export const createOrder = asyncHandler(async (req, res) => {
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
      if (product.available !== true) {
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
    calculatedTotalPrice = calculatedItemsPrice - discountAmount ;

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
    console.error('Error in createOrder:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private
export const getOrderById = asyncHandler(async (req, res) => {
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

// @desc    Cancel order
// @route   PUT /api/orders/:id/cancel
// @access  Private
export const cancelOrder = asyncHandler(async (req, res) => {
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
