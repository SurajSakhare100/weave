import React from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { Home, ArrowLeft, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Custom404() {
  const router = useRouter();

  const handleGoHome = () => {
    router.push('/');
  };

  const handleGoBack = () => {
    router.back();
  };

  const handleSearch = () => {
    router.push('/search');
  };

  return (
    <>
      <Head>
        <title>404 - Page Not Found | Weave</title>
        <meta name="description" content="The page you're looking for doesn't exist." />
      </Head>
      
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 sm:px-6 py-8 sm:py-12">
        <div className="max-w-md w-full text-center">
          {/* 404 Icon */}
          <div className="mb-6 sm:mb-8">
            <div className="mx-auto w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 bg-[#3475A6] rounded-full flex items-center justify-center mb-3 sm:mb-4">
              <Search className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 text-white" />
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-[#3475A6] mb-2">404</h1>
            <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-2">Page Not Found</h2>
            <p className="text-gray-600 mb-6 sm:mb-8 text-sm sm:text-base">
              Sorry, the page you&apos;re looking for doesn&apos;t exist or has been moved.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3 sm:space-y-4">
            <Button
              variant="vendorPrimary"
              onClick={handleGoHome}
              className="w-full text-sm sm:text-base"
            >
              <Home className="w-4 h-4 mr-2" />
              Go to Homepage
            </Button>
            
            <Button
              variant="vendorSecondary"
              onClick={handleGoBack}
              className="w-full text-sm sm:text-base"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Go Back
            </Button>
            
            <Button
              variant="vendorOutline"
              onClick={handleSearch}
              className="w-full text-sm sm:text-base"
            >
              <Search className="w-4 h-4 mr-2" />
              Search Products
            </Button>
          </div>

          {/* Additional Help */}
          <div className="mt-6 sm:mt-8 pt-6 sm:pt-8 border-t border-gray-200">
            <p className="text-xs sm:text-sm text-gray-500 mb-2">Need help?</p>
            <div className="flex justify-center space-x-3 sm:space-x-4 text-xs sm:text-sm">
              <button 
                onClick={() => router.push('/about')}
                className="text-[#3475A6] hover:underline"
              >
                About Us
              </button>
              <button 
                onClick={() => router.push('/contact')}
                className="text-[#3475A6] hover:underline"
              >
                Contact
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
} 