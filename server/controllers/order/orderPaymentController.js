import asyncHandler from 'express-async-handler';
import Order from '../../models/Order.js';
import VendorSales from '../../models/VendorSales.js';
import StockMovement from '../../models/StockMovement.js';
import Product from '../../models/Product.js';
import Vendor from '../../models/Vendor.js';

// Helper function to record online sales from order
const recordOnlineSalesFromOrder = async (order) => {
  // Check if sales already recorded for this order
  const existingSales = await VendorSales.findOne({ orderId: order._id });
  if (existingSales) {
    return; // Already recorded
  }
  
  const populatedOrder = await Order.findById(order._id).populate('orderItems.productId user');
  
  // Process each item in the order
  for (const item of populatedOrder.orderItems) {
    const product = await Product.findById(item.productId);
    if (!product) continue;
    
    const vendor = await Vendor.findById(product.vendorId);
    if (!vendor) continue;
    
    // Calculate platform commission (e.g., 5% of sale)
    const platformCommissionRate = 0.05; // 5%
    const saleAmount = item.price * item.quantity;
    const platformCommission = saleAmount * platformCommissionRate;
    const netAmount = saleAmount - platformCommission;
    
    // Create sales record
    await VendorSales.create({
      vendorId: product.vendorId,
      productId: item.productId,
      saleType: 'online',
      quantity: item.quantity,
      unitPrice: item.price,
      totalAmount: saleAmount,
      customerName: populatedOrder.shippingAddress?.name || 'Online Customer',
      customerPhone: populatedOrder.shippingAddress?.phone,
      customerEmail: populatedOrder.user?.email,
      paymentMethod: populatedOrder.paymentMethod || 'online_payment',
      discount: 0, // Discounts handled at order level
      platformCommission,
      netAmount,
      orderId: populatedOrder._id,
      status: 'completed',
      saleDate: populatedOrder.createdAt
    });
    
    // Update product stock if vendor has auto-deduction enabled
    if (vendor.autoStockDeduction) {
      const previousStock = product.stock;
      product.stock -= item.quantity;
      await product.save();
      
      // Record stock movement
      await StockMovement.create({
        vendorId: product.vendorId,
        productId: item.productId,
        movementType: 'out',
        quantity: -item.quantity,
        previousStock,
        newStock: product.stock,
        referenceType: 'online_order',
        referenceId: populatedOrder._id.toString(),
        reason: 'Online sale',
        createdBy: populatedOrder.user._id,
        createdByModel: 'User'
      });
    }
    
    // Update vendor sales stats
    await vendor.updateSalesStats();
  }
};

// @desc    Update order to paid
// @route   PUT /api/orders/:id/pay
// @access  Private
export const updateOrderToPaid = asyncHandler(async (req, res) => {
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

    // Auto-record online sales when order is paid
    try {
      await recordOnlineSalesFromOrder(updatedOrder);
    } catch (error) {
      console.error('Error recording online sales:', error);
      // Don't fail the payment if sales recording fails
    }

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
export const updateOrderToDelivered = asyncHandler(async (req, res) => {
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

// Export the helper function for use in other modules
export { recordOnlineSalesFromOrder };
