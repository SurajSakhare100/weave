import React, { useState, useEffect } from 'react';
import { useRequireVendorAuth } from '@/hooks/useRequireVendorAuth';
import VendorLayout from '@/components/VendorLayout';
import { getVendorEarnings } from '@/services/vendorService';
import api from '@/services/api';

const DebugEarnings: React.FC = () => {
  const { isAuthenticated, isInitialized } = useRequireVendorAuth();
  const [debugInfo, setDebugInfo] = useState<any>({});
  const [loading, setLoading] = useState(false);

  const testDirectAPI = async () => {
    setLoading(true);
    const info: any = {};
    
    try {
      // Test 1: Check if we have a vendor token
      const { getVendorToken } = await import('@/utils/vendorAuth');
      const token = getVendorToken() || 'No token found';
      info.token = token.substring(0, 50) + '...';
      
      // Test 2: Check vendor auth state
      info.authState = { isAuthenticated, isInitialized };
      
      // Test 3: Test direct API call
      console.log('Testing direct API call...');
      const response = await api.get('/vendors/earnings');
      info.directAPI = {
        status: response.status,
        success: response.data?.success,
        hasData: !!response.data?.data,
        dataKeys: response.data?.data ? Object.keys(response.data.data) : []
      };
      
      // Test 4: Test service function
      console.log('Testing service function...');
      const serviceResponse = await getVendorEarnings();
      info.serviceAPI = {
        success: serviceResponse?.success,
        hasData: !!serviceResponse?.data,
        dataKeys: serviceResponse?.data ? Object.keys(serviceResponse.data) : []
      };
      
      // Test 5: Show actual data
      if (serviceResponse?.data) {
        info.actualData = {
          totalEarnings: serviceResponse.data.totalEarnings,
          balance: serviceResponse.data.balance,
          totalSalesValue: serviceResponse.data.totalSalesValue,
          monthlySalesCount: serviceResponse.data.monthlySales?.length || 0,
          topCountriesCount: serviceResponse.data.topCountries?.length || 0,
          earningsTableCount: serviceResponse.data.earningsTable?.length || 0
        };
      }
      
    } catch (error: any) {
      info.error = {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data
      };
    }
    
    setDebugInfo(info);
    setLoading(false);
  };

  useEffect(() => {
    if (isInitialized && isAuthenticated) {
      testDirectAPI();
    }
  }, [isInitialized, isAuthenticated]);

  return (
    <VendorLayout>
      <div className="p-6 max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Earnings Debug</h1>
        
        <div className="mb-6">
          <button
            onClick={testDirectAPI}
            disabled={loading}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
          >
            {loading ? 'Testing...' : 'Test API'}
          </button>
        </div>

        <div className="space-y-4">
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="font-semibold mb-2">Authentication State:</h3>
            <pre className="text-sm bg-gray-100 p-2 rounded">
              {JSON.stringify(debugInfo.authState, null, 2)}
            </pre>
          </div>

          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="font-semibold mb-2">Token Info:</h3>
            <pre className="text-sm bg-gray-100 p-2 rounded">
              {debugInfo.token || 'No token info'}
            </pre>
          </div>

          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="font-semibold mb-2">Direct API Test:</h3>
            <pre className="text-sm bg-gray-100 p-2 rounded">
              {JSON.stringify(debugInfo.directAPI, null, 2)}
            </pre>
          </div>

          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="font-semibold mb-2">Service API Test:</h3>
            <pre className="text-sm bg-gray-100 p-2 rounded">
              {JSON.stringify(debugInfo.serviceAPI, null, 2)}
            </pre>
          </div>

          {debugInfo.actualData && (
            <div className="bg-white p-4 rounded-lg shadow">
              <h3 className="font-semibold mb-2">Actual Data Summary:</h3>
              <pre className="text-sm bg-gray-100 p-2 rounded">
                {JSON.stringify(debugInfo.actualData, null, 2)}
              </pre>
            </div>
          )}

          {debugInfo.error && (
            <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
              <h3 className="font-semibold text-red-800 mb-2">Error:</h3>
              <pre className="text-sm text-red-700">
                {JSON.stringify(debugInfo.error, null, 2)}
              </pre>
            </div>
          )}
        </div>

        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-semibold text-blue-800 mb-2">Next Steps:</h3>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• Check if authentication is working (should show ✅)</li>
            <li>• Check if API calls are successful</li>
            <li>• Check if real data is being returned</li>
            <li>• If no data, run the seed script: <code>cd server && node seed.js</code></li>
          </ul>
        </div>
      </div>
    </VendorLayout>
  );
};

export default DebugEarnings; 