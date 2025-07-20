import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { createResponse } from '@/services/reviewService';

interface ResponseFormProps {
  reviewId: string;
  onResponseSubmitted?: () => void;
  onCancel?: () => void;
}

const ResponseForm: React.FC<ResponseFormProps> = ({ 
  reviewId, 
  onResponseSubmitted, 
  onCancel 
}) => {
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!comment.trim()) {
      alert('Please enter a response');
      return;
    }

    try {
      setSubmitting(true);
      const response = await createResponse({
        reviewId,
        comment: comment.trim()
      });

      if (response.success) {
        setComment('');
        onResponseSubmitted?.();
      } else {
        alert(response.message || 'Failed to submit response');
      }
    } catch (error) {
      console.error('Error submitting response:', error);
      alert('Failed to submit response. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-gray-50 rounded-lg p-4">
      <h4 className="text-md font-semibold mb-3">Respond to Review</h4>
      
      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label htmlFor="response-comment" className="block text-sm font-medium text-gray-700 mb-1">
            Your Response
          </label>
          <textarea
            id="response-comment"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Thank the customer or address their concerns..."
            maxLength={500}
            required
          />
          <div className="text-right text-sm text-gray-500 mt-1">
            {comment.length}/500
          </div>
        </div>

        <div className="flex justify-end space-x-2">
          {onCancel && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onCancel}
              disabled={submitting}
            >
              Cancel
            </Button>
          )}
          <Button
            type="submit"
            size="sm"
            disabled={submitting || !comment.trim()}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            {submitting ? 'Submitting...' : 'Submit Response'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default ResponseForm; 