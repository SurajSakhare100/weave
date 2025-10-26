import React from 'react';
import { useRouter } from 'next/router';
import { ChevronLeft } from 'lucide-react';

interface MobilePageHeaderProps {
  title: string;
  onBack?: () => void;
  className?: string;
  tone?: 'light' | 'brand';
  rightActionLabel?: string;
  onRightAction?: () => void;
  rightActionHref?: string;
}

const MobilePageHeader: React.FC<MobilePageHeaderProps> = ({ 
  title, 
  onBack, 
  className,
  tone = 'light',
  rightActionLabel,
  onRightAction,
  rightActionHref,
}) => {
  const router = useRouter();

  const handleBack = () => {
    if (onBack) return onBack();
    // Fallback to browser history
    if (typeof window !== 'undefined') {
      if (window.history.length > 1) router.back();
      else router.push('/');
    }
  };

  const handleRightAction = () => {
    if (onRightAction) return onRightAction();
    if (rightActionHref) router.push(rightActionHref);
  };

  return (
    <div
      // className={`sm:hidden sticky top-0 z-30 ${
      //   tone === 'brand'
      //     ? 'bg-primary text-secondary'
      //     : 'bg-white/95 text-primary backdrop-blur supports-[backdrop-filter]:bg-white/75'
      // } ${className || ''}`}

      className='text-primary fixed top-0 z-50 bg-white w-full sm:hidden'
      style={{ paddingTop: 'calc(env(safe-area-inset-top, 0px) + 8px)' }}
    >
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={handleBack}
              aria-label="Go back"
              className={`p-1 rounded-md active:scale-95 transition ${
                tone === 'brand' ? 'text-secondary hover:bg-white/10' : 'text-primary hover:bg-[#fff3ea]'
              }`}
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <h1 className={`text-lg font-semibold truncate ${tone === 'brand' ? 'text-secondary' : 'text-primary'}`}>{title}</h1>
          </div>

          {rightActionLabel && (
            <button
              onClick={handleRightAction}
              className={`px-3 py-1.5 rounded-full text-sm font-medium border transition ${
                tone === 'brand'
                  ? 'bg-white/10 border-white/20 text-secondary hover:bg-white/15'
                  : 'bg-secondary border-[#E7D9CC] text-primary hover:bg-secondary'
              }`}
            >
              {rightActionLabel}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default MobilePageHeader;


