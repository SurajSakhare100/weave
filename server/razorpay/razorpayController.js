import asyncHandler from 'express-async-handler';
import Razorpay from 'razorpay';
import crypto from 'crypto';
import Order from '../models/Order.js';
import dotenv from 'dotenv';

dotenv.config();

const razorpayInstance = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_SECRET
});

// @desc    Create Razorpay order
// @route   POST /api/razorpay/order
// @access  Private
const createRazorpayOrder = asyncHandler(async (req, res) => {
  const { amount, currency, orderId } = req.body;

  if (!amount || !currency || !orderId) {
    res.status(400);
    throw new Error('Amount, currency, and orderId are required');
  }

  const options = {
    amount: amount * 100, // amount in paisa
    currency,
    receipt: orderId, // Use your internal order ID as receipt
    notes: {
      orderId: orderId,
      userId: req.user._id.toString(),
    },
  };

  try {
    const razorpayOrder = await razorpayInstance.orders.create(options);
    res.status(201).json({
      success: true,
      orderId: razorpayOrder.id,
      currency: razorpayOrder.currency,
      amount: razorpayOrder.amount,
      message: 'Razorpay order created successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to create Razorpay order',
      error: error.message,
    });
  }
});

// @desc    Verify Razorpay payment
// @route   POST /api/razorpay/verify
// @access  Private
const verifyRazorpayPayment = asyncHandler(async (req, res) => {
  const {
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
    orderId, // Your internal order ID
  } = req.body;

  if (
    !razorpay_order_id ||
    !razorpay_payment_id ||
    !razorpay_signature ||
    !orderId
  ) {
    res.status(400);
    throw new Error('Missing Razorpay payment verification details');
  }

  const shasum = crypto.createHmac('sha256', process.env.RAZORPAY_SECRET);
  shasum.update(`${razorpay_order_id}|${razorpay_payment_id}`);
  const digest = shasum.digest('hex');

  if (digest === razorpay_signature) {
    // Payment is authentic, now update your internal order status
    const order = await Order.findById(orderId);

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
      id: razorpay_payment_id,
      status: 'succeeded',
      update_time: new Date().toISOString(),
      email_address: req.user.email, // Assuming user is authenticated
      order_id: razorpay_order_id, // Store Razorpay order ID
      signature: razorpay_signature, // Store Razorpay signature
    };
    order.paymentMethod = 'online'; // Ensure payment method is set to online
    order.status = 'processing'; // Update order status to processing after payment

    const updatedOrder = await order.save();

    res.json({
      success: true,
      message: 'Payment verified and order updated',
      order: updatedOrder,
    });
  } else {
    res.status(400);
    throw new Error('Payment signature verification failed');
  }
});

export {
  createRazorpayOrder,
  verifyRazorpayPayment
};
