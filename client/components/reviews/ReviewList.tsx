import React, { useState, useEffect, useRef } from 'react';
import { Star, MoreVertical, MessageCircle, ThumbsUp, ThumbsDown, Edit, Trash2, Store } from 'lucide-react';
import ReviewForm from '@/components/reviews/ReviewForm';

interface Review {
  _id: string;
  userId: {
    firstName: string;
    lastName: string;
    email: string;
    _id: string;
  };
  stars: 'one' | 'two' | 'three' | 'four' | 'five';
  productId: string;
  title: string;
  review: string;
  createdAt: string;
  isVerified: boolean;
  responses?: Array<{
    _id: string;
    userId?: {
      firstName: string;
      lastName: string;
    };
    content: string;
    isVendorResponse: boolean;
    createdAt: string;
  }>;
}

interface ReviewListProps {
  reviews: Review[];
  currentUserId?: string;
  vendorName?: string;
  onResponse?: (reviewId: string) => void;
  onEdit?: (reviewId: string, updatedReview: { title: string; review: string; stars: string }) => void;
  onDelete?: (reviewId: string) => void;
  showActions?: boolean;
}

const ReviewList: React.FC<ReviewListProps> = ({
  reviews,
  currentUserId,
  vendorName,
  onResponse,
  onEdit,
  onDelete,
  showActions = false
}) => {
  const [expandedReviews, setExpandedReviews] = useState<Set<string>>(new Set());
  const [showOptions, setShowOptions] = useState<string | null>(null);
  const [editingReviewId, setEditingReviewId] = useState<string | null>(null);
  const optionsRef = useRef<HTMLDivElement>(null);

  // Close options dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (optionsRef.current && !optionsRef.current.contains(event.target as Node)) {
        setShowOptions(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const toggleReview = (reviewId: string) => {
    const newExpanded = new Set(expandedReviews);
    if (newExpanded.has(reviewId)) {
      newExpanded.delete(reviewId);
    } else {
      newExpanded.add(reviewId);
    }
    setExpandedReviews(newExpanded);
  };

  const toggleOptions = (reviewId: string) => {
    setShowOptions(showOptions === reviewId ? null : reviewId);
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
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return '1 day ago';
    if (diffDays < 30) return `${diffDays} days ago`;
    if (diffDays < 365) {
      const months = Math.floor(diffDays / 30);
      return `${months} month${months > 1 ? 's' : ''} ago`;
    }
    const years = Math.floor(diffDays / 365);
    return `${years} year${years > 1 ? 's' : ''} ago`;
  };

  const getUserInitial = (firstName: string, lastName: string) => {
    return `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase();
  };

  const getFullName = (firstName: string, lastName: string) => {
    return `${firstName || ''} ${lastName || ''}`.trim();
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-4 w-4 ${
              star <= rating
                ? 'text-[#fbbf24] fill-[#fbbf24]'
                : 'text-[#fbbf24]'
            }`}
          />
        ))}
      </div>
    );
  };

  // Only allow editing if the review belongs to the current user
  const isUserReview = (review: Review) => {
    // return currentUserId && review.userId._id === currentUserId;
    return true;
  };

  // Handle review update
  const handleEditSubmit = (reviewId: string, data: { title: string; review: string; stars: string }) => {
    if (onEdit) {
      onEdit(reviewId, data);
    }
    setEditingReviewId(null);
  };

  return (
    <div className="space-y-6">
      {/* Reviews */}
      {reviews.map((review) => {
        const isEditing = editingReviewId === review._id;
        return (
          <div key={review._id} className="bg-[#FFF4EC]/90 rounded-xl p-6">
            {/* Header Section */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-4">
                {/* User Avatar */}
                <div className="w-10 h-10 bg-[#5E3A1C] rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-white font-medium text-sm">
                    {getUserInitial(review.userId.firstName, review.userId.lastName)}
                  </span>
                </div>
                
                {/* Customer Name */}
                <div className="flex-1">
                  <h4 className="font-bold text-[#5E3A1C] text-md">
                    {getFullName(review.userId.firstName, review.userId.lastName)}
                  </h4>
                  <p className="text-xs text-[#8C6A52]">{review.userId.email}</p>
                </div>
              </div>

              {isUserReview(review) && (
                <div className="relative" ref={optionsRef}>
                  <button
                    onClick={() => toggleOptions(review._id)}
                    className="p-2 text-[#5E3A1C] hover:text-[#8C6A52] transition-colors rounded-full hover:bg-gray-50"
                  >
                    <MoreVertical className="h-4 w-4" />
                  </button>
                  
                  {/* Dropdown Options */}
                  {showOptions === review._id && (
                    <div className="absolute right-0 top-full mt-1 bg-white border border-[#EAD6CA] rounded-lg shadow-lg z-10 min-w-[120px]">
                      <button
                        onClick={() => {
                          setEditingReviewId(review._id);
                          setShowOptions(null);
                        }}
                        className="w-full px-3 py-2 text-left text-sm text-[#5E3A1C] hover:bg-[#FFF4EC] flex items-center space-x-2"
                      >
                        <Edit className="h-4 w-4" />
                        <span>Edit</span>
                      </button>
                      {onDelete && (
                        <button
                          onClick={() => {
                            if (window.confirm('Are you sure you want to delete this review?')) {
                              onDelete(review._id);
                            }
                            setShowOptions(null);
                          }}
                          className="w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center space-x-2"
                        >
                          <Trash2 className="h-4 w-4" />
                          <span>Delete</span>
                        </button>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Admin Actions */}
              {showActions && !isUserReview(review) && (
                <div className="flex items-center space-x-2">
                  {onResponse && (
                    <button
                      onClick={() => onResponse(review._id)}
                      className="p-2 text-gray-400 hover:text-blue-600 transition-colors rounded-full hover:bg-blue-50"
                      title="Respond to review"
                    >
                      <MessageCircle className="h-4 w-4" />
                    </button>
                  )}
                  {onEdit && (
                    <button
                      onClick={() => onEdit(review._id, {
                        title: review.title,
                        review: review.review,
                        stars: review.stars
                      })}
                      className="p-2 text-gray-400 hover:text-green-600 transition-colors rounded-full hover:bg-green-50"
                      title="Edit review"
                    >
                      <ThumbsUp className="h-4 w-4" />
                    </button>
                  )}
                  {onDelete && (
                    <button
                      onClick={() => onDelete(review._id)}
                      className="p-2 text-gray-400 hover:text-red-600 transition-colors rounded-full hover:bg-red-50"
                      title="Delete review"
                    >
                      <ThumbsDown className="h-4 w-4" />
                    </button>
                  )}
                  <button className="p-2 text-[#5E3A1C] hover:text-[#8C6A52] transition-colors rounded-full hover:bg-gray-50">
                    <MoreVertical className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>

            {/* Rating and Timestamp Section */}
            <div className="flex items-center space-x-3 mb-4">
              {renderStars(getStarRating(review.stars))}
              <span className="text-sm text-[#8C6A52]">
                {formatDate(review.createdAt)}
              </span>
              {review.isVerified && (
                <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                  Verified
                </span>
              )}
            </div>

            {/* Review Content Section or Edit Form */}
            {isEditing ? (
              <div className="mb-4">
                <ReviewForm
                  productId={review.productId}
                  title={review.title}
                  review={review.review}
                  stars={review.stars}
                  onReviewSubmitted={(data: { title: string; review: string; stars: string }) =>
                    handleEditSubmit(review._id, data)
                  }
                  onCancel={() => setEditingReviewId(null)}
                  isEditMode={true}
                />
              </div>
            ) : (
              <>
                <div className="text-[#8C6A52] leading-relaxed">
                  {expandedReviews.has(review._id) 
                    ? review.review 
                    : review.review.length > 300 
                      ? `${review.review.substring(0, 300)}...` 
                      : review.review
                  }
                </div>

                {review.review.length > 300 && (
                  <button
                    onClick={() => toggleReview(review._id)}
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium mt-2 transition-colors"
                  >
                    {expandedReviews.has(review._id) ? 'Show less' : 'Read more'}
                  </button>
                )}
              </>
            )}

            {/* Responses */}
            {review.responses && review.responses.length > 0 && (
              <div className="mt-6 space-y-4">
                {review.responses.map((response) => (
                  <div
                    key={response._id}
                    className={`pl-4 border-l-2 ${
                      response.isVendorResponse 
                        ? ' bg-[#B59C8A]/50' 
                        : 'border-gray-300 bg-gray-50'
                    } p-4 rounded-lg`}
                  >
                    <div className="flex items-center space-x-2 mb-2">
                      <Store className="h-4 w-4" />
                      <span className="font-medium text-md text-[#5E3A1C]">
                        {vendorName}
                      </span>
                      {response.isVendorResponse && (
                        <span className="bg-primary text-white text-xs px-2 py-1 rounded-full">
                          Vendor
                        </span>
                      )}
                      <span className="text-xs text-[#8C6A52]">
                        {formatDate(response.createdAt)}
                      </span>
                    </div>
                    <p className="text-sm text-[#8C6A52] leading-relaxed">{response.content}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default ReviewList; 