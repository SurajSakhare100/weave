import React, { useState, useEffect, useCallback } from 'react';
import { Star, Trash2, Calendar, Reply } from 'lucide-react';
import { getReviews, removeReview, Review, removeReviewResponse } from '@/services/reviewService';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { toast } from 'sonner';
import ResponseForm from './ResponseForm';
import ResponseList from './ResponseList';

interface ReviewListProps {
  productId: string;
  onReviewUpdate: () => void;
}

const ReviewList: React.FC<ReviewListProps> = ({ productId, onReviewUpdate }) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [showResponseForm, setShowResponseForm] = useState<string | null>(null);
  const [editingResponse, setEditingResponse] = useState<{ reviewId: string; responseId: string; content: string } | null>(null);
  const { isAuthenticated } = useSelector((state: RootState) => state.user);

  const starToNumber = { 'one': 1, 'two': 2, 'three': 3, 'four': 4, 'five': 5 };

  const fetchReviews = useCallback(async (pageNum: number = 1) => {
    try {
      const response = await getReviews(productId, pageNum);
      if (response.success) {
        if (pageNum === 1) {
          setReviews(response.data.reviews);
        } else {
          setReviews(prev => [...prev, ...response.data.reviews]);
        }
        setHasMore(pageNum < response.data.pagination.pages);
      }
    } catch (error) {
      console.error('Failed to fetch reviews:', error);
      toast.error('Failed to load reviews');
    } finally {
      setLoading(false);
    }
  }, [productId]);

  useEffect(() => {
    fetchReviews();
  }, [productId, fetchReviews]);

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchReviews(nextPage);
  };

  const handleDeleteReview = async (reviewId: string) => {
    if (!confirm('Are you sure you want to delete this review?')) return;

    try {
      await removeReview(productId, reviewId);
      setReviews(prev => prev.filter(review => review._id !== reviewId));
      toast.success('Review deleted successfully');
      onReviewUpdate();
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err?.response?.data?.message || 'Failed to delete review');
    }
  };

  const handleDeleteResponse = async (reviewId: string, responseId: string) => {
    if (!confirm('Are you sure you want to delete this response?')) return;

    try {
      await removeReviewResponse(productId, reviewId, responseId);
      setReviews(prev => prev.map(review => {
        if (review._id === reviewId) {
          return {
            ...review,
            responses: review.responses.filter(response => response._id !== responseId)
          };
        }
        return review;
      }));
      toast.success('Response deleted successfully');
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err?.response?.data?.message || 'Failed to delete response');
    }
  };

  const handleEditResponse = (reviewId: string, responseId: string, content: string) => {
    setEditingResponse({ reviewId, responseId, content });
    setShowResponseForm(reviewId);
  };

  const handleResponseSubmitted = () => {
    setShowResponseForm(null);
    setEditingResponse(null);
    fetchReviews(1); // Refresh reviews to get updated responses
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading && reviews.length === 0) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500"></div>
      </div>
    );
  }

  if (reviews.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <Star className="h-12 w-12 mx-auto mb-4 text-gray-300" />
        <p>No reviews yet. Be the first to review this product!</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {reviews.map((review) => {
        // Handle cases where userId might be null or undefined
        const userName = review.userId?.name || 'Anonymous User';
        const userInitial = userName.charAt(0).toUpperCase();
        
        return (
          <div key={review._id} className="border-b border-gray-200 pb-6 last:border-b-0">
            <div className="flex justify-between items-start mb-3">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-pink-100 rounded-full flex items-center justify-center">
                  <span className="text-pink-600 font-semibold">
                    {userInitial}
                  </span>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">{userName}</h4>
                  <div className="flex items-center space-x-2 text-sm text-gray-500">
                    <Calendar className="h-4 w-4" />
                    <span>{formatDate(review.createdAt)}</span>
                  </div>
                </div>
              </div>
              
              {/* Star Rating */}
              <div className="flex items-center space-x-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`h-4 w-4 ${
                      star <= starToNumber[review.stars]
                        ? 'text-yellow-400 fill-yellow-400'
                        : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Review Title */}
            <h5 className="font-semibold text-gray-900 mb-2">{review.title}</h5>

            {/* Review Content */}
            <p className="text-gray-700 leading-relaxed">{review.review}</p>

            {/* Responses */}
            <ResponseList
              responses={review.responses}
              onEditResponse={(responseId, content) => handleEditResponse(review._id, responseId, content)}
              onDeleteResponse={(responseId) => handleDeleteResponse(review._id, responseId)}
            />

            {/* Action Buttons */}
            <div className="flex items-center justify-between mt-4">
              <div className="flex space-x-4">
                {isAuthenticated && (
                  <button
                    onClick={() => setShowResponseForm(review._id)}
                    className="text-blue-500 hover:text-blue-700 text-sm flex items-center space-x-1"
                  >
                    <Reply className="h-4 w-4" />
                    <span>Reply</span>
                  </button>
                )}
              </div>

              {isAuthenticated && (
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleDeleteReview(review._id)}
                    className="text-red-500 hover:text-red-700 text-sm flex items-center space-x-1"
                  >
                    <Trash2 className="h-4 w-4" />
                    <span>Delete</span>
                  </button>
                </div>
              )}
            </div>

            {/* Response Form */}
            {showResponseForm === review._id && (
              <ResponseForm
                reviewId={review._id}
                productId={productId}
                onResponseSubmitted={handleResponseSubmitted}
                onCancel={() => setShowResponseForm(null)}
                editingResponse={editingResponse}
              />
            )}
          </div>
        );
      })}

      {/* Load More Button */}
      {hasMore && (
        <div className="text-center pt-4">
          <button
            onClick={handleLoadMore}
            className="px-6 py-2 border border-pink-500 text-pink-500 rounded-md hover:bg-pink-50 transition-colors"
          >
            Load More Reviews
          </button>
        </div>
      )}
    </div>
  );
};

export default ReviewList; 