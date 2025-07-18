import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Image from 'next/image';
import { 
  Star, 
  Search, 
  MessageSquare, 
  Award,
  Calendar,
  Eye,
  Reply,
  Edit,
  Trash2,
  CheckCircle,
  AlertCircle,
  Download,
  RefreshCw
} from 'lucide-react';
import { toast } from 'sonner';
import VendorLayout from '@/components/VendorLayout';
import { getVendorReviews, getVendorReviewAnalytics, addVendorResponse } from '@/services/reviewService';
import ReviewDetailModal from '@/components/Vendor/ReviewDetailModal';
import { isVendorAuthenticated } from '@/utils/vendorAuth';
import ErrorBoundary from '@/components/ErrorBoundary';

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

interface ReviewAnalytics {
  totalReviews: number;
  averageRating: number;
  ratingDistribution: Array<{ _id: string; count: number }>;
  recentReviews: number;
  responseRate: number;
  verifiedReviews: number;
}

const VendorReviews = () => {
  const router = useRouter();
  const [reviews, setReviews] = useState<VendorReview[]>([]);
  const [analytics, setAnalytics] = useState<ReviewAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [analyticsLoading, setAnalyticsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedReview, setSelectedReview] = useState<VendorReview | null>(null);
  const [showResponseForm, setShowResponseForm] = useState<string | null>(null);
  const [responseContent, setResponseContent] = useState('');
  const [pageError, setPageError] = useState<string | null>(null);

  const starToNumber = { 'one': 1, 'two': 2, 'three': 3, 'four': 4, 'five': 5 };

  useEffect(() => {
    try {
      // Check authentication
      if (!isVendorAuthenticated()) {
        router.push('/vendor/login');
        return;
      }
      fetchReviews();
      fetchAnalytics();
    } catch (error) {
      console.error('Error in vendor reviews useEffect:', error);
      setPageError('Failed to initialize the page. Please refresh and try again.');
    }
  }, [router]);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getVendorReviews();
      if (response.success) {
        setReviews(response.data?.reviews || []);
      } else {
        console.error('Failed to fetch reviews:', response.message);
        setError(response.message || 'Failed to load reviews');
        setReviews([]);
      }
    } catch (error: unknown) {
      console.error('Failed to fetch reviews:', error);
      const err = error as { response?: { data?: { message?: string } }; message?: string };
      const errorMessage = err?.response?.data?.message || err?.message || 'Failed to load reviews. Please try again.';
      setError(errorMessage);
      setReviews([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchAnalytics = async () => {
    try {
      setAnalyticsLoading(true);
      const response = await getVendorReviewAnalytics();
      if (response.success) {
        setAnalytics(response.data);
      } else {
        console.error('Failed to fetch analytics:', response.message);
        // Set default analytics on error
        setAnalytics({
          totalReviews: 0,
          averageRating: 0,
          ratingDistribution: [],
          recentReviews: 0,
          responseRate: 0,
          verifiedReviews: 0
        });
      }
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
      // Set default analytics on error
      setAnalytics({
        totalReviews: 0,
        averageRating: 0,
        ratingDistribution: [],
        recentReviews: 0,
        responseRate: 0,
        verifiedReviews: 0
      });
    } finally {
      setAnalyticsLoading(false);
    }
  };

  const filteredReviews = reviews.filter(review => {
    // Add null checks for review data
    if (!review || !review.proId || !review.userId) {
      return false;
    }

    const matchesFilter = filter === 'all' || 
      (filter === 'unresponded' && (!review.responses || review.responses.length === 0)) ||
      (filter === 'low-rated' && starToNumber[review.stars] <= 2) ||
      (filter === 'verified' && review.isVerified);
    
    const matchesSearch = review.proId.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      review.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      review.review?.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesFilter && matchesSearch;
  });

  const handleResponseSubmit = async (reviewId: string) => {
    if (!responseContent.trim()) {
      toast.error('Please enter a response');
      return;
    }

    try {
      await addVendorResponse(reviewId, responseContent);
      toast.success('Response submitted successfully');
      setShowResponseForm(null);
      setResponseContent('');
      fetchReviews(); // Refresh reviews
    } catch (error) {
      console.error('Failed to submit response:', error);
      toast.error('Failed to submit response');
    }
  };

  const handleModalResponse = async (reviewId: string, content: string) => {
    try {
      await addVendorResponse(reviewId, content);
      toast.success('Response submitted successfully');
      setSelectedReview(null);
      fetchReviews(); // Refresh reviews
    } catch (error) {
      console.error('Failed to submit response:', error);
      toast.error('Failed to submit response');
    }
  };

  const handleModalEdit = () => {
    // Handle edit logic
    toast.info('Edit functionality coming soon');
  };

  const handleModalDelete = async () => {
    if (!confirm('Are you sure you want to delete this review?')) return;
    
    try {
      // Add delete logic here
      toast.success('Review deleted successfully');
      setSelectedReview(null);
      fetchReviews(); // Refresh reviews
    } catch {
      toast.error('Failed to delete review');
    }
  };

  const getRatingColor = (rating: number) => {
    if (rating >= 4) return 'text-green-600';
    if (rating >= 3) return 'text-yellow-600';
    return 'text-red-600';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Check vendor authentication
  if (!isVendorAuthenticated()) {
    return (
      <VendorLayout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="h-8 w-8 text-red-600" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Authentication Required</h3>
            <p className="text-gray-600 mb-4">Please log in as a vendor to access this page.</p>
            <button
              onClick={() => router.push('/vendor/login')}
              className="px-4 py-2 bg-[#5A9BD8] text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Go to Login
            </button>
          </div>
        </div>
      </VendorLayout>
    );
  }

  // Debug: Always show this message to confirm the component is rendering
  console.log('VendorReviews: Component rendering, pageError:', pageError, 'loading:', loading);

  // Handle page-level errors
  if (pageError) {
    return (
      <VendorLayout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="h-8 w-8 text-red-600" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Page Error</h3>
            <p className="text-gray-600 mb-4">{pageError}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-[#5A9BD8] text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Refresh Page
            </button>
          </div>
        </div>
      </VendorLayout>
    );
  }

  return (
    <ErrorBoundary>
      <VendorLayout>
                <section className="py-16 bg-gray-50 min-h-screen">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-800 mb-2">Review Management</h1>
              <p className="text-gray-600">Monitor and respond to customer reviews for your products</p>
            
          </div>

          {/* Analytics Cards */}
          {analyticsLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <div className="animate-pulse">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-8 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : analytics ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Reviews</p>
                    <p className="text-2xl font-bold text-[#357ab8]">{analytics.totalReviews}</p>
                  </div>
                  <div className="p-3 bg-[#f4f8fb] rounded-full">
                    <MessageSquare className="h-6 w-6 text-[#5A9BD8]" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Average Rating</p>
                    <div className="flex items-center space-x-2">
                      <p className="text-2xl font-bold text-[#357ab8]">{analytics.averageRating.toFixed(1)}</p>
                      <div className="flex items-center">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`h-4 w-4 ${
                              star <= Math.round(analytics.averageRating)
                                ? 'text-yellow-400 fill-yellow-400'
                                : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="p-3 bg-[#f4f8fb] rounded-full">
                    <Star className="h-6 w-6 text-[#5A9BD8]" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Response Rate</p>
                    <p className="text-2xl font-bold text-[#357ab8]">{analytics.responseRate}%</p>
                  </div>
                  <div className="p-3 bg-[#f4f8fb] rounded-full">
                    <Reply className="h-6 w-6 text-[#5A9BD8]" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Verified Reviews</p>
                    <p className="text-2xl font-bold text-[#357ab8]">{analytics.verifiedReviews}</p>
                  </div>
                  <div className="p-3 bg-[#f4f8fb] rounded-full">
                    <CheckCircle className="h-6 w-6 text-[#5A9BD8]" />
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-center">
                  <div className="text-center">
                    <AlertCircle className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-500">Analytics unavailable</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Filters and Search */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
              <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search reviews..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5A9BD8] focus:border-transparent"
                  />
                </div>
                
                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5A9BD8] focus:border-transparent"
                >
                  <option value="all">All Reviews</option>
                  <option value="unresponded">Unresponded</option>
                  <option value="low-rated">Low Rated (1-2 stars)</option>
                  <option value="verified">Verified Reviews</option>
                </select>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={fetchReviews}
                  className="flex items-center space-x-2 px-4 py-2 bg-[#f4f8fb] text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  <RefreshCw className="h-4 w-4" />
                  <span>Refresh</span>
                </button>
                <button className="flex items-center space-x-2 px-4 py-2 bg-[#5A9BD8] text-white rounded-lg hover:bg-blue-700 transition-colors">
                  <Download className="h-4 w-4" />
                  <span>Export</span>
                </button>
              </div>
            </div>
          </div>

          {/* Reviews List */}
          <div className="space-y-6">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#5A9BD8]"></div>
                <span className="ml-3 text-gray-600">Loading reviews...</span>
              </div>
            ) : error ? (
              <div className="flex flex-col items-center justify-center py-12">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                  <AlertCircle className="h-8 w-8 text-red-600" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Reviews</h3>
                <p className="text-gray-600 text-center mb-4">{error}</p>
                <button
                  onClick={fetchReviews}
                  className="px-4 py-2 bg-[#5A9BD8] text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Try Again
                </button>
              </div>
            ) : filteredReviews.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <MessageSquare className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Reviews Found</h3>
                <p className="text-gray-600 text-center mb-4">
                  {searchTerm || filter !== 'all' 
                    ? 'No reviews match your current filters. Try adjusting your search or filters.'
                    : 'You don\'t have any reviews yet. Reviews will appear here once customers start reviewing your products.'
                  }
                </p>
                {(searchTerm || filter !== 'all') && (
                  <button
                    onClick={() => {
                      setSearchTerm('');
                      setFilter('all');
                    }}
                    className="px-4 py-2 bg-[#5A9BD8] text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Clear Filters
                  </button>
                )}
              </div>
            ) : (
              filteredReviews.map((review) => {
                // Add null checks for review data
                if (!review || !review.userId || !review.proId) {
                  return null;
                }

                return (
                  <div key={review._id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="p-6">
                      {/* Review Header */}
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-start space-x-4">
                          <div className="w-12 h-12 bg-[#f4f8fb] rounded-full flex items-center justify-center">
                            <span className="text-[#5A9BD8] font-semibold">
                              {review.userId.name?.charAt(0)?.toUpperCase() || 'U'}
                            </span>
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-1">
                              <h3 className="font-semibold text-gray-900">{review.userId.name || 'Anonymous User'}</h3>
                              {review.isVerified && (
                                <div className="flex items-center space-x-1 text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full">
                                  <CheckCircle className="h-3 w-3" />
                                  <span>Verified</span>
                                </div>
                              )}
                            </div>
                            <div className="flex items-center space-x-2 text-sm text-gray-500">
                              <Calendar className="h-4 w-4" />
                              <span>{formatDate(review.createdAt)}</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <div className="flex items-center space-x-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star
                                key={star}
                                className={`h-5 w-5 ${
                                  star <= starToNumber[review.stars]
                                    ? 'text-yellow-400 fill-yellow-400'
                                    : 'text-gray-300'
                                }`}
                              />
                            ))}
                          </div>
                          <span className={`text-sm font-medium ${getRatingColor(starToNumber[review.stars])}`}>
                            {starToNumber[review.stars]}/5
                          </span>
                        </div>
                      </div>

                      {/* Product Info */}
                      <div className="bg-gray-50 rounded-lg p-4 mb-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-12 h-12 bg-gray-200 rounded-lg overflow-hidden">
                            {review.proId.images && review.proId.images[0] && (
                              <Image
                                src={review.proId.images[0].url}
                                alt={review.proId.name || 'Product'}
                                width={48}
                                height={48}
                                className="w-full h-full object-cover"
                              />
                            )}
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-900">{review.proId.name || 'Product'}</h4>
                            <p className="text-sm text-gray-600">Product Review</p>
                          </div>
                        </div>
                      </div>

                      {/* Review Content */}
                      <div className="mb-4">
                        <h4 className="font-semibold text-gray-900 mb-2">{review.title || 'No Title'}</h4>
                        <p className="text-gray-700 leading-relaxed">{review.review || 'No review content'}</p>
                      </div>

                      {/* Responses */}
                      {review.responses && review.responses.length > 0 && (
                        <div className="bg-blue-50 rounded-lg p-4 mb-4">
                          <h5 className="font-medium text-gray-900 mb-3 flex items-center space-x-2">
                            <MessageSquare className="h-4 w-4" />
                            <span>Responses ({review.responses.length})</span>
                          </h5>
                          <div className="space-y-3">
                            {review.responses.map((response) => {
                              if (!response || !response.userId) return null;
                              
                              return (
                                <div key={response._id} className="bg-white rounded-lg p-3 border border-blue-100">
                                  <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                      <div className="flex items-center space-x-2 mb-1">
                                        <span className="text-sm font-medium text-gray-900">
                                          {response.userId.name || 'Anonymous'}
                                        </span>
                                        {response.isVendorResponse && (
                                          <div className="flex items-center space-x-1 text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
                                            <Award className="h-3 w-3" />
                                            <span>Vendor</span>
                                          </div>
                                        )}
                                        <span className="text-xs text-gray-500">
                                          {formatDate(response.createdAt)}
                                        </span>
                                      </div>
                                      <p className="text-sm text-gray-700">{response.content}</p>
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {/* Action Buttons */}
                      <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                        <div className="flex items-center space-x-4">
                          <button
                            onClick={() => setSelectedReview(review)}
                            className="flex items-center space-x-2 text-blue-500 hover:text-blue-700 text-sm"
                          >
                            <Eye className="h-4 w-4" />
                            <span>View Details</span>
                          </button>
                          {(!review.responses || review.responses.length === 0) && (
                            <button
                              onClick={() => setShowResponseForm(review._id)}
                              className="flex items-center space-x-2 text-green-500 hover:text-green-700 text-sm"
                            >
                              <Reply className="h-4 w-4" />
                              <span>Respond</span>
                            </button>
                          )}
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <button className="text-gray-500 hover:text-gray-700 text-sm">
                            <Edit className="h-4 w-4" />
                          </button>
                          <button className="text-red-500 hover:text-red-700 text-sm">
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Response Form */}
                    {showResponseForm === review._id && (
                      <div className="border-t border-gray-200 p-6 bg-gray-50">
                        <h5 className="font-medium text-gray-900 mb-3">Add Response</h5>
                        <textarea
                          value={responseContent}
                          onChange={(e) => setResponseContent(e.target.value)}
                          placeholder="Write your response to this review..."
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent resize-none"
                          rows={3}
                          maxLength={500}
                        />
                        <div className="flex items-center justify-between mt-3">
                          <span className="text-xs text-gray-500">
                            {responseContent.length}/500 characters
                          </span>
                          <div className="flex space-x-2">
                            <button
                              onClick={() => {
                                setShowResponseForm(null);
                                setResponseContent('');
                              }}
                              className="px-4 py-2 text-gray-600 hover:text-gray-800 text-sm"
                            >
                              Cancel
                            </button>
                            <button
                              onClick={() => handleResponseSubmit(review._id)}
                              className="px-4 py-2 bg-[#5A9BD8] text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                            >
                              Submit Response
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
        {selectedReview && (
          <ReviewDetailModal
            review={selectedReview} 
            onClose={() => setSelectedReview(null)}
            onResponse={handleModalResponse}
            onEdit={handleModalEdit}
            onDelete={handleModalDelete}
          />
        )}
        </section>
      </VendorLayout>
    </ErrorBoundary>
  );
};

export default VendorReviews; 