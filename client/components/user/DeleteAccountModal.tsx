import React from 'react';
import { X } from 'lucide-react';

interface DeleteAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  loading?: boolean;
}

const DeleteAccountModal: React.FC<DeleteAccountModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  loading = false,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 h-full flex items-center justify-center text-primary p-4">
      {/* Dim layer */}
      <div className="fixed inset-0 bg-[#F0F0F0] opacity-20 z-10" />

      {/* Gradient container to match Address modal */}
      <div className="relative bg-gradient-to-b from-[#5E3A1C] to-[#FCFCFC] rounded-xl w-full max-w-md mx-auto h-full md:h-auto flex flex-col items-center justify-center gap-2 z-50 p-6 border border-border-border-tertiary">
        {/* Close */}
        <button
          onClick={onClose}
          className="self-end text-white hover:text-gray-200 transition-colors"
          disabled={loading}
          aria-label="Close"
        >
          <X className="h-6 w-6" />
        </button>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-xl w-full">
          <div className="px-8 pt-8 text-center">
            <h2 className="text-3xl font-semibold text-[#6c4323]">Delete Weave account</h2>
            <p className="mt-4 text-lg text-[#8b7355]">
              Once deleted, you’ll lose access to the account and saved details.
            </p>
          </div>
          <div className="px-8 py-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <button
              onClick={onClose}
              disabled={loading}
              className="w-full px-6 py-4 rounded-lg border border-[#EF3B6D] text-[#EF3B6D] font-semibold hover:bg-[#fde7ef] transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              disabled={loading}
              className="w-full px-6 py-4 rounded-lg bg-[#EF3B6D] text-white font-semibold hover:bg-[#e22e61] transition-colors disabled:opacity-50"
            >
              {loading ? 'Processing...' : 'Proceed'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeleteAccountModal; 