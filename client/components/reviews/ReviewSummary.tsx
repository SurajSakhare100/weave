import React from 'react';
import { Star } from 'lucide-react';

interface ReviewSummaryProps {
  averageRating: number;
  totalReviews: number;
  ratingDistribution: {
    [key: string]: number;
  };
}

const ReviewSummary: React.FC<ReviewSummaryProps> = ({
  averageRating,
  totalReviews,
  ratingDistribution
}) => {
  const getPercentage = (count: number) => {
    return totalReviews > 0 ? Math.round((count / totalReviews) * 100) : 0;
  };

  const renderStars = (rating: number, size: 'sm' | 'md' | 'lg' = 'md') => {
    const sizeClasses = {
      sm: 'h-3 w-3',
      md: 'h-4 w-4',
      lg: 'h-5 w-5'
    };

    return (
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`${sizeClasses[size]} ${
              star <= rating
                ? 'text-[#fbbf24] fill-[#fbbf24]'
                : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    );
  };

  // Convert backend rating distribution format to proper numeric format
  const getRatingCount = (rating: number) => {
    // Backend sends _id as strings like 'one', 'two', 'three', 'four', 'five'
    const ratingMap: { [key: number]: string } = {
      1: 'one',
      2: 'two', 
      3: 'three',
      4: 'four',
      5: 'five'
    };
    
    return ratingDistribution[ratingMap[rating]] || 0;
  };

  return (
    <div className="p-6 h-fit">
      <h3 className="text-xl font-semibold text-[#5E3A1C] mb-6">Review Summary</h3>
      
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Overall Rating Section */}
        <div className="flex flex-col items-center lg:items-start space-y-4">
          <div className="text-center lg:text-left">
            <div className="text-5xl font-bold text-[#5E3A1C] mb-2">
              {averageRating.toFixed(1)}
            </div>
            <div className="flex justify-center lg:justify-start mb-3">
              {renderStars(Math.round(averageRating), 'lg')}
            </div>
            <div className="text-sm text-[#8C6A52]">
              ({totalReviews} reviews)
            </div>
          </div>
        </div>

        {/* Rating Distribution */}
        <div className="flex-1 flex flex-col justify-center space-y-3">
          {[5, 4, 3, 2, 1].map((rating) => {
            // Fix: Always show a bar for each rating, even if count is 0
            const count = getRatingCount(rating);
            const percentage = getPercentage(count);

            return (
              <div key={rating} className="flex items-center space-x-3 w-full">
                <div className="flex items-center space-x-2 min-w-[20px]">
                  <span className="text-sm font-medium text-[#5E3A1C]">{rating}</span>
                  <Star className="h-4 w-4 text-[#fbbf24] fill-[#fbbf24]" />
                </div>
                <div className="flex-1 min-w-0 bg-[#FFF4EC] rounded-full h-2.5">
                  <div
                    className="bg-[#B59C8A] h-2.5 rounded-full transition-all duration-300"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      
    </div>
  );
};

export default ReviewSummary; 