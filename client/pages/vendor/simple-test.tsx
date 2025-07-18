import React, { useState } from 'react';
import { getVendorEarnings } from '@/services/vendorService';

const SimpleTest: React.FC = () => {
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const testAPI = async () => {
    setLoading(true);
    try {
      const response = await getVendorEarnings();
      setResult(response);
      console.log('API Response:', response);
    } catch (error) {
      setResult({ error: error.message });
      console.error('API Error:', error);
    }
    setLoading(false);
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Simple Earnings Test</h1>
      <button 
        onClick={testAPI} 
        disabled={loading}
        className="bg-blue-500 text-white px-4 py-2 rounded"
      >
        {loading ? 'Testing...' : 'Test Earnings API'}
      </button>
      
      {result && (
        <div className="mt-4">
          <h2 className="font-bold">Result:</h2>
          <pre className="bg-gray-100 p-4 rounded mt-2">
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
};

export default SimpleTest; 