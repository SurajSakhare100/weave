import React from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import VendorLayout from '@/components/Vendor/VendorLayout';
import { Home, ArrowLeft, Plus, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Vendor404() {
  const router = useRouter();

  const handleGoDashboard = () => {
    router.push('/vendor/dashboard');
  };

  const handleGoBack = () => {
    router.back();
  };

  const handleAddProduct = () => {
    router.push('/vendor/products/add');
  };

  const handleViewProducts = () => {
    router.push('/vendor/products');
  };

  return (
    <>
      <Head>
        <title>404 - Page Not Found | Vendor Dashboard</title>
        <meta name="description" content="The vendor page you're looking for doesn't exist." />
      </Head>
      
      <VendorLayout>
        <div className="p-6">
          <div className="max-w-md mx-auto text-center">
            {/* 404 Icon */}
            <div className="mb-8">
              <div className="mx-auto w-24 h-24 bg-[#3475A6] rounded-full flex items-center justify-center mb-4">
                <Package className="w-12 h-12 text-white" />
              </div>
              <h1 className="text-6xl font-bold text-[#3475A6] mb-2">404</h1>
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">Page Not Found</h2>
              <p className="text-gray-600 mb-8">
                Sorry, the vendor page you're looking for doesn't exist or has been moved.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="space-y-4">
              <Button
                variant="vendorPrimary"
                onClick={handleGoDashboard}
                className="w-full"
              >
                <Home className="w-4 h-4 mr-2" />
                Go to Dashboard
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
                variant="vendorSecondary"
                onClick={handleAddProduct}
                className="w-full"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add New Product
              </Button>
              
              <Button
                variant="vendorOutline"
                onClick={handleViewProducts}
                className="w-full"
              >
                <Package className="w-4 h-4 mr-2" />
                View All Products
              </Button>
            </div>

            {/* Quick Navigation */}
            <div className="mt-8 pt-8 border-t border-gray-200">
              <p className="text-sm text-gray-500 mb-4">Quick Navigation</p>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <button 
                  onClick={() => router.push('/vendor/products/released')}
                  className="text-[#3475A6] hover:underline p-2 rounded hover:bg-gray-50"
                >
                  Released Products
                </button>
                <button 
                  onClick={() => router.push('/vendor/products/drafts')}
                  className="text-[#3475A6] hover:underline p-2 rounded hover:bg-gray-50"
                >
                  Draft Products
                </button>
                <button 
                  onClick={() => router.push('/vendor/orders')}
                  className="text-[#3475A6] hover:underline p-2 rounded hover:bg-gray-50"
                >
                  Orders
                </button>
                <button 
                  onClick={() => router.push('/vendor/earnings')}
                  className="text-[#3475A6] hover:underline p-2 rounded hover:bg-gray-50"
                >
                  Earnings
                </button>
              </div>
            </div>
          </div>
        </div>
      </VendorLayout>
    </>
  );
} 