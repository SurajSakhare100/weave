import React, { useState } from 'react';
import { CheckCircle } from 'lucide-react';
import BaseModal from '../../ui/BaseModal';

interface ApprovalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApprove: (feedback?: string) => void;
  vendorName: string;
  isLoading?: boolean;
}

const ApprovalModal: React.FC<ApprovalModalProps> = ({
  isOpen,
  onClose,
  onApprove,
  vendorName,
  isLoading = false
}) => {
  const [feedback, setFeedback] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onApprove(feedback.trim() || undefined);
    setFeedback('');
  };

  const handleClose = () => {
    setFeedback('');
    onClose();
  };

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={handleClose}
      title="Approve Vendor"
      size="md"
    >
      <div className="space-y-4">
        <div className="flex items-center p-4 bg-green-50 border border-green-200 rounded-lg">
          <CheckCircle className="h-5 w-5 text-green-600 mr-3" />
          <div>
            <h3 className="text-sm font-medium text-green-800">
              Approve Vendor Application
            </h3>
            <p className="text-sm text-green-700 mt-1">
              This action will approve the vendor application for <strong>{vendorName}</strong>.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="feedback" className="block text-sm font-medium text-gray-700 mb-2">
              Approval Feedback (Optional)
            </label>
            <textarea
              id="feedback"
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="Add a welcome message or any feedback for the vendor..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500 resize-none"
              rows={3}
              disabled={isLoading}
            />
            <p className="text-xs text-gray-500 mt-1">
              This feedback will be shown to the vendor on their profile page.
            </p>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={handleClose}
              disabled={isLoading}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Approving...' : 'Approve Vendor'}
            </button>
          </div>
        </form>
      </div>
    </BaseModal>
  );
};

export default ApprovalModal; 