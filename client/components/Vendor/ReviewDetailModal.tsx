import React, { useState } from 'react';
import { X, Star, Calendar, Package, MessageSquare, Reply, Edit, Trash2, CheckCircle, Award } from 'lucide-react';
import Image from 'next/image';

// Interface for populated review data from API
interface VendorReview {
  _id: string;
  userId: {
    _id: string;
    name: string;
    email: string;
  };
  proId: {
    _id: string;
    name: string;
    images: Array<{ url: string }>;
  };
  stars: 'one' | 'two' | 'three' | 'four' | 'five';
  title: string;
  review: string;
  responses: Array<{
    _id: string;
    userId: {
      _id: string;
      name: string;
      email: string;
    };
    content: string;
    isVendorResponse: boolean;
    createdAt: string;
    updatedAt: string;
  }>;
  isVerified: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface ReviewDetailModalProps {
  review: VendorReview | null;
  onClose: () => void;
  onResponse: (reviewId: string, content: string) => void;
  onEdit: () => void;
  onDelete: () => void;
}

const ReviewDetailModal: React.FC<ReviewDetailModalProps> = ({
  review,
  onClose,
  onResponse,
  onEdit,
  onDelete
}) => {
  const [responseContent, setResponseContent] = useState('');
  const [showResponseForm, setShowResponseForm] = useState(false);

  if (!review) return null;

  const starToNumber = { 'one': 1, 'two': 2, 'three': 3, 'four': 4, 'five': 5 };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getRatingColor = (rating: number) => {
    if (rating >= 4) return 'text-green-600';
    if (rating >= 3) return 'text-yellow-600';
    return 'text-red-600';
  };

  const handleResponseSubmit = () => {
    if (responseContent.trim()) {
      onResponse(review._id, responseContent);
      setResponseContent('');
      setShowResponseForm(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Review Details</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6">
          {/* Review Header */}
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-start space-x-4">
              <div className="w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center">
                <span className="text-pink-600 text-xl font-semibold">
                  {review.userId.name.charAt(0).toUpperCase()}
                </span>
              </div>
              <div>
                <div className="flex items-center space-x-2 mb-2">
                  <h3 className="text-lg font-semibold text-gray-900">{review.userId.name}</h3>
                  {review.isVerified && (
                    <div className="flex items-center space-x-1 text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full">
                      <CheckCircle className="h-3 w-3" />
                      <span>Verified Purchase</span>
                    </div>
                  )}
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-500">
                  <Calendar className="h-4 w-4" />
                  <span>{formatDate(review.createdAt)}</span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`h-6 w-6 ${
                      star <= starToNumber[review.stars]
                        ? 'text-yellow-400 fill-yellow-400'
                        : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>
              <span className={`text-lg font-semibold ${getRatingColor(starToNumber[review.stars])}`}>
                {starToNumber[review.stars]}/5
              </span>
            </div>
          </div>

          {/* Product Information */}
          <div className="bg-gray-50 rounded-xl p-6 mb-6">
            <h4 className="font-semibold text-gray-900 mb-4 flex items-center space-x-2">
              <Package className="h-5 w-5" />
              <span>Product Information</span>
            </h4>
            <div className="flex items-center space-x-4">
              <div className="w-20 h-20 bg-gray-200 rounded-lg overflow-hidden">
                {review.proId.images && review.proId.images[0] && (
                  <Image
                    src={review.proId.images[0].url}
                    alt={review.proId.name}
                    width={80}
                    height={80}
                    className="w-full h-full object-cover"
                  />
                )}
              </div>
              <div>
                <h5 className="font-medium text-gray-900 text-lg">{review.proId.name}</h5>
                <p className="text-sm text-gray-600">Product Review</p>
              </div>
            </div>
          </div>

          {/* Review Content */}
          <div className="mb-6">
            <h4 className="font-semibold text-gray-900 mb-3">Review Content</h4>
            <div className="bg-white border border-gray-200 rounded-xl p-6">
              <h5 className="font-semibold text-gray-900 mb-3 text-lg">{review.title}</h5>
              <p className="text-gray-700 leading-relaxed text-base">{review.review}</p>
            </div>
          </div>

          {/* Responses */}
          {review.responses.length > 0 && (
            <div className="mb-6">
              <h4 className="font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                <MessageSquare className="h-5 w-5" />
                <span>Responses ({review.responses.length})</span>
              </h4>
              <div className="space-y-4">
                {review.responses.map((response) => (
                  <div key={response._id} className="bg-blue-50 rounded-xl p-4 border border-blue-100">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <span className="font-medium text-gray-900">
                            {response.userId.name}
                          </span>
                          {response.isVendorResponse && (
                            <div className="flex items-center space-x-1 text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded-full">
                              <Award className="h-3 w-3" />
                              <span>Vendor Response</span>
                            </div>
                          )}
                          <span className="text-xs text-gray-500">
                            {formatDate(response.createdAt)}
                          </span>
                        </div>
                        <p className="text-gray-700">{response.content}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-6 border-t border-gray-200">
            <div className="flex items-center space-x-4">
              {review.responses.length === 0 && (
                <button
                  onClick={() => setShowResponseForm(true)}
                  className="flex items-center space-x-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                >
                  <Reply className="h-4 w-4" />
                  <span>Respond to Review</span>
                </button>
              )}
              <button
                onClick={onEdit}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                <Edit className="h-4 w-4" />
                <span>Edit</span>
              </button>
            </div>
            
            <button
              onClick={onDelete}
              className="flex items-center space-x-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
            >
              <Trash2 className="h-4 w-4" />
              <span>Delete</span>
            </button>
          </div>

          {/* Response Form */}
          {showResponseForm && (
            <div className="mt-6 p-6 bg-gray-50 rounded-xl border border-gray-200">
              <h5 className="font-semibold text-gray-900 mb-4">Add Response</h5>
              <textarea
                value={responseContent}
                onChange={(e) => setResponseContent(e.target.value)}
                placeholder="Write your response to this review..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent resize-none"
                rows={4}
                maxLength={500}
              />
              <div className="flex items-center justify-between mt-3">
                <span className="text-xs text-gray-500">
                  {responseContent.length}/500 characters
                </span>
                <div className="flex space-x-2">
                  <button
                    onClick={() => {
                      setShowResponseForm(false);
                      setResponseContent('');
                    }}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800 text-sm"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleResponseSubmit}
                    disabled={!responseContent.trim()}
                    className="px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Submit Response
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReviewDetailModal; 