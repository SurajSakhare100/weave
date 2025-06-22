import mongoose from 'mongoose';
import Product from '../models/Product.js';
import Category from '../models/Category.js';
import Coupon from '../models/Coupon.js';
import Review from '../models/Review.js';

export default {
    getOneProduct: (proId) => {
        return Product.findById(proId);
    },

    getCategories: () => {
        return Category.find();
    },

    searchCategory: (search) => {
        return Category.find({
            name: { $regex: search, $options: "i" }
        }).limit(10);
    },

    getMainSubCategories: () => {
        return Category.aggregate([
            { $unwind: "$mainSub" },
            {
                $project: {
                    name: '$mainSub.name',
                    category: '$mainSub.category',
                    uni_id: '$mainSub.uni_id',
                    slug: '$mainSub.slug'
                }
            }
        ]);
    },

    searchMainSubCategory: (search) => {
        return Category.aggregate([
            { $unwind: '$mainSub' },
            {
                $project: {
                    name: '$mainSub.name',
                    uni_id: '$mainSub.uni_id',
                    slug: '$mainSub.slug',
                    category: "$mainSub.category"
                }
            },
            {
                $match: {
                    name: { $regex: search, $options: 'i' }
                }
            }
        ]);
    },

    getSubCategories: () => {
        return Category.aggregate([
            { $unwind: "$sub" },
            {
                $project: {
                    uni_id: "$sub.uni_id",
                    slug: "$sub.slug",
                    name: "$sub.name",
                    mainSubSlug: "$sub.mainSubSlug",
                    mainSub: "$sub.mainSub",
                    category: "$sub.category"
                }
            },
            {
                $sort: {
                    mainSub: 1
                }
            }
        ]);
    },

    getOneCategory: (cateId) => {
        return Category.findById(cateId);
    },

    getOneUserProduct: (proSlug, proId) => {
        return Product.findOne({
            _id: proId,
            slug: proSlug
        });
    },

    getSimilarProduct: (cateSlug) => {
        return Product.find({
            categorySlug: cateSlug
        }).limit(8);
    },

    getCategoryProduct: (details, skip, limit) => {
        const sort = details.sort;
        return Product.find({
            categorySlug: { $regex: details.category, $options: 'i' },
            price: {
                $gte: details.min,
                $lte: details.max
            }
        }).sort(sort).skip(skip).limit(limit);
    },

    getCategoryProductCount: (details) => {
        return Product.countDocuments({
            categorySlug: { $regex: details.category, $options: 'i' },
            price: {
                $gte: details.min,
                $lte: details.max
            }
        });
    },

    getSearchProductCount: (details) => {
        return Product.countDocuments({
            name: { $regex: details.search, $options: 'i' },
            categorySlug: { $regex: details.category, $options: 'i' },
            price: {
                $gte: details.min,
                $lte: details.max
            }
        });
    },

    getSearchProduct: (details, skip, limit) => {
        const sort = details.sort;
        return Product.find({
            name: { $regex: details.search, $options: 'i' },
            categorySlug: { $regex: details.category, $options: 'i' },
            price: {
                $gte: details.min,
                $lte: details.max
            }
        }).sort(sort).skip(skip).limit(limit);
    },

    getHeaderCategories: () => {
        return Category.find({
            header: "true"
        });
    },

    searchProductSimple: (search) => {
        return Product.find({
            name: { $regex: search, $options: 'i' }
        }).limit(12);
    },

    findCupon: async (details) => {
        const coupon = await Coupon.findOne({ code: details });
        if (!coupon) {
            throw new Error('Coupon not found');
        }
        return coupon;
    },

    addReview: (details) => {
        return Review.create(details);
    },

    getAllReviews: (proId, skip, limit) => {
        return Review.find({
            proId: proId
        }).sort({ _id: -1 }).skip(skip).limit(limit);
    },

    getUserReview: async ({ userId, proId }) => {
        const review = await Review.findOne({
            userId: userId,
            proId: proId
        });
        return !!review;
    },

    getTotalReviewCount: (proId) => {
        return Review.countDocuments({
            proId: proId
        });
    },

    deleteReview: async ({ userId, proId }) => {
        const result = await Review.deleteOne({
            userId: userId,
            proId: proId
        });
        if (result.deletedCount === 0) {
            throw new Error('Review not found');
        }
    },

    getStarsRatingReviews: async (proId) => {
        const stars = await Review.aggregate([
            {
                $match: {
                    proId: proId
                }
            },
            {
                $project: {
                    one: {
                        $cond: {
                            if: { $eq: ['$stars', 'one'] },
                            then: 1,
                            else: 0
                        }
                    },
                    two: {
                        $cond: {
                            if: { $eq: ['$stars', 'two'] },
                            then: 1,
                            else: 0
                        }
                    },
                    three: {
                        $cond: {
                            if: { $eq: ['$stars', 'three'] },
                            then: 1,
                            else: 0
                        }
                    },
                    four: {
                        $cond: {
                            if: { $eq: ['$stars', 'four'] },
                            then: 1,
                            else: 0
                        }
                    },
                    five: {
                        $cond: {
                            if: { $eq: ['$stars', 'five'] },
                            then: 1,
                            else: 0
                        }
                    }
                }
            },
            {
                $group: {
                    _id: proId,
                    count: { $sum: 1 },
                    one: { $sum: '$one' },
                    two: { $sum: '$two' },
                    three: { $sum: '$three' },
                    four: { $sum: '$four' },
                    five: { $sum: '$five' }
                }
            },
            {
                $project: {
                    _id: proId,
                    one: 1,
                    two: 1,
                    three: 1,
                    four: 1,
                    five: 1,
                    onePerc: {
                        $multiply: [
                            { $divide: ['$one', '$count'] },
                            100
                        ]
                    },
                    twoPerc: {
                        $multiply: [
                            { $divide: ['$two', '$count'] },
                            100
                        ]
                    },
                    threePerc: {
                        $multiply: [
                            { $divide: ['$three', '$count'] },
                            100
                        ]
                    },
                    fourPerc: {
                        $multiply: [
                            { $divide: ['$four', '$count'] },
                            100
                        ]
                    },
                    fivePerc: {
                        $multiply: [
                            { $divide: ['$five', '$count'] },
                            100
                        ]
                    },
                    rating: {
                        $divide: [
                            {
                                $sum: [
                                    { $multiply: ['$one', 1] },
                                    { $multiply: ['$two', 2] },
                                    { $multiply: ['$three', 3] },
                                    { $multiply: ['$four', 4] },
                                    { $multiply: ['$five', 5] }
                                ]
                            },
                            {
                                $sum: ['$one', '$two', '$three', '$four', '$five']
                            }
                        ]
                    }
                }
            }
        ]);

        if (stars && stars.length > 0) {
            return stars[0];
        } else {
            return {
                one: 0,
                two: 0,
                three: 0,
                four: 0,
                five: 0,
                onePerc: 0,
                twoPerc: 0,
                threePerc: 0,
                fourPerc: 0,
                fivePerc: 0,
                rating: 0
            };
        }
    }
};