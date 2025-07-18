import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { debugAuth, clearAllAuth } from '@/utils/debugAuth';
import { getVendorToken } from '@/utils/vendorAuth';
import { vendorLogin } from '@/services/vendorService';

const TestAuthPage: React.FC = () => {
  const router = useRouter();
  const [token, setToken] = useState<string | null>(null);
  const [loginStatus, setLoginStatus] = useState<string>('');

  useEffect(() => {
    const currentToken = getVendorToken();
    setToken(currentToken);
  }, []);

  const handleLogin = async () => {
    try {
      setLoginStatus('Logging in...');
      const response = await vendorLogin({
        email: 'vendor@example.com',
        password: 'password123'
      });
      
      if (response.token) {
        setLoginStatus('Login successful! Token: ' + response.token.substring(0, 20) + '...');
        setToken(response.token);
        debugAuth();
      } else {
        setLoginStatus('Login failed - no token received');
      }
    } catch (error) {
      setLoginStatus('Login failed: ' + (error as any).message);
    }
  };

  const handleDebug = () => {
    debugAuth();
  };

  const handleClear = () => {
    clearAllAuth();
    setToken(null);
    setLoginStatus('Auth data cleared');
  };

  const handleTestAPI = async () => {
    try {
      const { getVendorDashboard } = await import('@/services/vendorService');
      const response = await getVendorDashboard();
      setLoginStatus('API test successful: ' + JSON.stringify(response).substring(0, 100) + '...');
    } catch (error) {
      setLoginStatus('API test failed: ' + (error as any).message);
    }
  };

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Vendor Authentication Test</h1>
      
      <div className="space-y-4">
        <div className="p-4 bg-gray-100 rounded">
          <h2 className="font-semibold mb-2">Current Token Status:</h2>
          <p>Token exists: {token ? 'Yes' : 'No'}</p>
          {token && <p>Token preview: {token.substring(0, 20)}...</p>}
        </div>

        <div className="space-y-2">
          <button
            onClick={handleLogin}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Test Login
          </button>
          
          <button
            onClick={handleDebug}
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 ml-2"
          >
            Debug Auth
          </button>
          
          <button
            onClick={handleClear}
            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 ml-2"
          >
            Clear Auth
          </button>
          
          <button
            onClick={handleTestAPI}
            className="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600 ml-2"
          >
            Test API Call
          </button>
        </div>

        <div className="p-4 bg-yellow-100 rounded">
          <h2 className="font-semibold mb-2">Status:</h2>
          <p>{loginStatus || 'No action taken yet'}</p>
        </div>

        <div className="p-4 bg-blue-100 rounded">
          <h2 className="font-semibold mb-2">Instructions:</h2>
          <ol className="list-decimal list-inside space-y-1">
            <li>Click "Debug Auth" to see current auth state</li>
            <li>Click "Test Login" to login with demo credentials</li>
            <li>Click "Debug Auth" again to see if token was stored</li>
            <li>Click "Test API Call" to test if API works with token</li>
            <li>Check browser console for detailed logs</li>
          </ol>
        </div>
      </div>
    </div>
  );
};

export default TestAuthPage; 