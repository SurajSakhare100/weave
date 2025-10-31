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

    // Add this function to clean up any existing cart items with null proId
    cleanupInvalidCartItems: async () => {
        try {
            console.log('Starting cleanup of invalid cart items...');
            
            // Find all carts with items that have null proId
            const cartsWithInvalidItems = await Cart.find({
                'items.proId': { $exists: false }
            });
            
            console.log('Found carts with invalid items:', cartsWithInvalidItems.length);
            
            // Clean up each cart
            for (const cart of cartsWithInvalidItems) {
                const validItems = cart.items.filter(item => item.proId);
                const invalidItems = cart.items.filter(item => !item.proId);
                
                console.log(`Cart ${cart._id}: ${invalidItems.length} invalid items found`);
                
                if (invalidItems.length > 0) {
                    // Update the cart to only keep valid items
                    await Cart.updateOne(
                        { _id: cart._id },
                        { $set: { items: validItems } }
                    );
                    console.log(`Cleaned up cart ${cart._id}`);
                }
            }
            
            console.log('Cleanup completed');
        } catch (error) {
            console.error('Error during cleanup:', error);
        }
    },

    addToCart: async ({ userId, item }) => {
        try {
            // Validate input parameters
            if (!userId) {
                throw new Error('User ID is required');
            }
            if (!item || !item.proId) {
                throw new Error('Product ID is required');
            }

            const proId = toObjectId(item.proId);
            if (!proId) {
                throw new Error('Invalid product ID');
            }

            // Verify product exists
            const product = await Product.findById(proId);
            if (!product) {
                throw new Error('Product not found');
            }

            if (!product.available) {
                throw new Error('Product is not available');
            }

            // Use provided variant/size/color fields when available; don't default silently
            const selectedSize = item.variantSize ?? item.size ?? null;
            const variantId = item.variantId ?? null;
            const color = item.color ?? null;
            const colorCode = item.colorCode ?? null;
            const qtyToAdd = Math.max(1, Number(item.quantity ?? 1));

            const cartItem = {
                proId: proId,
                quantity: qtyToAdd,
                price: item.price ?? product.price,
                mrp: item.mrp ?? product.mrp,
                variantSize: selectedSize,
                variantId: variantId,
                color,
                colorCode,
                image: item.image ?? product.primaryImage ?? null,
                name: item.name ?? product.name
            };

            // Load user's cart and try to match an existing item by proId + variantId/variantSize/color
            let userCart = await Cart.findOne({ user: userId });
            if (!userCart) {
                // create a new cart document with this item
                const created = await Cart.create({ user: userId, items: [cartItem] });
                return { found: false, added: true, cart: created };
            }

            // find matching item index
            const matchIndex = (userCart.items || []).findIndex(i => {
                const matchesPro = String(i.proId) === String(proId);
                const matchesVariantId = (variantId && i.variantId) ? String(i.variantId) === String(variantId) : (!variantId && !i.variantId);
                const matchesSize = (selectedSize != null) ? (i.variantSize === selectedSize) : (i.variantSize == null || i.variantSize === '');
                const matchesColor = (color != null) ? (i.color === color) : (i.color == null || i.color === '');
                // require pro match and all provided metadata to match
                return matchesPro && matchesVariantId && matchesSize && matchesColor;
            });

            if (matchIndex !== -1) {
                // increment that specific item's quantity
                userCart.items[matchIndex].quantity = Math.max(1, userCart.items[matchIndex].quantity + qtyToAdd);
                // update price/mrp if provided (optional)
                if (item.price != null) userCart.items[matchIndex].price = item.price;
                if (item.mrp != null) userCart.items[matchIndex].mrp = item.mrp;
                await userCart.save();
                return { found: true, updated: true, cart: userCart };
            } else {
                // push a new distinct variant/size/color entry
                userCart.items.push(cartItem);
                await userCart.save();
                return { found: false, added: true, cart: userCart };
            }
        } catch (error) {
            console.error('Error in addToCart:', error);
            console.error('Error stack:', error.stack);
            throw error;
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
        try {
            console.log('getCartItems called for userId:', userId);
            
            // First, get the cart without populate to see all items
            const cart = await Cart.findOne({ user: userId });
            console.log('Found cart:', cart ? 'yes' : 'no', 'Items count:', cart?.items?.length || 0);
            
            if (!cart || !cart.items || cart.items.length === 0) {
                console.log('No cart or empty cart, returning empty result');
                return { result: [], amount: { _id: userId, totalPrice: 0, totalDiscount: 0, totalMrp: 0 } };
            }

            // Get all product IDs from cart items
            const productIds = cart.items.map(item => item.proId);
            console.log('Product IDs in cart:', productIds);
            
            // Fetch products separately to check availability
            // Note: available is stored as string 'true'/'false', not boolean
            const products = await Product.find({ 
                _id: { $in: productIds }
                // Removed available: true filter to see all products
            });
            
            console.log('Found products:', products.length);
            console.log('Product availability:', products.map(p => ({ id: p._id, name: p.name, available: p.available })));
            
            // Create a map of all products (not just available ones for debugging)
            const allProducts = new Map();
            products.forEach(product => {
                allProducts.set(product._id.toString(), product);
            });
            
            // Filter cart items to only include existing products (for now, include all)
            const validItems = cart.items.filter(item => {
                const productId = item.proId.toString();
                const hasProduct = allProducts.has(productId);
                console.log(`Item ${productId}: has product = ${hasProduct}`);
                return hasProduct;
            });
            
            console.log('Valid items after filtering:', validItems.length);
            
            // Clean up invalid items from the cart (items with non-existent products)
            const invalidItems = cart.items.filter(item => {
                const productId = item.proId.toString();
                return !allProducts.has(productId);
            });
            
            if (invalidItems.length > 0) {
                console.log('Removing invalid items:', invalidItems.length);
                const invalidProIds = invalidItems.map(item => item.proId);
                await Cart.updateOne(
                    { user: userId },
                    { $pull: { items: { proId: { $in: invalidProIds } } } }
                );
            }
            
            // Process each item to include the product data
            const processedResult = validItems.map(item => {
                const productId = item.proId.toString();
                const product = allProducts.get(productId);
                
                const result = {
                    ...item.toObject(),
                    proId: productId,
                    item: product // This contains the product data
                };
                
                console.log('Processed item:', {
                    proId: result.proId,
                    quantity: result.quantity,
                    price: result.price,
                    productName: result.item?.name,
                    productAvailable: result.item?.available
                });
                
                return result;
            });
            
            const amount = processedResult.reduce((acc, item) => {
                acc.totalPrice += item.quantity * item.price;
                acc.totalMrp += item.quantity * item.mrp;
                return acc;
            }, { _id: userId, totalPrice: 0, totalMrp: 0 });

            amount.totalDiscount = amount.totalMrp - amount.totalPrice;

            console.log('Final result:', {
                itemCount: processedResult.length,
                totalPrice: amount.totalPrice,
                totalMrp: amount.totalMrp
            });

            return { result: processedResult, amount };
        } catch (error) {
            console.error('Error in getCartItems:', error);
            return { result: [], amount: { _id: userId, totalPrice: 0, totalDiscount: 0, totalMrp: 0 } };
        }
    },
    
    addToWishlist: async ({ userId, item }) => {
        // Ensure proId is an ObjectId
        const proId = toObjectId(item.proId);
        if (!proId) {
            throw new Error('Invalid product ID');
        }
        
        // Ensure we have a valid size
        const selectedSize = item.variantSize || 'M';
        
        return Wishlist.findOneAndUpdate(
            { user: userId },
            { $addToSet: { items: { proId: proId, price: item.price, mrp: item.mrp, variantSize: selectedSize } } },
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

    removeItemCart: ({ userId, proId ,variantId,size,}) => {
        // Ensure proId is an ObjectId
        const objectId = toObjectId(proId);
        if (!objectId) {
            throw new Error('Invalid product ID');
        }
        
        return Cart.updateOne({ user: userId }, { $pull: { items: { proId: objectId } } });
    },

    changeQuantityCart: async ({ userId, proId, quantity, cartItemId, variantSize, variantId }) => {
        // proId may be optional if cartItemId provided
        try {
            if (!userId) throw new Error('User ID required');

            // Validate quantity
            quantity = Number(quantity);
            if (Number.isNaN(quantity) || quantity < 0) {
                throw new Error('Invalid quantity');
            }

            // If cartItemId is provided, update by that id
            if (cartItemId) {
                if (quantity === 0) {
                    // remove the item
                    return Cart.updateOne({ user: userId }, { $pull: { items: { _id: cartItemId } } });
                }
                return Cart.updateOne({ user: userId, 'items._id': cartItemId }, { $set: { 'items.$.quantity': quantity } });
            }

            // Otherwise require proId to identify item(s)
            const objectId = toObjectId(proId);
            if (!objectId) {
                throw new Error('Invalid product ID');
            }

            // Load cart and find matching item by proId + optional variantSize/variantId
            const cart = await Cart.findOne({ user: userId });
            if (!cart) throw new Error('Cart not found');

            const idx = (cart.items || []).findIndex(i => {
                const matchesPro = String(i.proId) === String(objectId);
                const matchesSize = (typeof variantSize !== 'undefined' && variantSize !== null)
                    ? (i.variantSize === variantSize)
                    : true;
                const matchesVariantId = (typeof variantId !== 'undefined' && variantId !== null)
                    ? ((i.variantId && String(i.variantId) === String(variantId)))
                    : true;
                return matchesPro && matchesSize && matchesVariantId;
            });

            if (idx === -1) {
                throw new Error('Item not found in cart');
            }

            if (quantity === 0) {
                // remove that item
                cart.items.splice(idx, 1);
            } else {
                cart.items[idx].quantity = quantity;
            }

            await cart.save();
            return { ok: true };
        } catch (error) {
            console.error('changeQuantityCart error:', error);
            throw error;
        }
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