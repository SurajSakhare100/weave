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
      
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center">
          {/* 404 Icon */}
          <div className="mb-8">
            <div className="mx-auto w-24 h-24 bg-[#3475A6] rounded-full flex items-center justify-center mb-4">
              <Search className="w-12 h-12 text-white" />
            </div>
            <h1 className="text-6xl font-bold text-[#3475A6] mb-2">404</h1>
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">Page Not Found</h2>
            <p className="text-gray-600 mb-8">
              Sorry, the page you&apos;re looking for doesn&apos;t exist or has been moved.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="space-y-4">
            <Button
              variant="vendorPrimary"
              onClick={handleGoHome}
              className="w-full"
            >
              <Home className="w-4 h-4 mr-2" />
              Go to Homepage
            </Button>
            
            <Button
              variant="vendorSecondary"
              onClick={handleGoBack}
              className="w-full"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Go Back
            </Button>
            
            <Button
              variant="vendorOutline"
              onClick={handleSearch}
              className="w-full"
            >
              <Search className="w-4 h-4 mr-2" />
              Search Products
            </Button>
          </div>

          {/* Additional Help */}
          <div className="mt-8 pt-8 border-t border-gray-200">
            <p className="text-sm text-gray-500 mb-2">Need help?</p>
            <div className="flex justify-center space-x-4 text-sm">
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