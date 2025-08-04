import React, { useState } from 'react';
import { X, AlertTriangle } from 'lucide-react';
import BaseModal from '../../ui/BaseModal';

interface RejectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onReject: (reason: string) => void;
  vendorName: string;
  isLoading?: boolean;
}

const RejectionModal: React.FC<RejectionModalProps> = ({
  isOpen,
  onClose,
  onReject,
  vendorName,
  isLoading = false
}) => {
  const [rejectionReason, setRejectionReason] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (rejectionReason.trim()) {
      onReject(rejectionReason.trim());
      setRejectionReason('');
    }
  };

  const handleClose = () => {
    setRejectionReason('');
    onClose();
  };

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={handleClose}
      title="Reject Vendor"
      size="md"
    >
      <div className="space-y-4">
        <div className="flex items-center p-4 bg-red-50 border border-red-200 rounded-lg">
          <AlertTriangle className="h-5 w-5 text-red-600 mr-3" />
          <div>
            <h3 className="text-sm font-medium text-red-800">
              Reject Vendor Application
            </h3>
            <p className="text-sm text-red-700 mt-1">
              This action will reject the vendor application for <strong>{vendorName}</strong>.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="rejectionReason" className="block text-sm font-medium text-gray-700 mb-2">
              Rejection Reason <span className="text-red-500">*</span>
            </label>
            <textarea
              id="rejectionReason"
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="Please provide a detailed reason for rejecting this vendor application..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-red-500 resize-none"
              rows={4}
              required
              disabled={isLoading}
            />
            <p className="text-xs text-gray-500 mt-1">
              This reason will be communicated to the vendor and stored for record keeping.
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
              disabled={isLoading || !rejectionReason.trim()}
              className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Rejecting...' : 'Reject Vendor'}
            </button>
          </div>
        </form>
      </div>
    </BaseModal>
  );
};

export default RejectionModal; 