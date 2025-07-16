import React from 'react';
import { Star, Users, TrendingUp, Award } from 'lucide-react';

interface ReviewSummaryProps {
  totalReviews: number;
  averageRating: number;
  ratingDistribution: Array<{
    _id: string;
    count: number;
  }>;
}

const ReviewSummary: React.FC<ReviewSummaryProps> = ({
  totalReviews,
  averageRating,
  ratingDistribution
}) => {
  const starToNumber = { 'one': 1, 'two': 2, 'three': 3, 'four': 4, 'five': 5 };
  const numberToStar = { 1: 'one', 2: 'two', 3: 'three', 4: 'four', 5: 'five' };

  // Create rating distribution map
  const ratingMap = ratingDistribution.reduce((acc, item) => {
    acc[item._id] = item.count;
    return acc;
  }, {} as Record<string, number>);

  // Calculate percentage for each rating
  const getRatingPercentage = (rating: number) => {
    const starKey = numberToStar[rating as keyof typeof numberToStar];
    const count = ratingMap[starKey] || 0;
    return totalReviews > 0 ? (count / totalReviews) * 100 : 0;
  };

  const getRatingText = (rating: number) => {
    switch (rating) {
      case 1: return 'Poor';
      case 2: return 'Fair';
      case 3: return 'Good';
      case 4: return 'Very Good';
      case 5: return 'Excellent';
      default: return 'No Rating';
    }
  };

  const getRatingColor = (rating: number) => {
    if (rating >= 4) return 'text-green-600';
    if (rating >= 3) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
          <Star className="h-5 w-5 text-yellow-400 mr-2" />
          Customer Reviews
        </h3>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left: Overall Rating */}
          <div className="text-center lg:text-left">
            <div className="flex flex-col lg:flex-row items-center lg:items-start space-y-4 lg:space-y-0 lg:space-x-6">
              {/* Rating Display */}
              <div className="text-center">
                <div className="text-4xl font-bold text-gray-900 mb-2">
                  {averageRating.toFixed(1)}
                </div>
                <div className="flex justify-center lg:justify-start mb-3">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`h-6 w-6 ${
                        star <= Math.round(averageRating)
                          ? 'text-yellow-400 fill-yellow-400'
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
                <div className={`text-lg font-semibold mb-1 ${getRatingColor(Math.round(averageRating))}`}>
                  {getRatingText(Math.round(averageRating))}
                </div>
                <div className="text-sm text-gray-600 mb-4">
                  Based on {totalReviews} reviews
                </div>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <div className="text-xl font-bold text-gray-900">{totalReviews}</div>
                  <div className="text-xs text-gray-600">Total Reviews</div>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <div className="text-xl font-bold text-gray-900">
                    {ratingMap['five'] || 0}
                  </div>
                  <div className="text-xs text-gray-600">5-Star Reviews</div>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Rating Distribution */}
          <div>
            <h4 className="text-sm font-medium text-gray-900 mb-4">Rating Breakdown</h4>
            <div className="space-y-3">
              {[5, 4, 3, 2, 1].map((rating) => {
                const percentage = getRatingPercentage(rating);
                const count = ratingMap[numberToStar[rating as keyof typeof numberToStar]] || 0;
                
                return (
                  <div key={rating} className="flex items-center space-x-3">
                    <div className="flex items-center space-x-1 w-8">
                      <span className="text-sm text-gray-600">{rating}</span>
                      <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                    </div>
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-yellow-400 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <div className="flex items-center space-x-2 w-16">
                      <span className="text-sm font-medium text-gray-900">
                        {count}
                      </span>
                      <span className="text-xs text-gray-500">
                        ({percentage.toFixed(0)}%)
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Review Highlights */}
        {totalReviews > 0 && (
          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
                <TrendingUp className="h-5 w-5 text-green-600" />
                <div>
                  <div className="text-sm font-medium text-green-900">
                    {((ratingMap['five'] || 0) + (ratingMap['four'] || 0))} Positive Reviews
                  </div>
                  <div className="text-xs text-green-600">
                    {totalReviews > 0 ? (((ratingMap['five'] || 0) + (ratingMap['four'] || 0)) / totalReviews * 100).toFixed(0) : 0}% of customers
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
                <Users className="h-5 w-5 text-blue-600" />
                <div>
                  <div className="text-sm font-medium text-blue-900">
                    {ratingMap['five'] || 0} 5-Star Reviews
                  </div>
                  <div className="text-xs text-blue-600">
                    {totalReviews > 0 ? ((ratingMap['five'] || 0) / totalReviews * 100).toFixed(0) : 0}% of customers
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-3 p-3 bg-yellow-50 rounded-lg">
                <Award className="h-5 w-5 text-yellow-600" />
                <div>
                  <div className="text-sm font-medium text-yellow-900">
                    {averageRating.toFixed(1)} Average Rating
                  </div>
                  <div className="text-xs text-yellow-600">
                    {getRatingText(Math.round(averageRating))} overall
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReviewSummary; 