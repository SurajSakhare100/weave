import mongoose from 'mongoose';
import Vendor from '../models/Vendor.js';
import Otp from '../models/Otp.js';
import Product from '../models/Product.js';
import Order from '../models/Order.js';

export default {
    addVendor: async (details) => {
        const vendor = await Vendor.findOne({ email: details.email });
        if (vendor) {
            return { found: true };
        }
        await Vendor.create(details);
        return { found: false };
    },

    checkVendorAccept: async (email) => {
        const vendor = await Vendor.findOne({ email, accept: true });
        return !!vendor;
    },
    
    checkOtp: (email, type, otpFor) => {
        return Otp.findOne({ email, type, for: otpFor });
    },

    insertOtp: (email, otp, type, otpFor) => {
        return Otp.create({ email, otp, type, for: otpFor });
    },
    
    matchOtp: async ({ email, otp }, type, otpFor) => {
        const otpEntry = await Otp.findOne({ email, otp, type, for: otpFor });
        return !!otpEntry;
    },

    getVendorAccepted: (email) => {
        return Vendor.findOne({ email, accept: true });
    },

    getVendor: (id) => {
        return Vendor.findById(id);
    },

    getOneProduct: (vendorId, proId) => {
        return Product.findOne({ _id: proId, vendorId: vendorId });
    },

    addProduct: (details) => {
        return Product.create(details);
    },

    updateProduct: (data, vendorId) => {
        const { _id, ...updateData } = data;
        return Product.updateOne({ _id, vendorId }, { $set: updateData });
    },

    getVendorProducts: (skip, limit, vendorId) => {
        return Product.find({ vendorId }).sort({ _id: -1 }).skip(skip).limit(limit).exec();
    },
    
    getProductVendorCount: (vendorId) => {
        return Product.countDocuments({ vendorId });
    },

    getProductCountVendorSearch: (search, vendorId) => {
        return Product.countDocuments({ vendorId, name: { $regex: search, $options: 'i' } });
    },

    getVendorProductsSearch: (search, skip, limit, vendorId) => {
        return Product.find({ vendorId, name: { $regex: search, $options: 'i' } })
            .sort({ _id: -1 })
            .skip(skip)
            .limit(limit)
            .exec();
    },

    deleteProduct: async ({ proId, vendorId }) => {
        const result = await Product.deleteOne({ _id: proId, vendorId });
        if (result.deletedCount === 0) {
            throw new Error('Product not found or not authorized to delete.');
        }
        return result;
    },

    getAllOrders: ({ search, skip, vendorId }, limit) => {
        return Order.aggregate([
            { $unwind: '$order' },
            {
                $project: {
                    userId: '$_id',
                    date: '$order.date',
                    product: { $toString: '$order.product' },
                    secretOrderId: '$order.secretOrderId',
                    customer: '$order.details.name',
                    payStatus: '$order.payStatus',
                    payType: '$order.details.payType',
                    OrderId: '$order.OrderId',
                    OrderStatus: '$order.OrderStatus',
                    price: '$order.price',
                    vendorId: '$order.vendorId',
                }
            },
            {
                $match: {
                    vendorId: new mongoose.Types.ObjectId(vendorId),
                    customer: { $regex: search, $options: 'i' }
                }
            },
            { $sort: { OrderId: -1 } },
            { $skip: parseInt(skip) },
            { $limit: limit }
        ]);
    },

    getTotalOrders: async ({ search, vendorId }) => {
        const result = await Order.aggregate([
            { $unwind: '$order' },
            { $match: { 'order.vendorId': new mongoose.Types.ObjectId(vendorId), 'order.details.name': { $regex: search, $options: 'i' } } },
            { $count: 'count' }
        ]);
        return result.length > 0 ? result[0].count : 0;
    },

    getOrderSpecific: async ({ orderId, userId, vendorId }) => {
        const order = await Order.findOne(
            { _id: userId, 'order.secretOrderId': orderId, 'order.vendorId': vendorId },
            { 'order.$': 1 }
        ).populate('order.product');
        return order ? order.order[0] : null;
    },

    updateUserDetails: async ({ email, number, vendorId }) => {
        const ownVendor = await Vendor.findOne({ _id: vendorId, email: email });

        if (ownVendor) {
            await Vendor.updateOne({ _id: vendorId }, { $set: { number } });
            return { email: false };
        } else {
            const anotherVendor = await Vendor.findOne({ email });
            if (anotherVendor) {
                return { email: true };
            }
            await Vendor.updateOne({ _id: vendorId }, { $set: { email, number } });
            return { email: false };
        }
    },

    updateBankAccount: (details) => {
        const { vendorId, ...bankDetails } = details;
        return Vendor.findByIdAndUpdate(vendorId, { $set: bankDetails });
    },

    getDashboardTotal: async (vendorId) => {
        const id = new mongoose.Types.ObjectId(vendorId);

        const getCountByStatus = (status) => {
            return Order.aggregate([
                { $unwind: '$order' },
                { $match: { 'order.vendorId': id, 'order.OrderStatus': status } },
                { $count: 'count' }
            ]);
        };

        const totalAmountAgg = Order.aggregate([
            { $unwind: '$order' },
            { $match: { 'order.vendorId': id, 'order.OrderStatus': 'Delivered' } },
            { $group: { _id: null, amount: { $sum: '$order.price' } } }
        ]);

        const [delivered, returned, cancelled, amount] = await Promise.all([
            getCountByStatus('Delivered'),
            getCountByStatus('Return'),
            getCountByStatus('Cancelled'),
            totalAmountAgg
        ]);

        return {
            totalAmount: amount.length > 0 ? amount[0].amount : 0,
            totalDelivered: delivered.length > 0 ? delivered[0].count : 0,
            totalReturn: returned.length > 0 ? returned[0].count : 0,
            totalCancelled: cancelled.length > 0 ? cancelled[0].count : 0,
        };
    }
}; 