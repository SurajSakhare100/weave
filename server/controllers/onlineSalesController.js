import asyncHandler from 'express-async-handler';
import Order from '../models/Order.js';
import VendorSales from '../models/VendorSales.js';
import StockMovement from '../models/StockMovement.js';
import Product from '../models/Product.js';
import Vendor from '../models/Vendor.js';

// @desc    Record online sale when order is completed/paid
// @route   POST /api/orders/:orderId/record-sales
// @access  Private (System/Admin)
export const recordOnlineSalesFromOrder = asyncHandler(async (req, res) => {
  const { orderId } = req.params;
  
  const order = await Order.findById(orderId).populate('orderItems.productId');
  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }
  
  // Check if sales already recorded for this order
  const existingSales = await VendorSales.findOne({ orderId });
  if (existingSales) {
    return res.status(400).json({
      success: false,
      message: 'Sales already recorded for this order'
    });
  }
  
  const salesRecords = [];
  
  // Process each item in the order
  for (const item of order.orderItems) {
    const product = await Product.findById(item.productId);
    if (!product) {
      console.error(`Product not found: ${item.productId}`);
      continue;
    }
    
    const vendor = await Vendor.findById(product.vendorId);
    if (!vendor) {
      console.error(`Vendor not found for product: ${item.productId}`);
      continue;
    }
    
    // Calculate platform commission (e.g., 5% of sale)
    const platformCommissionRate = 0.05; // 5%
    const saleAmount = item.price * item.quantity;
    const platformCommission = saleAmount * platformCommissionRate;
    const netAmount = saleAmount - platformCommission;
    
    // Create sales record
    const sale = await VendorSales.create({
      vendorId: product.vendorId,
      productId: item.productId,
      saleType: 'online',
      quantity: item.quantity,
      unitPrice: item.price,
      totalAmount: saleAmount,
      customerName: order.shippingAddress?.name || 'Online Customer',
      customerPhone: order.shippingAddress?.phone,
      customerEmail: order.user?.email,
      paymentMethod: order.paymentMethod || 'online_payment',
      discount: 0, // Discounts handled at order level
      platformCommission,
      netAmount,
      orderId: order._id,
      status: 'completed',
      saleDate: order.createdAt
    });
    
    salesRecords.push(sale);
    
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
        referenceId: order._id.toString(),
        reason: 'Online sale',
        createdBy: order.user,
        createdByModel: 'User'
      });
    }
    
    // Update vendor sales stats
    await vendor.updateSalesStats();
  }
  
  res.status(201).json({
    success: true,
    message: `Recorded ${salesRecords.length} online sales from order`,
    data: salesRecords
  });
});

// @desc    Auto-record sales when order status changes to 'paid' or 'completed'
// @route   PUT /api/orders/:orderId/status
// @access  Private (System/Admin)
export const updateOrderStatusAndRecordSales = asyncHandler(async (req, res) => {
  const { orderId } = req.params;
  const { status } = req.body;
  
  const order = await Order.findById(orderId);
  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }
  
  const oldStatus = order.status;
  order.status = status;
  await order.save();
  
  // Auto-record sales when order is paid/completed
  if ((status === 'paid' || status === 'completed') && oldStatus !== status) {
    try {
      // Check if sales already recorded
      const existingSales = await VendorSales.findOne({ orderId });
      if (!existingSales) {
        // Record the sales
        await recordOnlineSalesFromOrder({ params: { orderId } }, res);
        return; // Response already sent by recordOnlineSalesFromOrder
      }
    } catch (error) {
      console.error('Error recording online sales:', error);
      // Continue with order status update even if sales recording fails
    }
  }
  
  res.json({
    success: true,
    message: 'Order status updated successfully',
    data: order
  });
});

// @desc    Get sales breakdown for an order
// @route   GET /api/orders/:orderId/sales
// @access  Private
export const getOrderSalesBreakdown = asyncHandler(async (req, res) => {
  const { orderId } = req.params;
  
  const sales = await VendorSales.find({ orderId })
    .populate('vendorId', 'name businessName')
    .populate('productId', 'name price images');
  
  if (sales.length === 0) {
    return res.status(404).json({
      success: false,
      message: 'No sales records found for this order'
    });
  }
  
  const breakdown = {
    totalSales: sales.reduce((sum, sale) => sum + sale.totalAmount, 0),
    totalCommission: sales.reduce((sum, sale) => sum + sale.platformCommission, 0),
    totalNetToVendors: sales.reduce((sum, sale) => sum + sale.netAmount, 0),
    vendorBreakdown: sales.map(sale => ({
      vendor: sale.vendorId,
      product: sale.productId,
      quantity: sale.quantity,
      unitPrice: sale.unitPrice,
      totalAmount: sale.totalAmount,
      commission: sale.platformCommission,
      netAmount: sale.netAmount
    }))
  };
  
  res.json({
    success: true,
    data: breakdown
  });
});

export default {
  recordOnlineSalesFromOrder,
  updateOrderStatusAndRecordSales,
  getOrderSalesBreakdown
};
