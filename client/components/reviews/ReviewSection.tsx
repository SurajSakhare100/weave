import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { toast } from 'sonner';
import ReviewSummary from './ReviewSummary';
import ReviewList from './ReviewList';
import ReviewPrompt from './ReviewPrompt';
import ReviewForm from './ReviewForm';

interface Review {
  isVerified: boolean;
  _id: string;
  userId: {
    email: string;
    _id: string;
    firstName: string;
    lastName: string;
  };
  stars: 'one' | 'two' | 'three' | 'four' | 'five';
  title: string;
  review: string;
  createdAt: string;
  productId: string;
  responses?: Array<{
    _id: string;
    userId?: {
      _id: string;
      firstName: string;
      lastName: string;
    };
    content: string;
    isVendorResponse: boolean;
    createdAt: string;
  }>;
}

interface ReviewSectionProps {
  reviews: Review[];
  averageRating: number;
  totalReviews: number;
  ratingDistribution: {
    [key: string]: number;
  };
  isAuthenticated: boolean;
  vendorName?: string;
  onWriteReview: () => void;
  onLogin: () => void;
  onResponse?: (reviewId: string) => void;
  onEdit?: (reviewId: string, updatedReview: { title: string; review: string; stars: string }) => void;
  onDelete?: (reviewId: string) => void;
  showActions?: boolean;
}

const ReviewSection: React.FC<ReviewSectionProps> = ({
  reviews,
  averageRating,
  totalReviews,
  ratingDistribution,
  isAuthenticated,
  vendorName,
  onWriteReview,
  onLogin,
  onResponse,
  onEdit,
  onDelete,
  showActions = false
}) => {
  const { user } = useSelector((state: RootState) => state.user);
  const currentUserId = user?._id;
  const [showEditForm, setShowEditForm] = useState(false);
  const [editingReview, setEditingReview] = useState<Review | null>(null);

  // Check if current user has already reviewed this product
  const hasUserReviewed = currentUserId 
    ? reviews.some(review => review.userId._id === currentUserId)
    : false;

  // Get user's existing review
  const userReview = currentUserId 
    ? reviews.find(review => review.userId._id === currentUserId)
    : null;

  const handleWriteReview = () => {
    if (hasUserReviewed && userReview) {
      toast.info('You have already reviewed this product. You can edit your review below.');
      setEditingReview(userReview);
      setShowEditForm(true);
    } else {
      onWriteReview();
    }
  };

  const handleEditSubmit = (reviewId: string, data: { title: string; review: string; stars: string }) => {
    if (onEdit) {
      onEdit(reviewId, data);
      setShowEditForm(false);
      setEditingReview(null);
    }
  };

  const handleCancelEdit = () => {
    setShowEditForm(false);
    setEditingReview(null);
  };


  if(reviews.length === 0){
    return (
      <div className="rounded-xl p-6">
        <h2 className="text-2xl font-bold text-primary text-center">No reviews yet</h2>
        <p className="text-gray-500 text-center">Be the first to review this product</p>
      </div>
    )
  }

  return (
    <div className=" rounded-xl p-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Review Summary - Left Column */}
        <div className="lg:col-span-1">
          <ReviewSummary
            averageRating={averageRating}
            totalReviews={totalReviews}
            ratingDistribution={ratingDistribution}
          />
          <div className="mt-6">
            <ReviewPrompt
              onWriteReview={handleWriteReview}
              isAuthenticated={isAuthenticated}
              onLogin={onLogin}
              hasUserReviewed={hasUserReviewed}
              currentUser={user}
            />
          </div>
        </div>
        {/* Review List - Right Column */}
        <div className="lg:col-span-2">
          <ReviewList
            reviews={reviews}
            currentUserId={currentUserId}
            vendorName={vendorName}
            onResponse={onResponse}
            onEdit={onEdit}
            onDelete={onDelete}
            showActions={showActions}
          />
        </div>
      </div>

      {/* Edit Review Form Modal */}
      {showEditForm && editingReview && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <ReviewForm
              productId={editingReview.productId}
              title={editingReview.title}
              review={editingReview.review}
              stars={editingReview.stars}
              onReviewSubmitted={(data) => handleEditSubmit(editingReview._id, data)}
              onCancel={handleCancelEdit}
              isEditMode={true}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default ReviewSection; 