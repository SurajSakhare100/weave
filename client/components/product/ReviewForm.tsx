import React, { useState } from 'react';
import { Star, X, Send } from 'lucide-react';
import { addReview, ReviewData } from '@/services/reviewService';
import { toast } from 'sonner';

interface ReviewFormProps {
  productId: string;
  onReviewSubmitted: () => void;
  onCancel: () => void;
}

const ReviewForm: React.FC<ReviewFormProps> = ({ productId, onReviewSubmitted, onCancel }) => {
  const [formData, setFormData] = useState<ReviewData>({
    stars: 'five',
    title: '',
    review: ''
  });
  const [loading, setLoading] = useState(false);
  const [hoveredStar, setHoveredStar] = useState<number>(0);

  const starToNumber = { 'one': 1, 'two': 2, 'three': 3, 'four': 4, 'five': 5 };
  const numberToStar = { 1: 'one', 2: 'two', 3: 'three', 4: 'four', 5: 'five' };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim() || !formData.review.trim()) {
      toast.error('Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      await addReview(productId, formData);
      toast.success('Review submitted successfully!');
      onReviewSubmitted();
    } catch (error: unknown) {
      toast.error((error as Error).message || 'Failed to submit review');
    } finally {
      setLoading(false);
    }
  };

  const handleStarClick = (star: number) => {
    const starKey = numberToStar[star as keyof typeof numberToStar];
    setFormData(prev => ({ ...prev, stars: starKey as 'one' | 'two' | 'three' | 'four' | 'five' }));
  };

  const getRatingText = (rating: number) => {
    switch (rating) {
      case 1: return 'Poor';
      case 2: return 'Fair';
      case 3: return 'Good';
      case 4: return 'Very Good';
      case 5: return 'Excellent';
      default: return 'Select Rating';
    }
  };

  const currentRating = starToNumber[formData.stars];
  const displayRating = hoveredStar || currentRating;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-semibold text-gray-900">Write a Review</h3>
          <button
            onClick={onCancel}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Star Rating Section */}
          <div className="text-center">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              How would you rate this product? *
            </label>
            <div className="flex justify-center space-x-1 mb-3">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => handleStarClick(star)}
                  onMouseEnter={() => setHoveredStar(star)}
                  onMouseLeave={() => setHoveredStar(0)}
                  className="focus:outline-none transform hover:scale-110 transition-transform"
                >
                  <Star
                    className={`h-8 w-8 ${
                      star <= displayRating
                        ? 'text-yellow-400 fill-yellow-400'
                        : 'text-gray-300'
                    }`}
                  />
                </button>
              ))}
            </div>
            <div className="text-lg font-semibold text-gray-900 mb-1">
              {getRatingText(displayRating)}
            </div>
            <div className="text-sm text-gray-600">
              {displayRating} out of 5 stars
            </div>
          </div>

          {/* Title Section */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Review Title *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              placeholder="Summarize your experience in a few words"
              maxLength={100}
            />
            <div className="text-xs text-gray-500 mt-1 text-right">
              {formData.title.length}/100 characters
            </div>
          </div>

          {/* Review Content Section */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Detailed Review *
            </label>
            <textarea
              value={formData.review}
              onChange={(e) => setFormData(prev => ({ ...prev, review: e.target.value }))}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent resize-none"
              rows={5}
              placeholder="Share your detailed experience with this product. What did you like or dislike? How does it compare to your expectations?"
              maxLength={1000}
            />
            <div className="text-xs text-gray-500 mt-1 text-right">
              {formData.review.length}/1000 characters
            </div>
          </div>

          {/* Review Guidelines */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="text-sm font-medium text-gray-900 mb-2">Review Guidelines</h4>
            <ul className="text-xs text-gray-600 space-y-1">
              <li>• Be honest and share your genuine experience</li>
              <li>• Include specific details about product quality and features</li>
              <li>• Mention delivery experience if relevant</li>
              <li>• Avoid personal information or inappropriate content</li>
            </ul>
          </div>

          {/* Submit Buttons */}
          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !formData.title.trim() || !formData.review.trim()}
              className="flex-1 px-4 py-3 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium flex items-center justify-center space-x-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Submitting...</span>
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  <span>Submit Review</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReviewForm; 