import mongoose from 'mongoose';
import Order from '../models/Order.js';
import Vendor from '../models/Vendor.js';
import Product from '../models/Product.js';
import Category from '../models/Category.js';
import Coupon from '../models/Coupon.js';
import Admin from '../models/Admin.js';

export default {
    getAllOrders: ({ search, skip }, limit) => {
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
                    price: '$order.price'
                }
            },
            {
                $match: {
                    customer: { $regex: search, $options: 'i' }
                }
            },
            { $sort: { OrderId: -1 } },
            { $skip: parseInt(skip) },
            { $limit: limit }
        ]);
    },

    getTotalOrders: ({ search }) => {
        return Order.aggregate([
            { $unwind: '$order' },
            {
                $project: {
                    customer: '$order.details.name'
                }
            },
            {
                $match: {
                    customer: { $regex: search, $options: 'i' }
                }
            },
            {
                $group: {
                    _id: null,
                    count: { $sum: 1 }
                }
            }
        ]).then(result => result.length > 0 ? result[0].count : 0);
    },

    getOrderSpecific: async ({ orderId, userId }) => {
        if (userId.length !== 24) {
            throw new Error('Invalid user ID');
        }

        const order = await Order.aggregate([
            { $match: { _id: new mongoose.Types.ObjectId(userId) } },
            { $unwind: '$order' },
            { $match: { 'order.secretOrderId': orderId } },
            {
                $project: {
                    userId: userId,
                    proName: '$order.proName',
                    proId: '$order.product',
                    secretOrderId: orderId,
                    created: '$order.date',
                    quantity: '$order.quantity',
                    price: '$order.price',
                    mrp: '$order.mrp',

                    shipment_id: '$order.shipment_id',
                    payId: '$order.payId',
                    OrderStatus: '$order.OrderStatus',
                    details: '$order.details',
                    updated: '$order.updated',
                    returnReason: '$order.returnReason',
                    slug: '$order.slug',
                    vendorId: '$order.vendorId',
                    variantSize: '$order.variantSize'
                }
            }
        ]);

        if (order && order.length > 0) {
            return order[0];
        } else {
            throw new Error('Order not found');
        }
    },

    editOrder: ({ shipment_id, OrderStatus, userId, secretOrderId }, updated) => {
        return Order.updateOne(
            {
                _id: new mongoose.Types.ObjectId(userId),
                'order.secretOrderId': secretOrderId
            },
            {
                $set: {
                    'order.$.shipment_id': shipment_id,
                    'order.$.OrderStatus': OrderStatus,
                    'order.$.updated': updated
                }
            }
        );
    },

    getTotalVendors: (status) => {
        return Vendor.countDocuments({ accept: status });
    },

    getAllVendors: (status, skip, limit) => {
        return Vendor.find({ accept: status })
            .sort({ _id: -1 })
            .skip(parseInt(skip))
            .limit(limit);
    },

    acceptVendor: (email) => {
        return Vendor.updateOne(
            { email: email },
            { $set: { accept: true } }
        );
    },

    deleteVendor: async (email) => {
        const result = await Vendor.deleteOne({ email: email });
        if (result.deletedCount === 0) {
            throw new Error('Vendor not found');
        }
        return result;
    },

    getSpecificVendor: (vendorId) => {
        return Vendor.findById(vendorId);
    },

    getSpecificVendorProductsTotal: ({ search, vendorId, skip }) => {
        return Product.countDocuments({
            name: { $regex: search, $options: 'i' },
            vendor: true,
            vendorId: vendorId
        });
    },

    getSpecificVendorProducts: ({ search, vendorId, skip }, limit) => {
        return Product.find({
            name: { $regex: search, $options: 'i' },
            vendor: true,
            vendorId: vendorId
        })
            .sort({ _id: -1 })
            .skip(parseInt(skip))
            .limit(limit);
    },

    deleteProduct: async (Id) => {
        const result = await Product.deleteOne({ _id: Id });
        if (result.deletedCount === 0) {
            throw new Error('Product not found');
        }
        return result;
    },

    updateProduct: (data) => {
        return Product.updateOne(
            { _id: data._id },
            {
                $set: {
                    name: data.name,
                    slug: data.slug,
                    price: data.price,
                    mrp: data.mrp,
                    available: data.available,
                    category: data.category,
                    categorySlug: data.categorySlug,
                    srtDescription: data.srtDescription,
                    description: data.description,
                    seoDescription: data.seoDescription,
                    seoKeyword: data.seoKeyword,
                    seoTitle: data.seoTitle,
                    vendor: false,
                    files: data.serverImg,
                    discount: data.discount,
                    return: data.return,
                    cancellation: data.cancellation,
                    pickup_location: data.pickup_location,
                    variant: data.variant,
                    variantDetails: data.variantDetails,
                    currVariantSize: data.currVariantSize
                }
            }
        );
    },

    addProduct: (details) => {
        return Product.create(details);
    },

    addCategory: (data) => {
        return Category.create(data);
    },

    editCategory: (details) => {
        return Category.updateOne(
            { _id: details.cateId },
            {
                $set: {
                    name: details.name,
                    file: details.file
                }
            }
        );
    },

    deleteCategory: async (Id) => {
        const result = await Category.deleteOne({ _id: Id });
        if (result.deletedCount === 0) {
            throw new Error('Category not found');
        }
        return result;
    },

    addHeaderCategory: (details) => {
        return Category.updateOne(
            { _id: details.cateId },
            { $set: { header: details.header } }
        );
    },

    addMainSubCategory: (details, cateId) => {
        return Category.updateOne(
            { _id: cateId },
            { $push: { mainSub: details } }
        );
    },

    addSubCategory: (details, cateId) => {
        return Category.updateOne(
            { _id: cateId },
            { $push: { sub: details } }
        );
    },

    deleteMainSubCategory: (details, cateId) => {
        return Category.updateOne(
            { _id: cateId },
            { $pull: { mainSub: details } }
        );
    },

    deleteSubCategory: (details, cateId) => {
        return Category.updateOne(
            { _id: cateId },
            { $pull: { sub: details } }
        );
    },

    getAdminProducts: (skip, limit) => {
        return Product.find({ vendor: false })
            .sort({ _id: -1 })
            .skip(skip)
            .limit(limit);
    },

    getProductCount: () => {
        return Product.countDocuments({ vendor: false });
    },

    getProductCountAdminSearch: (search) => {
        return Product.countDocuments({
            name: { $regex: search, $options: 'i' },
            vendor: false
        });
    },

    getAdminProductsSearch: (search, skip, limit) => {
        return Product.find({
            name: { $regex: search, $options: 'i' },
            vendor: false
        })
            .sort({ _id: -1 })
            .skip(skip)
            .limit(limit);
    },

    addCupon: async (details) => {
        const existingCoupon = await Coupon.findOne({ code: details.code });
        if (existingCoupon) {
            throw new Error('Coupon code already exists');
        }
        return Coupon.create(details);
    },

    getCupons: () => {
        return Coupon.find();
    },

    deleteCupon: async (Id) => {
        const result = await Coupon.deleteOne({ _id: Id });
        if (result.deletedCount === 0) {
            throw new Error('Coupon not found');
        }
    },

    hideVendorProducts: (vendorId) => {
        return Product.updateMany(
            { vendorId: vendorId },
            { $set: { available: "false" } }
        );
    },

    getDashboardTotal: async () => {
        const [totalDelivered, totalReturn, totalCancelled, totalAmount] = await Promise.all([
            Order.aggregate([
                { $unwind: '$order' },
                { $match: { 'order.OrderStatus': 'Delivered' } },
                {
                    $group: {
                        _id: 'Delivered',
                        count: { $sum: 1 }
                    }
                }
            ]),
            Order.aggregate([
                { $unwind: '$order' },
                { $match: { 'order.OrderStatus': 'Return' } },
                {
                    $group: {
                        _id: 'Return',
                        count: { $sum: 1 }
                    }
                }
            ]),
            Order.aggregate([
                { $unwind: '$order' },
                { $match: { 'order.OrderStatus': 'Cancelled' } },
                {
                    $group: {
                        _id: 'Cancelled',
                        count: { $sum: 1 }
                    }
                }
            ]),
            Order.aggregate([
                { $unwind: '$order' },
                { $match: { 'order.OrderStatus': 'Delivered' } },
                {
                    $group: {
                        _id: 'Amount',
                        amount: { $sum: '$order.price' }
                    }
                }
            ])
        ]);

        return {
            totalAmount: totalAmount.length > 0 ? totalAmount[0].amount : 0,
            totalDelivered: totalDelivered.length > 0 ? totalDelivered[0].count : 0,
            totalReturn: totalReturn.length > 0 ? totalReturn[0].count : 0,
            totalCancelled: totalCancelled.length > 0 ? totalCancelled[0].count : 0
        };
    },

    loginAdmin: async ({ email, password }) => {
        const admin = await Admin.findOne({ email: email }).select('+password');
        if (!admin) {
            return { login: false };
        }

        const isPasswordValid = await admin.comparePassword(password);
        if (isPasswordValid) {
            admin.password = undefined; // Don't send password back
            return { login: true, admin };
        } else {
            return { login: false };
        }
    },

    getAdmin: (Id) => {
        return Admin.findById(Id);
    }
};