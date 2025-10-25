import React from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { Home, ArrowLeft, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Custom404() {
  const router = useRouter();

  const goHome = () => router.push('/');
  const goBack = () => router.back();
  const goSearch = () => router.push('/search');
  const goPage = (path: string) => router.push(path);

  return (
    <>
      <Head>
        <title>404 - Page Not Found | Weave</title>
        <meta name="description" content="The page you're looking for doesn't exist." />
      </Head>

      <main className="min-h-screen bg-gray-50 flex items-center justify-center px-4 sm:px-6 py-12">
        <div className="max-w-md w-full text-center">
          {/* 404 Icon */}
          <div className="mb-8">
            <div className="mx-auto w-20 h-20 sm:w-24 sm:h-24 lg:w-28 lg:h-28 bg-[#3475A6] rounded-full flex items-center justify-center mb-4">
              <Search className="w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 text-white" />
            </div>
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-[#3475A6] mb-2">404</h1>
            <h2 className="text-2xl sm:text-3xl font-semibold text-gray-900 mb-3">Page Not Found</h2>
            <p className="text-gray-600 text-sm sm:text-base">
              Sorry, the page you&apos;re looking for doesn&apos;t exist or has been moved.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3 sm:space-y-4">
            <Button
              variant="vendorPrimary"
              onClick={goHome}
              className="w-full text-sm sm:text-base flex items-center justify-center gap-2"
            >
              <Home className="w-4 h-4" />
              Go to Homepage
            </Button>

            <Button
              variant="vendorSecondary"
              onClick={goBack}
              className="w-full text-sm sm:text-base flex items-center justify-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Go Back
            </Button>

            <Button
              variant="vendorOutline"
              onClick={goSearch}
              className="w-full text-sm sm:text-base flex items-center justify-center gap-2"
            >
              <Search className="w-4 h-4" />
              Search Products
            </Button>
          </div>

          {/* Additional Help */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <p className="text-xs sm:text-sm text-gray-500 mb-2">Need help?</p>
            <div className="flex justify-center space-x-4 text-xs sm:text-sm">
              <button
                onClick={() => goPage('/about')}
                className="text-[#3475A6] hover:underline focus:outline-none focus:ring-2 focus:ring-[#3475A6] rounded"
              >
                About Us
              </button>
              <button
                onClick={() => goPage('/contact')}
                className="text-[#3475A6] hover:underline focus:outline-none focus:ring-2 focus:ring-[#3475A6] rounded"
              >
                Contact
              </button>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
