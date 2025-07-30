import React, { useState } from 'react';
import { Star, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { addReview } from '@/services/reviewService';

interface ReviewFormProps {
  productId: string;
  onReviewSubmitted?: (data: { title: string; review: string; stars: string }) => void;
  onCancel?: () => void;
  title?: string;
  review?: string;
  stars?: string;
  isEditMode?: boolean;
}

const ReviewForm: React.FC<ReviewFormProps> = ({ productId, onReviewSubmitted, onCancel, title, review, stars, isEditMode }) => {
  const [rating, setRating] = useState(stars ? parseInt(stars) : 0);
  const [hoverRating, setHoverRating] = useState(stars ? parseInt(stars) : 0);
  const [reviewTitle, setReviewTitle] = useState(title || '');
  const [comment, setComment] = useState(review || '');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (rating === 0) {
      alert('Please select a rating');
      return;
    }

    if (!reviewTitle.trim()) {
      alert('Please enter a review title');
      return;
    }

    if (!comment.trim()) {
      alert('Please enter a review comment');
      return;
    }

    try {
      setSubmitting(true);
      const response = await addReview(productId, {
        stars: ['one', 'two', 'three', 'four', 'five'][rating - 1] as any,
        title: reviewTitle.trim(),
        review: comment.trim(),
      }); 

      if (response.success) {
        setRating(0);
        setReviewTitle('');
        setComment('');
        onReviewSubmitted?.({ title: reviewTitle, review: comment, stars: rating.toString() });
      } else {
        alert(response.message || 'Failed to submit review');
      }
    } catch (error) {
      console.error('Error submitting review:', error);
      alert('Failed to submit review. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleStarClick = (starRating: number) => {
    setRating(starRating);
  };

  const handleStarHover = (starRating: number) => {
    setHoverRating(starRating);
  };

  const handleStarLeave = () => {
    setHoverRating(0);
  };

  const getRatingText = (rating: number) => {
    const ratingTexts = {
      1: 'Poor',
      2: 'Fair',
      3: 'Good',
      4: 'Very Good',
      5: 'Excellent'
    };
    return ratingTexts[rating as keyof typeof ratingTexts] || 'Select rating';
  };

  return (
    <div className="bg-white rounded-xl shadow-lg border border-[#EAD6CA] p-6 max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold text-[#5E3A1C]">Write a Review</h3>
        {onCancel && (
          <button
            onClick={onCancel}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors rounded-full hover:bg-gray-50"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Rating Section */}
        <div>
          <label className="block text-sm font-medium text-[#5E3A1C] mb-3">
            Overall Rating *
          </label>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => handleStarClick(star)}
                  onMouseEnter={() => handleStarHover(star)}
                  onMouseLeave={handleStarLeave}
                  className="focus:outline-none transition-transform hover:scale-110"
                >
                  <Star
                    className={`h-8 w-8 ${
                      star <= (hoverRating || rating)
                        ? 'text-[#fbbf24] fill-[#fbbf24]'
                        : 'text-gray-300'
                    }`}
                  />
                </button>
              ))}
            </div>
            <div className="ml-4">
              <div className="text-lg font-medium text-[#5E3A1C]">
                {getRatingText(hoverRating || rating)}
              </div>
              {rating > 0 && (
                <div className="text-sm text-[#8C6A52]">
                  {rating} star{rating > 1 ? 's' : ''}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Title Section */}
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-[#5E3A1C] mb-2">
            Review Title *
          </label>
          <input
            type="text"
            id="title"
            value={reviewTitle}
            onChange={(e) => setReviewTitle(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
            placeholder="Summarize your experience with this product"
            maxLength={100}
            required
          />
          <div className="text-right text-sm text-[#8C6A52] mt-1">
            {reviewTitle.length}/100
          </div>
        </div>

        {/* Comment Section */}
        <div>
          <label htmlFor="comment" className="block text-sm font-medium text-[#5E3A1C] mb-2">
            Detailed Review *
          </label>
          <textarea
            id="comment"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={5}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors resize-none"
            placeholder="Share your detailed experience with this product. What did you like or dislike? How does it compare to your expectations?"
            maxLength={1000}
            required
          />
          <div className="text-right text-sm text-[#8C6A52] mt-1">
            {comment.length}/1000
          </div>
        </div>

        {/* Buttons */}
        <div className="flex justify-end space-x-3 pt-4 border-t border-[#EAD6CA]">
          {onCancel && (
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={submitting}
              className="px-6 py-2"
            >
              Cancel
            </Button>
          )}
          <Button
            type="submit"
            disabled={submitting || rating === 0 || !reviewTitle.trim() || !comment.trim()}
            className="px-6 py-2 bg-[#5E3A1C] hover:bg-[#8C6A52] text-white disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? 'Submitting...' : 'Submit Review'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default ReviewForm; 