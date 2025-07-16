import React, { useState } from 'react';
import { X, Send, Edit } from 'lucide-react';
import { addReviewResponse, updateReviewResponse, ResponseData } from '@/services/reviewService';
import { toast } from 'sonner';

interface ResponseFormProps {
  productId: string;
  reviewId: string;
  responseId?: string;
  initialContent?: string;
  onResponseSubmitted: () => void;
  onCancel: () => void;
  isEditing?: boolean;
}

const ResponseForm: React.FC<ResponseFormProps> = ({
  productId,
  reviewId,
  responseId,
  initialContent = '',
  onResponseSubmitted,
  onCancel,
  isEditing = false
}) => {
  const [content, setContent] = useState(initialContent);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!content.trim()) {
      toast.error('Please enter a response');
      return;
    }

    setLoading(true);
    try {
      const responseData: ResponseData = { content: content.trim() };
      
      if (isEditing && responseId) {
        await updateReviewResponse(productId, reviewId, responseId, responseData);
        toast.success('Response updated successfully!');
      } else {
        await addReviewResponse(productId, reviewId, responseData);
        toast.success('Response added successfully!');
      }
      
      onResponseSubmitted();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to submit response');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-50 rounded-lg p-4 mt-3">
      <div className="flex justify-between items-center mb-3">
        <h4 className="text-sm font-medium text-gray-900">
          {isEditing ? 'Edit Response' : 'Add Response'}
        </h4>
        <button
          onClick={onCancel}
          className="text-gray-500 hover:text-gray-700"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 resize-none"
          rows={3}
          placeholder="Share your thoughts on this review..."
          maxLength={500}
        />
        <div className="flex justify-between items-center">
          <div className="text-xs text-gray-500">
            {content.length}/500 characters
          </div>
          <div className="flex space-x-2">
            <button
              type="button"
              onClick={onCancel}
              className="px-3 py-1 text-sm border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !content.trim()}
              className="px-3 py-1 text-sm bg-pink-500 text-white rounded-md hover:bg-pink-600 transition-colors disabled:opacity-50 flex items-center space-x-1"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-3 w-3 border-b border-white"></div>
                  <span>Sending...</span>
                </>
              ) : (
                <>
                  {isEditing ? <Edit className="h-3 w-3" /> : <Send className="h-3 w-3" />}
                  <span>{isEditing ? 'Update' : 'Send'}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default ResponseForm; 