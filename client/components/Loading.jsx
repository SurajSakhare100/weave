import React from 'react';

const Loading = () => {
  return (
    <div className="min-h-screen admin-bg-secondary flex items-center justify-center">
      <div className="flex items-center space-x-3">
        <div className="admin-spinner h-6 w-6"></div>
        <span className="admin-text-secondary">Loading...</span>
      </div>
    </div>
  );
};

export default Loading; 