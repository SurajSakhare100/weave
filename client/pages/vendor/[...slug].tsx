import { useEffect } from 'react';
import { useRouter } from 'next/router';

export default function VendorCatchAll() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to vendor 404 page
    router.replace('/vendor/404');
  }, [router]);

  return (
    <div className="min-h-screen vendor-bg-secondary flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 vendor-text-important"></div>
    </div>
  );
} 