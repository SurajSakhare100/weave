import React from 'react';
import { MessageCircle } from 'lucide-react';

interface Response {
  _id: string;
  comment: string;
  createdAt: string;
  user: {
    name: string;
    role: string;
  };
}

interface ResponseListProps {
  responses: Response[];
}

const ResponseList: React.FC<ResponseListProps> = ({ responses }) => {
  if (!responses || responses.length === 0) {
    return null;
  }

  return (
    <div className="mt-4 space-y-3">
      <h4 className="text-sm font-medium text-gray-700 flex items-center">
        <MessageCircle className="h-4 w-4 mr-2" />
        Responses ({responses.length})
      </h4>
      
      <div className="space-y-3">
        {responses.map((response) => (
          <div key={response._id} className="bg-gray-50 rounded-lg p-3 ml-4">
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium text-gray-900">
                  {response.user.name}
                </span>
                <span className="text-xs text-gray-500 bg-gray-200 px-2 py-1 rounded">
                  {response.user.role}
                </span>
              </div>
              <span className="text-xs text-gray-500">
                {new Date(response.createdAt).toLocaleDateString()}
              </span>
            </div>
            <p className="text-sm text-gray-700">{response.comment}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ResponseList; 