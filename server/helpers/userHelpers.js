import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import Otp from '../models/Otp.js';
import Cart from '../models/Cart.js';
import Wishlist from '../models/Wishlist.js';
import Order from '../models/Order.js';
import Address from '../models/Address.js';
import Product from '../models/Product.js';
import { toObjectId } from '../utils/generateToken.js';

export default {
    CheckUser: async (details) => {
        const user = await User.findOne({ email: details.email });
        return { found: !!user };
    },

    checkOtp: ({ email }, type, otpFor) => {
        return Otp.findOne({ email, type, for: otpFor });
    },

    matchOtp: async ({ email, otp }, type, otpFor) => {
        const otpEntry = await Otp.findOne({ email, otp, type, for: otpFor });
        return !!otpEntry;
    },

    insertOtp: (email, otp, type, otpFor) => {
        return Otp.create({ email, otp, type, for: otpFor });
    },

    CreateUser: async (details) => {
        const userExists = await User.findOne({ email: details.email });
        if (userExists) {
            return false;
        }
        await User.create(details);
        return true;
    },

    LoginUser: async (details) => {
        const user = await User.findOne({ email: details.email }).select('+password');
        if (user && (await user.comparePassword(details.password))) {
            user.password = undefined;
            return { login: true, user };
        }
        return { login: false };
    },

    getUser: (userId) => {
        return User.findById(userId);
    },

    changeUserInfo: async (details) => {
        const user = await User.findOne({ email: details.email }).select('+password');
        if (user && (await user.comparePassword(details.password))) {
            user.name = details.name;
            user.number = details.number;
            await user.save();
            return true;
        }
        return false;
    },

    changeEmail: async (details) => {
        const user = await User.findOne({ email: details.email }).select('+password');
        if (!user) return { already: false, pass: false, done: false };

        const passMatch = await user.comparePassword(details.password);
        if (!passMatch) return { already: false, pass: true, done: false };

        const newEmailExists = await User.findOne({ email: details.newEmail });
        if (newEmailExists) return { already: true, done: false };

        user.email = details.newEmail;
        await user.save();
        return { done: true };
    },

    changePassword: async (details) => {
        const user = await User.findOne({ email: details.email }).select('+password');
        if (!user || !(await user.comparePassword(details.currPass))) {
            return false;
        }
        user.password = details.newPass;
        await user.save();
        return true;
    },

    forgotPassword: async (details) => {
        const user = await User.findOne({ email: details.email });
        if (!user) return false;
        user.password = details.password;
        await user.save();
        return true;
    },

    addToCart: async ({ userId, item }) => {
        console.log('User helper - Input:', { userId, item });
        
        // Ensure proId is an ObjectId
        const proId = toObjectId(item.proId);
        if (!proId) {
            throw new Error('Invalid product ID');
        }
        
        const cartItem = {
            ...item,
            proId: proId
        };
        
        console.log('User helper - Cart item:', cartItem);
        
        // First check if item already exists in cart
        const existingCart = await Cart.findOne({ 
            user: userId, 
            'items.proId': proId 
        });
        
        console.log('User helper - Existing cart:', existingCart);
        
        if (existingCart) {
            // Item exists, update quantity
            const result = await Cart.updateOne(
                { user: userId, 'items.proId': proId },
                { $inc: { 'items.$.quantity': item.quantity } }
            );
            console.log('User helper - Update result:', result);
            return { found: true, updated: true };
        } else {
            // Item doesn't exist, add new item
            const result = await Cart.findOneAndUpdate(
                { user: userId },
                { $push: { items: cartItem } },
                { upsert: true, new: true }
            );
            console.log('User helper - Add result:', result);
            return { found: false, added: true };
        }
    },

    checkItemInCart: async ({ userId, proId }) => {
        // Ensure proId is an ObjectId
        const objectId = toObjectId(proId);
        if (!objectId) {
            throw new Error('Invalid product ID');
        }
        
        const cart = await Cart.findOne({ user: userId, 'items.proId': objectId });
        return { incart: !!cart };
    },

    getCartItems: async (userId) => {
        const cart = await Cart.findOne({ user: userId }).populate({
            path: 'items.proId',
            model: 'Product',
            match: { available: true }
        });
        
        console.log('User helper - Raw cart data:', JSON.stringify(cart, null, 2));
        
        if (!cart) {
            return { result: [], amount: { _id: userId, totalPrice: 0, totalDiscount: 0, totalMrp: 0 } };
        }

        const result = cart.items.filter(item => item.proId);
        console.log('User helper - Filtered items:', JSON.stringify(result, null, 2));
        
        const amount = result.reduce((acc, item) => {
            acc.totalPrice += item.quantity * item.price;
            acc.totalMrp += item.quantity * item.mrp;
            return acc;
        }, { _id: userId, totalPrice: 0, totalMrp: 0 });

        amount.totalDiscount = amount.totalMrp - amount.totalPrice;

        // Process each item to ensure proper structure
        const processedResult = result.map(i => {
            const itemObj = i.toObject();
            console.log('User helper - Item object:', JSON.stringify(itemObj, null, 2));
            
            // The proId field should be the original ObjectId (string) for API calls
            // The item field should contain the populated product data
            return {
                ...itemObj,
                proId: itemObj.proId?._id?.toString() || itemObj.proId?.toString() || itemObj.proId,
                item: i.proId // This contains the populated product data
            };
        });

        console.log('User helper - Final processed result:', JSON.stringify(processedResult, null, 2));

        return { result: processedResult, amount };
    },
    
    addToWishlist: async ({ userId, item }) => {
        // Ensure proId is an ObjectId
        const proId = toObjectId(item.proId);
        if (!proId) {
            throw new Error('Invalid product ID');
        }
        
        return Wishlist.findOneAndUpdate(
            { user: userId },
            { $addToSet: { items: { proId: proId, price: item.price, mrp: item.mrp, variantSize: item.variantSize } } },
            { upsert: true, new: true }
        );
    },

    getWishlistItems: (userId) => {
        return Wishlist.findOne({ user: userId }).populate('items.proId');
    },

    removeItemWihslist: ({ userId, proId }) => {
        // Ensure proId is an ObjectId
        const objectId = toObjectId(proId);
        if (!objectId) {
            throw new Error('Invalid product ID');
        }
        
        return Wishlist.updateOne({ user: userId }, { $pull: { items: { proId: objectId } } });
    },

    removeItemCart: ({ userId, proId }) => {
        // Ensure proId is an ObjectId
        const objectId = toObjectId(proId);
        if (!objectId) {
            throw new Error('Invalid product ID');
        }
        
        return Cart.updateOne({ user: userId }, { $pull: { items: { proId: objectId } } });
    },

    changeQuantityCart: ({ userId, proId, action, quantity }) => {
        // Ensure proId is an ObjectId
        const objectId = toObjectId(proId);
        if (!objectId) {
            throw new Error('Invalid product ID');
        }
        
        if (quantity + action === 0) {
            return Cart.updateOne({ user: userId }, { $pull: { items: { proId: objectId } } });
        }
        return Cart.updateOne(
            { user: userId, 'items.proId': objectId },
            { $inc: { 'items.$.quantity': action } }
        );
    },
    
    createOrder: (details) => {
        return Order.findOneAndUpdate(
            { _id: details._id },
            { $push: { order: { $each: details.order } } },
            { upsert: true, new: true }
        );
    },
    
    emtyCart: (userId) => {
        return Cart.deleteOne({ user: userId });
    },
    
    getOrders: ({ userId, search, skip }, limit) => {
        const match = { 'order.proName': { $regex: search, $options: 'i' } };
        return Order.aggregate([
            { $match: { _id: new mongoose.Types.ObjectId(userId) } },
            { $unwind: '$order' },
            { $match: match },
            { $sort: { 'order.OrderId': -1 } },
            { $skip: parseInt(skip) },
            { $limit: limit },
            { $project: {
                _id: 0,
                product: '$order.product',
                price: '$order.price',
                mrp: "$order.mrp",
                OrderId: '$order.OrderId',
                secretOrderId: '$order.secretOrderId',
                OrderStatus: '$order.OrderStatus',
                date: '$order.date',
                quantity: '$order.quantity',
                name: '$order.proName',
                files: '$order.files',
                uni_id_Mix: '$order.uni_id_Mix',
            }}
        ]);
    },
    
    getSpecificOrder: async ({ userId, orderId }) => {
        const result = await Order.findOne(
            { _id: userId, 'order.secretOrderId': orderId },
            { 'order.$': 1 }
        );
        return result && result.order.length > 0 ? result.order[0] : null;
    },

    cancelOrder: ({ userId, secretOrderId }) => {
        return Order.updateOne(
            { _id: userId, 'order.secretOrderId': secretOrderId },
            { $set: { 'order.$.OrderStatus': 'Cancelled' } }
        );
    },
    
    returnOrder: ({ userId, secretOrderId, reason }) => {
        return Order.updateOne(
            { _id: userId, 'order.secretOrderId': secretOrderId },
            { $set: { 'order.$.OrderStatus': 'Return', 'order.$.returnReason': reason } }
        );
    },

    getCartTotalPrice: async (userId) => {
        const amountArr = await Cart.aggregate([
            { $match: { user: new mongoose.Types.ObjectId(userId) } },
            { $unwind: '$items' },
            {
                $lookup: {
                    from: 'products', // The actual collection name
                    localField: 'items.proId',
                    foreignField: '_id',
                    as: 'product'
                }
            },
            { $unwind: '$product' },
            { $match: { "product.available": true } },
            {
                $group: {
                    _id: '$user',
                    totalPrice: { $sum: { $multiply: ['$items.quantity', '$items.price'] } },
                    totalMrp: { $sum: { $multiply: ['$items.quantity', '$items.mrp'] } }
                }
            },
            {
                $project: {
                    totalPrice: 1,
                    totalMrp: 1,
                    totalDiscount: { $subtract: ['$totalMrp', '$totalPrice'] }
                }
            }
        ]);
        return amountArr[0] || { totalPrice: 0, totalDiscount: 0, totalMrp: 0 };
    },

    getCartTotalPriceCheckout: async (userId, discount) => {
        const amountArr = await Cart.aggregate([
            { $match: { user: new mongoose.Types.ObjectId(userId) } },
            { $unwind: '$items' },
            {
                $lookup: {
                    from: 'products',
                    localField: 'items.proId',
                    foreignField: '_id',
                    as: 'product'
                }
            },
            { $unwind: '$product' },
            { $match: { "product.available": true } },
            {
                $project: {
                    user: 1,
                    quantity: '$items.quantity',
                    price: '$items.price',
                    mrp: '$items.mrp',
                    discount: discount,
                }
            },
            {
                $project: {
                    user: 1,
                    mrp: { $multiply: ['$quantity', '$mrp'] },
                    price: {
                        $let: {
                           vars: {
                              totalItemPrice: { $multiply: ['$quantity', '$price'] }
                           },
                           in: {
                                $cond: {
                                    if: { $gte: ['$$totalItemPrice', discount.min] },
                                    then: { $subtract: ['$$totalItemPrice', { $multiply: ['$$totalItemPrice', discount.discount / 100] }] },
                                    else: '$$totalItemPrice'
                                }
                           }
                        }
                    }
                }
            },
            {
                $group: {
                    _id: '$user',
                    totalPrice: { $sum: '$price' },
                    totalMrp: { $sum: '$mrp' }
                }
            },
            {
                $project: {
                    _id: 1,
                    totalPrice: { $trunc: ['$totalPrice', 2] },
                    totalMrp: 1,
                    totalDiscount: { $trunc: [{ $subtract: ['$totalMrp', '$totalPrice'] }, 2] },
                }
            }
        ]);
        return amountArr[0] || { totalPrice: 0, totalDiscount: 0, totalMrp: 0 };
    },

    getCartProduct4Order: async ({ userId, payment_id }, { discount }, details, OrderId, extraDiscount) => {
        const products = await Cart.aggregate([
            { $match: { user: new mongoose.Types.ObjectId(userId) } },
            { $unwind: '$items' },
            { $lookup: { from: 'products', localField: 'items.proId', foreignField: '_id', as: 'productInfo' } },
            { $unwind: '$productInfo' },
            { $match: { 'productInfo.available': true } },
            {
                $project: {
                    _id: 0,
                    orderItem: {
                        product: '$productInfo._id',
                        proName: '$productInfo.name',
                        pickup_location: '$productInfo.pickup_location',
                        vendorId: "$productInfo.vendorId",
                        return: '$productInfo.return',
                        cancellation: '$productInfo.cancellation',
                        slug: '$productInfo.slug',
                        files: '$productInfo.files',
                        uni_id_Mix: { $concat: ['$productInfo.uni_id_1', '$productInfo.uni_id_2'] },
                        secretOrderId: { $concat: [OrderId, '$productInfo.uni_id_1'] },
                        
                        quantity: '$items.quantity',
                        variantSize: '$items.variantSize',
                        selling_price: '$items.price',
                        mrp: { $multiply: ['$items.quantity', '$items.mrp'] },
                        
                        details: details,
                        OrderId: OrderId,
                        payId: payment_id,
                        OrderStatus: 'Pending',
                        date: new Date().toISOString(),

                        price: {
                           $let: {
                               vars: {
                                  initialPrice: { $multiply: ['$items.quantity', '$items.price'] },
                                  couponDiscount: discount.discount / 100,
                                  extraDisc: extraDiscount / 100
                               },
                               in: {
                                   $let: {
                                       vars: {
                                           couponPrice: {
                                               $cond: {
                                                   if: { $gte: ['$$initialPrice', discount.min] },
                                                   then: { $subtract: ['$$initialPrice', { $multiply: ['$$initialPrice', '$$couponDiscount'] }] },
                                                   else: '$$initialPrice'
                                               }
                                           }
                                       },
                                       in: {
                                           $trunc: [{ $subtract: ['$$couponPrice', { $multiply: ['$$couponPrice', '$$extraDisc'] }] }, 2]
                                       }
                                   }
                               }
                           }
                        },
                    }
                }
            }
        ]);

        if (products.length === 0) return null;

        return {
            _id: new mongoose.Types.ObjectId(userId),
            order: products.map(p => p.orderItem)
        };
    },

    getOrdersTotal: async ({ userId, search }) => {
        const total = await Order.aggregate([
            { $match: { _id: new mongoose.Types.ObjectId(userId) } },
            { $unwind: '$order' },
            { $match: { 'order.proName': { $regex: search, $options: 'i' } } },
            { $group: { _id: null, count: { $sum: 1 } } }
        ]);

        return total.length > 0 ? total[0].count : 0;
    },

    changeOrderStatus: ({ etd, track_url, shipment_track_activities, OrderStatus, userId, secretOrderId, updated }) => {
        return Order.updateOne(
            { _id: new mongoose.Types.ObjectId(userId), 'order.secretOrderId': secretOrderId },
            {
                $set: {
                    'order.$.shipment_track_activities': shipment_track_activities,
                    'order.$.etd': etd,
                    'order.$.OrderStatus': OrderStatus,
                    'order.$.updated': updated,
                    'order.$.track_url': track_url
                }
            }
        );
    },

    AddAddress: ({ name, number, pin, locality, address, city, state }, userId) => {
        const newAddress = { id: new mongoose.Types.ObjectId().toHexString(), name, number, pin, locality, address, city, state };
        return Address.findOneAndUpdate(
            { userId },
            { $push: { saved: newAddress } },
            { upsert: true, new: true }
        );
    },

    getAllAddress: (userId) => {
        return Address.findOne({ userId });
    },

    editAddress: (details) => {
        return Address.updateOne(
            { userId: details.userId, 'saved.id': details.id },
            {
                $set: {
                    'saved.$.name': details.name,
                    'saved.$.number': details.number,
                    'saved.$.pin': details.pin,
                    'saved.$.locality': details.locality,
                    'saved.$.address': details.address,
                    'saved.$.city': details.city,
                    'saved.$.state': details.state,
                }
            }
        );
    },

    deleteAddress: ({ userId, id }) => {
        return Address.updateOne({ userId }, { $pull: { saved: { id: id } } });
    },

    getTotalPriceProduct: async ({ proId, quantity, discount, buyDetails }) => {
        const amountArr = await Product.aggregate([
            { $match: { _id: new mongoose.Types.ObjectId(proId), available: true } },
            {
                $project: {
                    price: { $multiply: [quantity, buyDetails.price] },
                    mrp: { $multiply: [quantity, buyDetails.mrp] },
                    discount: discount
                }
            },
            {
                $project: {
                    mrp: 1,
                    price: {
                        $cond: {
                            if: { $gte: ['$price', '$discount.min'] },
                            then: { $subtract: ['$price', { $multiply: ['$price', { $divide: ['$discount.discount', 100] }] }] },
                            else: '$price'
                        }
                    }
                }
            },
            {
                $project: {
                    totalPrice: { $trunc: ['$price', 2] },
                    totalMrp: '$mrp',
                    totalDiscount: { $trunc: [{ $subtract: ['$mrp', '$price'] }, 2] }
                }
            }
        ]);
        return amountArr[0] || { totalPrice: 0, totalDiscount: 0, totalMrp: 0 };
    },

    getBuyProduct4Order: async ({ userId, payment_id }, { discount, order }, details, OrderId, extraDiscount) => {
         const products = await Product.aggregate([
            { $match: { _id: new mongoose.Types.ObjectId(order.proId), available: true } },
            {
                $project: {
                    _id: 0,
                    orderItem: {
                        product: '$_id',
                        proName: '$name',
                        pickup_location: '$pickup_location',
                        vendorId: "$vendorId",
                        return: '$return',
                        cancellation: '$cancellation',
                        slug: '$slug',
                        files: '$files',
                        uni_id_Mix: { $concat: ['$uni_id_1', '$uni_id_2'] },
                        secretOrderId: { $concat: [OrderId, '$uni_id_1'] },
                        
                        quantity: order.quantity,
                        variantSize: order.buyDetails.variantSize,
                        selling_price: order.buyDetails.price,
                        mrp: { $multiply: [order.quantity, order.buyDetails.mrp] },
                        
                        details: details,
                        OrderId: OrderId,
                        payId: payment_id,
                        OrderStatus: 'Pending',
                        date: new Date().toISOString(),

                        price: {
                           $let: {
                               vars: {
                                  initialPrice: { $multiply: [order.quantity, order.buyDetails.price] },
                                  couponDiscount: discount.discount / 100,
                                  extraDisc: extraDiscount / 100
                               },
                               in: {
                                   $let: {
                                       vars: {
                                           couponPrice: {
                                               $cond: {
                                                   if: { $gte: ['$$initialPrice', discount.min] },
                                                   then: { $subtract: ['$$initialPrice', { $multiply: ['$$initialPrice', '$$couponDiscount'] }] },
                                                   else: '$$initialPrice'
                                               }
                                           }
                                       },
                                       in: {
                                           $trunc: [{ $subtract: ['$$couponPrice', { $multiply: ['$$couponPrice', '$$extraDisc'] }] }, 2]
                                       }
                                   }
                               }
                           }
                        },
                    }
                }
            }
        ]);

        if (products.length === 0) return null;

        return {
            _id: new mongoose.Types.ObjectId(userId),
            order: products.map(p => p.orderItem)
        };
    },
}; 