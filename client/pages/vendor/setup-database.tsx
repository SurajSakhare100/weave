import React, { useState } from 'react';
import VendorLayout from '@/components/VendorLayout';

const SetupDatabase: React.FC = () => {
  const [message, setMessage] = useState<string>('');

  const handleSetupDatabase = async () => {
    setMessage('Setting up database with real earnings data...');
    
    try {
      // This would typically be done via an API endpoint
      // For now, we'll show instructions
      setMessage(`
        Database setup instructions:
        
        1. Make sure your MongoDB server is running
        2. Navigate to the server directory: cd server
        3. Run the seed script: node seed.js
        4. This will create:
           - Vendor: vendor@example.com / password123
           - Users: alice@example.com / alice@example.com, bob@example.com / password123
           - Products and orders for earnings calculation
        
        After running the seed script, you can:
        1. Login as vendor at /vendor/login
        2. View real earnings data at /vendor/revenue/earnings
        3. Test the API at /vendor/test-earnings-api
        
        Expected earnings data:
        - Total Earnings: $8,995 (paid orders)
        - Balance: $5,196 (pending orders)
        - Total Sales Value: $14,191 (all orders)
        - Monthly sales data for Jan-Apr 2024
        - Top countries: United States
        - Earnings table with 6 orders
      `);
    } catch (error) {
      setMessage('Error setting up database. Please check the console for details.');
    }
  };

  return (
    <VendorLayout>
      <div className="p-6 max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Database Setup for Real Earnings Data</h1>
        
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <h2 className="text-lg font-semibold text-blue-800 mb-2">Current Status</h2>
          <p className="text-blue-700">
            The earnings page is configured to fetch real data from the backend API. 
            To see real earnings data, you need to ensure the database has orders for the vendor.
          </p>
        </div>

        <div className="mb-6">
          <button
            onClick={handleSetupDatabase}
            className="bg-green-500 text-white px-6 py-3 rounded-lg hover:bg-green-600 transition-colors"
          >
            Setup Database with Real Data
          </button>
        </div>

        {message && (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <h3 className="font-semibold mb-2">Setup Instructions:</h3>
            <pre className="whitespace-pre-wrap text-sm text-gray-700">{message}</pre>
          </div>
        )}

        <div className="mt-8 space-y-4">
          <h2 className="text-lg font-semibold">Next Steps:</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white p-4 rounded-lg shadow">
              <h3 className="font-medium text-gray-800 mb-2">1. Test Authentication</h3>
              <p className="text-sm text-gray-600 mb-2">Verify vendor login works</p>
              <a 
                href="/vendor/auth-test" 
                className="text-blue-500 hover:text-blue-700 text-sm"
              >
                Go to Auth Test →
              </a>
            </div>
            
            <div className="bg-white p-4 rounded-lg shadow">
              <h3 className="font-medium text-gray-800 mb-2">2. Test Earnings API</h3>
              <p className="text-sm text-gray-600 mb-2">Check if earnings data loads</p>
              <a 
                href="/vendor/test-earnings-api" 
                className="text-blue-500 hover:text-blue-700 text-sm"
              >
                Go to API Test →
              </a>
            </div>
            
            <div className="bg-white p-4 rounded-lg shadow">
              <h3 className="font-medium text-gray-800 mb-2">5. Debug Earnings</h3>
              <p className="text-sm text-gray-600 mb-2">Detailed debugging for earnings issues</p>
              <a 
                href="/vendor/debug-earnings" 
                className="text-blue-500 hover:text-blue-700 text-sm"
              >
                Go to Debug →
              </a>
            </div>
            
            <div className="bg-white p-4 rounded-lg shadow">
              <h3 className="font-medium text-gray-800 mb-2">3. View Earnings Page</h3>
              <p className="text-sm text-gray-600 mb-2">See the main earnings dashboard</p>
              <a 
                href="/vendor/revenue/earnings" 
                className="text-blue-500 hover:text-blue-700 text-sm"
              >
                Go to Earnings →
              </a>
            </div>
            
            <div className="bg-white p-4 rounded-lg shadow">
              <h3 className="font-medium text-gray-800 mb-2">4. Vendor Login</h3>
              <p className="text-sm text-gray-600 mb-2">Login as vendor</p>
              <a 
                href="/vendor/login" 
                className="text-blue-500 hover:text-blue-700 text-sm"
              >
                Go to Login →
              </a>
            </div>
          </div>
        </div>

        <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h3 className="font-semibold text-yellow-800 mb-2">Important Notes:</h3>
          <ul className="text-sm text-yellow-700 space-y-1">
            <li>• The backend earnings endpoint is at: GET /api/vendors/earnings</li>
            <li>• It requires vendor authentication (Bearer token)</li>
            <li>• It calculates earnings from orders containing vendor's products</li>
            <li>• Paid orders contribute to "Total Earnings"</li>
            <li>• Pending orders contribute to "Balance"</li>
            <li>• All orders contribute to "Total Sales Value"</li>
          </ul>
        </div>
      </div>
    </VendorLayout>
  );
};

export default SetupDatabase; 