import React from 'react';
import { MessageSquare, Edit, Trash2, Shield } from 'lucide-react';
import { ReviewResponse } from '@/services/reviewService';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';

interface ResponseListProps {
  responses: ReviewResponse[];
  onEditResponse: (responseId: string, content: string) => void;
  onDeleteResponse: (responseId: string) => void;
}

const ResponseList: React.FC<ResponseListProps> = ({
  responses,
  onEditResponse,
  onDeleteResponse
}) => {
  const { isAuthenticated } = useSelector((state: RootState) => state.user);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (responses.length === 0) {
    return null;
  }

  return (
    <div className="mt-4 space-y-3">
      <div className="flex items-center space-x-2 text-sm text-gray-600">
        <MessageSquare className="h-4 w-4" />
        <span>Responses ({responses.length})</span>
      </div>
      
      {responses.map((response) => {
        // Handle cases where userId might be null or undefined
        const userName = response.userId?.name || 'Anonymous User';
        const userInitial = userName.charAt(0).toUpperCase();
        
        return (
          <div key={response._id} className="bg-gray-50 rounded-lg p-4 ml-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  <div className="w-6 h-6 bg-pink-100 rounded-full flex items-center justify-center">
                    <span className="text-pink-600 text-xs font-semibold">
                      {userInitial}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium text-gray-900">
                      {userName}
                    </span>
                    {response.isVendorResponse && (
                      <div className="flex items-center space-x-1 text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
                        <Shield className="h-3 w-3" />
                        <span>Vendor</span>
                      </div>
                    )}
                  </div>
                  <span className="text-xs text-gray-500">
                    {formatDate(response.createdAt)}
                  </span>
                </div>
                
                <p className="text-sm text-gray-700 leading-relaxed">
                  {response.content}
                </p>
              </div>

              {/* Action buttons for response owner */}
              {isAuthenticated && (
                <div className="flex space-x-2 ml-4">
                  <button
                    onClick={() => onEditResponse(response._id, response.content)}
                    className="text-blue-500 hover:text-blue-700 text-xs flex items-center space-x-1"
                  >
                    <Edit className="h-3 w-3" />
                    <span>Edit</span>
                  </button>
                  <button
                    onClick={() => onDeleteResponse(response._id)}
                    className="text-red-500 hover:text-red-700 text-xs flex items-center space-x-1"
                  >
                    <Trash2 className="h-3 w-3" />
                    <span>Delete</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ResponseList; 