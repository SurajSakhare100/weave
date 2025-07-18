import React, { useState, useEffect } from 'react';
import { useRequireVendorAuth } from '@/hooks/useRequireVendorAuth';
import VendorLayout from '@/components/VendorLayout';
import { getVendorEarnings } from '@/services/vendorService';

const TestEarningsAPI: React.FC = () => {
  const { isAuthenticated, isInitialized } = useRequireVendorAuth();
  const [earningsData, setEarningsData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [apiResponse, setApiResponse] = useState<any>(null);

  const testEarningsAPI = async () => {
    setLoading(true);
    setError(null);
    setApiResponse(null);
    
    try {
      console.log('Testing earnings API...');
      const response = await getVendorEarnings();
      console.log('Raw API Response:', response);
      
      setApiResponse(response);
      
      if (response.success && response.data) {
        setEarningsData(response.data);
        console.log('Earnings data:', response.data);
      } else {
        setError('Invalid response format');
        console.error('Invalid response:', response);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch earnings data');
      console.error('API Error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!isInitialized || !isAuthenticated) {
    return null;
  }

  return (
    <VendorLayout>
      <div className="p-6 max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Earnings API Test</h1>
        
        <div className="mb-6">
          <button
            onClick={testEarningsAPI}
            disabled={loading}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
          >
            {loading ? 'Testing...' : 'Test Earnings API'}
          </button>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            <strong>Error:</strong> {error}
          </div>
        )}

        {apiResponse && (
          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-2">Raw API Response:</h2>
            <pre className="bg-gray-100 p-4 rounded overflow-auto text-sm">
              {JSON.stringify(apiResponse, null, 2)}
            </pre>
          </div>
        )}

        {earningsData && (
          <div className="space-y-6">
            <h2 className="text-lg font-semibold">Parsed Earnings Data:</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white p-4 rounded-lg shadow">
                <h3 className="font-medium text-gray-600">Total Earnings</h3>
                <p className="text-2xl font-bold">${earningsData.totalEarnings?.toFixed(2) || '0.00'}</p>
              </div>
              <div className="bg-white p-4 rounded-lg shadow">
                <h3 className="font-medium text-gray-600">Balance</h3>
                <p className="text-2xl font-bold">${earningsData.balance?.toFixed(2) || '0.00'}</p>
              </div>
              <div className="bg-white p-4 rounded-lg shadow">
                <h3 className="font-medium text-gray-600">Total Sales Value</h3>
                <p className="text-2xl font-bold">${earningsData.totalSalesValue?.toFixed(2) || '0.00'}</p>
              </div>
            </div>

            {earningsData.monthlySales && earningsData.monthlySales.length > 0 && (
              <div>
                <h3 className="font-semibold mb-2">Monthly Sales:</h3>
                <div className="bg-white p-4 rounded-lg shadow">
                  <pre className="text-sm overflow-auto">
                    {JSON.stringify(earningsData.monthlySales, null, 2)}
                  </pre>
                </div>
              </div>
            )}

            {earningsData.topCountries && earningsData.topCountries.length > 0 && (
              <div>
                <h3 className="font-semibold mb-2">Top Countries:</h3>
                <div className="bg-white p-4 rounded-lg shadow">
                  <pre className="text-sm overflow-auto">
                    {JSON.stringify(earningsData.topCountries, null, 2)}
                  </pre>
                </div>
              </div>
            )}

            {earningsData.earningsTable && earningsData.earningsTable.length > 0 && (
              <div>
                <h3 className="font-semibold mb-2">Earnings Table (First 5 entries):</h3>
                <div className="bg-white p-4 rounded-lg shadow">
                  <pre className="text-sm overflow-auto">
                    {JSON.stringify(earningsData.earningsTable.slice(0, 5), null, 2)}
                  </pre>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </VendorLayout>
  );
};

export default TestEarningsAPI; 