import React, { useState } from 'react';
import { Star, ThumbsUp, ThumbsDown, MessageCircle } from 'lucide-react';

interface Review {
  _id: string;
  userId: {
    name: string;
    email: string;
  };
  stars: 'one' | 'two' | 'three' | 'four' | 'five';
  title: string;
  review: string;
  createdAt: string;
  isVerified: boolean;
  responses?: Array<{
    _id: string;
    userId: {
      name: string;
    };
    content: string;
    isVendorResponse: boolean;
    createdAt: string;
  }>;
}

interface ReviewListProps {
  reviews: Review[];
  onResponse?: (reviewId: string) => void;
  onEdit?: (reviewId: string) => void;
  onDelete?: (reviewId: string) => void;
  showActions?: boolean;
}

const ReviewList: React.FC<ReviewListProps> = ({
  reviews,
  onResponse,
  onEdit,
  onDelete,
  showActions = false
}) => {
  const [expandedReviews, setExpandedReviews] = useState<Set<string>>(new Set());

  const toggleReview = (reviewId: string) => {
    const newExpanded = new Set(expandedReviews);
    if (newExpanded.has(reviewId)) {
      newExpanded.delete(reviewId);
    } else {
      newExpanded.add(reviewId);
    }
    setExpandedReviews(newExpanded);
  };

  const getStarRating = (stars: string) => {
    const starMap: { [key: string]: number } = {
      'one': 1,
      'two': 2,
      'three': 3,
      'four': 4,
      'five': 5
    };
    return starMap[stars] || 0;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="space-y-6">
      {reviews.map((review) => (
        <div key={review._id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-2">
                <h3 className="font-semibold text-gray-900">{review.title}</h3>
                {review.isVerified && (
                  <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                    Verified
                  </span>
                )}
              </div>
              
              <div className="flex items-center space-x-4 mb-3">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-4 w-4 ${
                        i < getStarRating(review.stars)
                          ? 'text-yellow-400 fill-yellow-400'
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-sm text-gray-600">
                  by {review.userId.name}
                </span>
                <span className="text-sm text-gray-500">
                  {formatDate(review.createdAt)}
                </span>
              </div>

              <p className="text-gray-700 mb-4">
                {expandedReviews.has(review._id) 
                  ? review.review 
                  : review.review.length > 200 
                    ? `${review.review.substring(0, 200)}...` 
                    : review.review
                }
              </p>

              {review.review.length > 200 && (
                <button
                  onClick={() => toggleReview(review._id)}
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                  {expandedReviews.has(review._id) ? 'Show less' : 'Read more'}
                </button>
              )}

              {/* Responses */}
              {review.responses && review.responses.length > 0 && (
                <div className="mt-4 space-y-3">
                  {review.responses.map((response) => (
                    <div
                      key={response._id}
                      className={`pl-4 border-l-2 ${
                        response.isVendorResponse 
                          ? 'border-blue-500 bg-blue-50' 
                          : 'border-gray-300 bg-gray-50'
                      } p-3 rounded`}
                    >
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="font-medium text-sm">
                          {response.userId.name}
                        </span>
                        {response.isVendorResponse && (
                          <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                            Vendor
                          </span>
                        )}
                        <span className="text-xs text-gray-500">
                          {formatDate(response.createdAt)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700">{response.content}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {showActions && (
              <div className="flex items-center space-x-2 ml-4">
                {onResponse && (
                  <button
                    onClick={() => onResponse(review._id)}
                    className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                    title="Respond to review"
                  >
                    <MessageCircle className="h-4 w-4" />
                  </button>
                )}
                {onEdit && (
                  <button
                    onClick={() => onEdit(review._id)}
                    className="p-2 text-gray-400 hover:text-green-600 transition-colors"
                    title="Edit review"
                  >
                    <ThumbsUp className="h-4 w-4" />
                  </button>
                )}
                {onDelete && (
                  <button
                    onClick={() => onDelete(review._id)}
                    className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                    title="Delete review"
                  >
                    <ThumbsDown className="h-4 w-4" />
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default ReviewList; 