import React from 'react';
import { useRouter } from 'next/router';
import { ChevronLeft } from 'lucide-react';

interface MobilePageHeaderProps {
  title: string;
  onBack?: () => void;
  className?: string;
}

const MobilePageHeader: React.FC<MobilePageHeaderProps> = ({ title, onBack, className }) => {
  const router = useRouter();

  const handleBack = () => {
    if (onBack) return onBack();
    // Fallback to browser history
    if (typeof window !== 'undefined') {
      if (window.history.length > 1) router.back();
      else router.push('/');
    }
  };

  return (
    <div
      className={`sm:hidden sticky top-0 z-30 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/75 ${className || ''}`}
      style={{ paddingTop: 'calc(env(safe-area-inset-top, 0px) + 8px)' }}
    >
      <div className="max-w-7xl mx-auto px-4 py-2">
        <div className="flex items-center gap-3">
          <button
            onClick={handleBack}
            aria-label="Go back"
            className="p-1 rounded-md text-[#6c4323] hover:bg-[#fff3ea] active:scale-95 transition"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <h1 className="text-lg font-semibold text-[#6c4323]">{title}</h1>
        </div>
      </div>
    </div>
  );
};

export default MobilePageHeader;


