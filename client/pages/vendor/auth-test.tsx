import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { loginStart, loginSuccess, loginFailure, logout } from '@/features/vendor/vendorSlice';
import { vendorLogin, vendorLogout, getVendorProfile, getVendorDashboard } from '@/services/vendorService';
import { getVendorToken, setVendorToken, removeVendorToken } from '@/utils/vendorAuth';
import { debugAuth } from '@/utils/debugAuth';
import { initializeVendorAuth } from '@/utils/vendorAuthInit';

const VendorAuthTest: React.FC = () => {
  const router = useRouter();
  const dispatch = useDispatch();
  const { isAuthenticated, loading, error } = useSelector((state: RootState) => state.vendor);
  
  const [testResults, setTestResults] = useState<string[]>([]);
  const [apiResults, setApiResults] = useState<any>(null);

  const addTestResult = (result: string) => {
    setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${result}`]);
  };

  const runAuthTest = async () => {
    setTestResults([]);
    setApiResults(null);
    
    addTestResult('=== Starting Vendor Authentication Test ===');
    
    // Test 1: Check current auth state
    addTestResult('1. Checking current authentication state...');
    const currentToken = getVendorToken();
    addTestResult(`   Current token: ${currentToken ? 'EXISTS' : 'NOT FOUND'}`);
    addTestResult(`   Redux isAuthenticated: ${isAuthenticated}`);
    
    // Test 2: Initialize auth
    addTestResult('2. Initializing vendor authentication...');
    const initResult = initializeVendorAuth();
    addTestResult(`   Init result: ${JSON.stringify(initResult)}`);
    
    // Test 3: Debug auth
    addTestResult('3. Running debug auth...');
    debugAuth();
    
    // Test 4: Test API calls
    addTestResult('4. Testing API calls...');
    try {
      const profileResponse = await getVendorProfile();
      addTestResult(`   Profile API: ${profileResponse.success ? 'SUCCESS' : 'FAILED'}`);
      setApiResults({ profile: profileResponse });
    } catch (error) {
      addTestResult(`   Profile API: ERROR - ${(error as any).message}`);
    }
    
    try {
      const dashboardResponse = await getVendorDashboard();
      addTestResult(`   Dashboard API: ${dashboardResponse.success ? 'SUCCESS' : 'FAILED'}`);
      setApiResults(prev => ({ ...prev, dashboard: dashboardResponse }));
    } catch (error) {
      addTestResult(`   Dashboard API: ERROR - ${(error as any).message}`);
    }
    
    addTestResult('=== Test Complete ===');
  };

  const testLogin = async () => {
    addTestResult('Testing login with demo credentials...');
    try {
      dispatch(loginStart());
      const response = await vendorLogin({
        email: 'vendor@example.com',
        password: 'password123'
      });
      
      if (response.token) {
        dispatch(loginSuccess({
          token: response.token,
          vendor: response.vendor
        }));
        addTestResult('✅ Login successful!');
        addTestResult(`   Token: ${response.token.substring(0, 20)}...`);
        addTestResult(`   Vendor: ${response.vendor?.name || 'Unknown'}`);
      } else {
        addTestResult('❌ Login failed - no token received');
      }
    } catch (error) {
      const errorMessage = (error as any).message || 'Unknown error';
      addTestResult(`❌ Login failed: ${errorMessage}`);
      dispatch(loginFailure(errorMessage));
    }
  };

  const testLogout = async () => {
    addTestResult('Testing logout...');
    try {
      await vendorLogout();
      dispatch(logout());
      addTestResult('✅ Logout successful!');
    } catch (error) {
      addTestResult(`❌ Logout failed: ${(error as any).message}`);
    }
  };

  const clearTokens = () => {
    addTestResult('Clearing all tokens...');
    removeVendorToken();
    dispatch(logout());
    addTestResult('✅ Tokens cleared!');
  };

  const testTokenStorage = () => {
    addTestResult('Testing token storage...');
    const testToken = 'test-token-123';
    setVendorToken(testToken);
    const retrievedToken = getVendorToken();
    addTestResult(`   Stored token: ${testToken}`);
    addTestResult(`   Retrieved token: ${retrievedToken}`);
    addTestResult(`   Match: ${testToken === retrievedToken ? '✅ YES' : '❌ NO'}`);
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-[#357ab8] mb-6">Vendor Authentication Test Suite</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Test Controls */}
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-[#357ab8] mb-4">Test Controls</h2>
          
          <div className="space-y-3">
            <button
              onClick={runAuthTest}
              className="w-full bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
            >
              Run Full Auth Test
            </button>
            
            <button
              onClick={testLogin}
              disabled={loading}
              className="w-full bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 disabled:opacity-50"
            >
              {loading ? 'Logging in...' : 'Test Login'}
            </button>
            
            <button
              onClick={testLogout}
              className="w-full bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600"
            >
              Test Logout
            </button>
            
            <button
              onClick={testTokenStorage}
              className="w-full bg-purple-500 text-white px-4 py-2 rounded-lg hover:bg-purple-600"
            >
              Test Token Storage
            </button>
            
            <button
              onClick={clearTokens}
              className="w-full bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600"
            >
              Clear All Tokens
            </button>
          </div>

          {/* Current Status */}
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-semibold mb-2">Current Status:</h3>
            <div className="space-y-1 text-sm">
              <p>Redux Authenticated: <span className={isAuthenticated ? 'text-green-600' : 'text-red-600'}>{isAuthenticated ? 'YES' : 'NO'}</span></p>
              <p>Token Exists: <span className={getVendorToken() ? 'text-green-600' : 'text-red-600'}>{getVendorToken() ? 'YES' : 'NO'}</span></p>
              <p>Loading: <span className={loading ? 'text-yellow-600' : 'text-gray-600'}>{loading ? 'YES' : 'NO'}</span></p>
              {error && <p className="text-red-600">Error: {error}</p>}
            </div>
          </div>
        </div>

        {/* Test Results */}
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-[#357ab8] mb-4">Test Results</h2>
          
          <div className="h-96 overflow-y-auto bg-gray-50 p-3 rounded-lg">
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

      {/* API Results */}
      {apiResults && (
        <div className="mt-6 bg-white rounded-xl p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-[#357ab8] mb-4">API Results</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {apiResults.profile && (
              <div className="p-4 bg-blue-50 rounded-lg">
                <h3 className="font-semibold text-blue-800 mb-2">Profile API</h3>
                <pre className="text-xs overflow-auto">
                  {JSON.stringify(apiResults.profile, null, 2)}
                </pre>
              </div>
            )}
            
            {apiResults.dashboard && (
              <div className="p-4 bg-green-50 rounded-lg">
                <h3 className="font-semibold text-green-800 mb-2">Dashboard API</h3>
                <pre className="text-xs overflow-auto">
                  {JSON.stringify(apiResults.dashboard, null, 2)}
                </pre>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Instructions */}
      <div className="mt-6 bg-blue-50 rounded-xl p-6">
        <h2 className="text-xl font-semibold text-[#357ab8] mb-4">Instructions</h2>
        <ol className="list-decimal list-inside space-y-2 text-sm">
          <li>Click "Run Full Auth Test" to test the complete authentication flow</li>
          <li>Use "Test Login" to login with demo credentials (vendor@example.com / password123)</li>
          <li>Use "Test Logout" to test the logout functionality</li>
          <li>Use "Test Token Storage" to verify token storage/retrieval</li>
          <li>Use "Clear All Tokens" to reset authentication state</li>
          <li>Check the console for detailed debugging information</li>
        </ol>
      </div>
    </div>
  );
};

export default VendorAuthTest; 