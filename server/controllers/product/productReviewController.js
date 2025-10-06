import asyncHandler from 'express-async-handler';
import Product from '../../models/Product.js';
import Review from '../../models/Review.js';

export const createProductReview = asyncHandler(async (req, res) => {
  try {
    const { stars, title, review } = req.body;
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    // Check if user already reviewed this product
    const alreadyReviewed = await Review.findOne({ 
      userId: req.user._id, 
      proId: product._id 
    });

    if (alreadyReviewed) {
      return res.status(400).json({ success: false, message: 'You have already reviewed this product' });
    }

    // Create the review
    const newReview = await Review.create({
      userId: req.user._id,
      proId: product._id,
      stars,
      title,
      review
    });

    // Update product with new review count and average rating
    const allReviews = await Review.find({ proId: product._id, isActive: true });
    const starToNumber = { 'one': 1, 'two': 2, 'three': 3, 'four': 4, 'five': 5 };
    const totalRating = allReviews.reduce((acc, item) => starToNumber[item.stars] + acc, 0);
    
    product.totalReviews = allReviews.length;
    product.averageRating = allReviews.length > 0 ? Math.round((totalRating / allReviews.length) * 10) / 10 : 0;

    await product.save();

    // Populate user info for response
    await newReview.populate('userId', 'name email');

    res.status(201).json({
      success: true,
      message: 'Review added successfully',
      data: newReview
    });
  } catch (error) {
    console.error('Create review error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

export const getProductReviews = asyncHandler(async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    const reviews = await Review.find({ 
      proId: req.params.id, 
      isActive: true 
    })
    .populate('userId', 'firstName lastName email')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);
    
    
    const total = await Review.countDocuments({ 
      proId: req.params.id, 
      isActive: true 
    });

    // Get rating distribution
    const ratingDistribution = await Review.aggregate([
      { $match: { proId: product._id, isActive: true } },
      { $group: { 
        _id: '$stars', 
        count: { $sum: 1 } 
      }},
      { $sort: { _id: 1 } }
    ]);

    res.json({
      success: true,
      data: {
        reviews,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        },
        ratingDistribution,
        summary: {
          totalReviews: product.totalReviews,
          averageRating: product.averageRating
        }
      }
    });
  } catch (error) {
    console.error('Get reviews error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

export const updateProductReview = asyncHandler(async (req, res) => {
  try {
    const { stars, title, review } = req.body;
    const reviewDoc = await Review.findById(req.params.reviewId);

    if (!reviewDoc) {
      return res.status(404).json({ success: false, message: 'Review not found' });
    }

    // Check if user owns this review
    if (reviewDoc.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to update this review' });
    }

    // Update review
    reviewDoc.stars = stars;
    reviewDoc.title = title;
    reviewDoc.review = review;
    await reviewDoc.save();

    // Recalculate product average rating
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    const allReviews = await Review.find({ proId: product._id, isActive: true });
    const starToNumber = { 'one': 1, 'two': 2, 'three': 3, 'four': 4, 'five': 5 };
    const totalRating = allReviews.reduce((acc, item) => starToNumber[item.stars] + acc, 0);
    
    product.totalReviews = allReviews.length;
    product.averageRating = allReviews.length > 0 ? Math.round((totalRating / allReviews.length) * 10) / 10 : 0;
    await product.save();

    await reviewDoc.populate('userId', 'name email');

    res.json({
      success: true,
      message: 'Review updated successfully',
      data: reviewDoc
    });
  } catch (error) {
    console.error('Update review error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

export const deleteProductReview = asyncHandler(async (req, res) => {
  try {
    const reviewDoc = await Review.findById(req.params.reviewId);

    if (!reviewDoc) {
      return res.status(404).json({ success: false, message: 'Review not found' });
    }

    // Check if user owns this review
    if (reviewDoc.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this review' });
    }

    // Soft delete by setting isActive to false
    reviewDoc.isActive = false;
    await reviewDoc.save();

    // Recalculate product average rating
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    const allReviews = await Review.find({ proId: product._id, isActive: true });
    const starToNumber = { 'one': 1, 'two': 2, 'three': 3, 'four': 4, 'five': 5 };
    const totalRating = allReviews.reduce((acc, item) => starToNumber[item.stars] + acc, 0);
    
    product.totalReviews = allReviews.length;
    product.averageRating = allReviews.length > 0 ? Math.round((totalRating / allReviews.length) * 10) / 10 : 0;
    await product.save();

    res.json({
      success: true,
      message: 'Review deleted successfully'
    });
  } catch (error) {
    console.error('Delete review error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

export const addReviewResponse = asyncHandler(async (req, res) => {
  try {
    const { content } = req.body;
    const review = await Review.findById(req.params.reviewId);

    if (!review) {
      return res.status(404).json({ success: false, message: 'Review not found' });
    }

    // Check if user is vendor for this product
    const product = await Product.findById(req.params.id);
    const isVendor = product && product.vendorId.toString() === req.user._id.toString();

    // Create response
    const response = {
      userId: req.user._id,
      content,
      isVendorResponse: isVendor
    };

    review.responses.push(response);
    await review.save();

    // Populate user info for response
    await review.populate('responses.userId', 'name email');

    res.status(201).json({
      success: true,
      message: 'Response added successfully',
      data: review.responses[review.responses.length - 1]
    });
  } catch (error) {
    console.error('Add review response error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

export const updateReviewResponse = asyncHandler(async (req, res) => {
  try {
    const { content } = req.body;
    const review = await Review.findById(req.params.reviewId);

    if (!review) {
      return res.status(404).json({ success: false, message: 'Review not found' });
    }

    const response = review.responses.id(req.params.responseId);
    if (!response) {
      return res.status(404).json({ success: false, message: 'Response not found' });
    }

    // Check if user owns this response
    if (response.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to update this response' });
    }

    response.content = content;
    await review.save();

    await review.populate('responses.userId', 'name email');

    res.json({
      success: true,
      message: 'Response updated successfully',
      data: response
    });
  } catch (error) {
    console.error('Update review response error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

export const deleteReviewResponse = asyncHandler(async (req, res) => {
  try {
    const review = await Review.findById(req.params.reviewId);

    if (!review) {
      return res.status(404).json({ success: false, message: 'Review not found' });
    }

    const response = review.responses.id(req.params.responseId);
    if (!response) {
      return res.status(404).json({ success: false, message: 'Response not found' });
    }

    // Check if user owns this response
    if (response.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this response' });
    }

    response.remove();
    await review.save();

    res.json({
      success: true,
      message: 'Response deleted successfully'
    });
  } catch (error) {
    console.error('Delete review response error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

export const addVendorReviewResponse = asyncHandler(async (req, res) => {
  try {
    const { content } = req.body;
    const vendorId = req.vendor._id;
    
    const review = await Review.findById(req.params.reviewId);

    if (!review) {
      return res.status(404).json({ success: false, message: 'Review not found' });
    }

    // Check if this review is for a product owned by this vendor
    const product = await Product.findById(review.proId);
    if (!product || product.vendorId.toString() !== vendorId.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to respond to this review' });
    }

    // Check if vendor already responded
    const existingResponse = review.responses.find(response => 
      response.userId.toString() === vendorId.toString() && response.isVendorResponse
    );

    if (existingResponse) {
      return res.status(400).json({ success: false, message: 'You have already responded to this review' });
    }

    // Add vendor response
    review.responses.push({
      userId: vendorId,
      content,
      isVendorResponse: true,
      createdAt: new Date()
    });

    await review.save();

    // Populate vendor info for response
    await review.populate('responses.userId', 'name email');

    res.status(201).json({
      success: true,
      message: 'Response added successfully',
      data: review.responses[review.responses.length - 1]
    });
  } catch (error) {
    console.error('Add vendor review response error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

export const updateVendorReviewResponse = asyncHandler(async (req, res) => {
  try {
    const { content } = req.body;
    const vendorId = req.vendor._id;
    
    const review = await Review.findById(req.params.reviewId);

    if (!review) {
      return res.status(404).json({ success: false, message: 'Review not found' });
    }

    const response = review.responses.id(req.params.responseId);
    if (!response) {
      return res.status(404).json({ success: false, message: 'Response not found' });
    }

    // Check if vendor owns this response
    if (response.userId.toString() !== vendorId.toString() || !response.isVendorResponse) {
      return res.status(403).json({ success: false, message: 'Not authorized to update this response' });
    }

    response.content = content;
    await review.save();

    await review.populate('responses.userId', 'name email');

    res.json({
      success: true,
      message: 'Response updated successfully',
      data: response
    });
  } catch (error) {
    console.error('Update vendor review response error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

export const deleteVendorReviewResponse = asyncHandler(async (req, res) => {
  try {
    const vendorId = req.vendor._id;
    
    const review = await Review.findById(req.params.reviewId);

    if (!review) {
      return res.status(404).json({ success: false, message: 'Review not found' });
    }

    const response = review.responses.id(req.params.responseId);
    if (!response) {
      return res.status(404).json({ success: false, message: 'Response not found' });
    }

    // Check if vendor owns this response
    if (response.userId.toString() !== vendorId.toString() || !response.isVendorResponse) {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this response' });
    }

    response.remove();
    await review.save();

    res.json({
      success: true,
      message: 'Response deleted successfully'
    });
  } catch (error) {
    console.error('Delete vendor review response error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});
