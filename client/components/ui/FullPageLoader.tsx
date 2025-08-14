import React from 'react';
import { Loader2 } from 'lucide-react';

interface FullPageLoaderProps {
  text?: string;
}

const FullPageLoader: React.FC<FullPageLoaderProps> = ({ text = 'Loading...' }) => {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="h-8 w-8 sm:h-12 sm:w-12 animate-spin text-[#EE346C] mx-auto mb-4" />
        <p className="text-[#6c4323] text-sm sm:text-base">{text}</p>
      </div>
    </div>
  );
};

export default FullPageLoader;


