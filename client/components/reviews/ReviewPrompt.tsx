import React from 'react';
import { Star } from 'lucide-react';

interface ReviewPromptProps {
  onWriteReview: () => void;
  isAuthenticated: boolean;
  onLogin: () => void;
  hasUserReviewed: boolean;
  currentUser?: {
    name?: string;
    firstName?: string;
    lastName?: string;
  };
}

const ReviewPrompt: React.FC<ReviewPromptProps> = ({
  onWriteReview,
  isAuthenticated,
  onLogin,
  hasUserReviewed,
  currentUser
}) => {
  const getUserInitial = () => {
    if (currentUser) {
      // Handle both name field and firstName/lastName fields
      if (currentUser.name) {
        return currentUser.name.charAt(0).toUpperCase();
      }
      if (currentUser.firstName || currentUser.lastName) {
        return `${currentUser.firstName?.charAt(0) || ''}${currentUser.lastName?.charAt(0) || ''}`.toUpperCase();
      }
    }
    return 'S'; // Default initial
  };

  if (hasUserReviewed) {
    return (
      <div className="p-6 hover:shadow-md transition-shadow">
        <div className="flex items-center space-x-4">
          {/* User Avatar */}
          <div className="flex-shrink-0">
            <div className="w-10 h-10 bg-[#5E3A1C] rounded-full flex items-center justify-center">
              <span className="text-white font-medium text-sm">
                {getUserInitial()}
              </span>
            </div>
          </div>

          {/* Already Reviewed Message */}
          <div className="flex-1">
            <div className="text-[#8C6A52] text-sm">
              You have already reviewed this product. Click to edit your review.
            </div>
            <button
              onClick={onWriteReview}
              className="text-[#5E3A1C] hover:text-[#8C6A52] text-sm font-medium mt-1 transition-colors"
            >
              Edit Review →
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6  transition-shadow">
      <div className="flex items-center space-x-4">
        {/* User Avatar */}
        <div className="flex-shrink-0">
          <div className="w-10 h-10 bg-[#5E3A1C] rounded-full flex items-center justify-center">
            <span className="text-white font-medium text-sm">
              {getUserInitial()}
            </span>
          </div>
        </div>

        {/* Rating Prompt */}
        <div className="flex-1">
          {isAuthenticated ? (
            <button
              onClick={onWriteReview}
              className="flex items-center space-x-2 text-[#8C6A52] hover:text-[#5E3A1C] transition-colors"
            >
              <div className="flex items-center space-x-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className="h-5 w-5 text-gray-300 hover:text-[#fbbf24] transition-colors"
                  />
                ))}
              </div>
              <span className="text-sm font-medium">Rate this product</span>
            </button>
          ) : (
            <button
              onClick={onLogin}
              className="flex items-center space-x-2 text-[#8C6A52] hover:text-[#5E3A1C] transition-colors"
            >
              <div className="flex items-center space-x-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className="h-5 w-5 text-gray-300"
                  />
                ))}
              </div>
              <span className="text-sm font-medium">Login to rate this product</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReviewPrompt; 