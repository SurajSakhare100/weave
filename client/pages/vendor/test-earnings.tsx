import React, { useState, useEffect } from 'react';
import { useRequireVendorAuth } from '@/hooks/useRequireVendorAuth';
import { getVendorEarnings, getMockVendorEarnings } from '@/services/vendorService';
import VendorLayout from '@/components/VendorLayout';

const TestEarningsPage: React.FC = () => {
  const { isAuthenticated, isInitialized } = useRequireVendorAuth();
  const [earningsData, setEarningsData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [testResults, setTestResults] = useState<string[]>([]);

  const addTestResult = (result: string) => {
    setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${result}`]);
  };

  const testEarningsAPI = async () => {
    try {
      setLoading(true);
      setError(null);
      addTestResult('Testing earnings API...');
      
      const response = await getVendorEarnings();
      addTestResult(`API Response: ${JSON.stringify(response).substring(0, 100)}...`);
      
      if (response.success && response.data) {
        setEarningsData(response.data);
        addTestResult('✅ Earnings data received successfully');
        addTestResult(`Total Earnings: $${response.data.totalEarnings}`);
        addTestResult(`Balance: $${response.data.balance}`);
        addTestResult(`Total Sales Value: $${response.data.totalSalesValue}`);
        addTestResult(`Monthly Sales Count: ${response.data.monthlySales?.length || 0}`);
        addTestResult(`Top Countries Count: ${response.data.topCountries?.length || 0}`);
        addTestResult(`Earnings Table Count: ${response.data.earningsTable?.length || 0}`);
      } else {
        addTestResult('❌ API response missing data');
        setError('API response missing data');
      }
    } catch (err) {
      const errorMessage = (err as any).message || 'Unknown error';
      addTestResult(`❌ API Error: ${errorMessage}`);
      setError(errorMessage);
      
      // Test mock data as fallback
      addTestResult('Testing mock data fallback...');
      const mockResponse = getMockVendorEarnings();
      setEarningsData(mockResponse.data);
      addTestResult('✅ Mock data loaded as fallback');
    } finally {
      setLoading(false);
    }
  };

  const testMockData = () => {
    addTestResult('Testing mock data...');
    const mockResponse = getMockVendorEarnings();
    setEarningsData(mockResponse.data);
    addTestResult('✅ Mock data loaded');
  };

  const clearResults = () => {
    setTestResults([]);
    setEarningsData(null);
    setError(null);
  };

  if (!isInitialized || !isAuthenticated) {
    return null;
  }

  return (
    <VendorLayout>
      <div className="p-6 bg-[#f4f8fb] min-h-screen">
        <h1 className="text-2xl font-bold text-[#357ab8] mb-6">Earnings Feature Test</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Test Controls */}
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-[#357ab8] mb-4">Test Controls</h2>
            
            <div className="space-y-3">
              <button
                onClick={testEarningsAPI}
                disabled={loading}
                className="w-full bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 disabled:opacity-50"
              >
                {loading ? 'Testing...' : 'Test Real API'}
              </button>
              
              <button
                onClick={testMockData}
                className="w-full bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600"
              >
                Test Mock Data
              </button>
              
              <button
                onClick={clearResults}
                className="w-full bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600"
              >
                Clear Results
              </button>
            </div>

            {error && (
              <div className="mt-4 p-3 bg-red-100 border border-red-300 rounded-lg">
                <p className="text-red-700 text-sm">Error: {error}</p>
              </div>
            )}
          </div>

          {/* Test Results */}
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-[#357ab8] mb-4">Test Results</h2>
            
            <div className="h-64 overflow-y-auto bg-gray-50 p-3 rounded-lg">
              {testResults.length === 0 ? (
                <p className="text-gray-500 text-sm">No test results yet. Click a test button to start.</p>
              ) : (
                <div className="space-y-1">
                  {testResults.map((result, index) => (
                    <div key={index} className="text-sm font-mono">
                      {result}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Data Display */}
        {earningsData && (
          <div className="mt-6 bg-white rounded-xl p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-[#357ab8] mb-4">Earnings Data</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="p-4 bg-blue-50 rounded-lg">
                <h3 className="font-semibold text-blue-800">Total Earnings</h3>
                <p className="text-2xl font-bold text-blue-900">${earningsData.totalEarnings?.toFixed(2) || '0.00'}</p>
              </div>
              <div className="p-4 bg-yellow-50 rounded-lg">
                <h3 className="font-semibold text-yellow-800">Balance</h3>
                <p className="text-2xl font-bold text-yellow-900">${earningsData.balance?.toFixed(2) || '0.00'}</p>
              </div>
              <div className="p-4 bg-green-50 rounded-lg">
                <h3 className="font-semibold text-green-800">Total Sales Value</h3>
                <p className="text-2xl font-bold text-green-900">${earningsData.totalSalesValue?.toFixed(2) || '0.00'}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold mb-2">Monthly Sales ({earningsData.monthlySales?.length || 0} entries)</h3>
                <div className="max-h-32 overflow-y-auto">
                  {earningsData.monthlySales?.map((item: any, index: number) => (
                    <div key={index} className="text-sm p-2 bg-gray-50 rounded mb-1">
                      {item.month}: ${item.totalSales?.toFixed(2)} (Cost: {item.customerCost})
                    </div>
                  ))}
                </div>
              </div>
              
              <div>
                <h3 className="font-semibold mb-2">Top Countries ({earningsData.topCountries?.length || 0} entries)</h3>
                <div className="max-h-32 overflow-y-auto">
                  {earningsData.topCountries?.map((item: any, index: number) => (
                    <div key={index} className="text-sm p-2 bg-gray-50 rounded mb-1">
                      {item.country}: ${item.total?.toFixed(2)}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-4">
              <h3 className="font-semibold mb-2">Earnings Table ({earningsData.earningsTable?.length || 0} entries)</h3>
              <div className="max-h-32 overflow-y-auto">
                {earningsData.earningsTable?.slice(0, 5).map((item: any, index: number) => (
                  <div key={index} className="text-sm p-2 bg-gray-50 rounded mb-1">
                    {new Date(item.date).toLocaleDateString()}: {item.status} - ${item.earnings?.toFixed(2)} ({item.productSalesCount} items)
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </VendorLayout>
  );
};

export default TestEarningsPage; 