import React from 'react';

interface SimpleSalesChartProps {
  data: any[];
  type?: 'line' | 'bar';
}

const SimpleSalesChart: React.FC<SimpleSalesChartProps> = ({ data, type = 'line' }) => {
  // Simple placeholder chart - you can integrate with Chart.js or other libraries later
  const maxValue = Math.max(...data.map(item => item.totalSales || item.total || 0));
  
  return (
    <div className="w-full h-64 bg-gray-50 rounded-lg p-4">
      <h3 className="text-lg font-medium mb-4">Sales Trend</h3>
      <div className="flex items-end justify-between h-40 space-x-2">
        {data.slice(0, 7).map((item, index) => {
          const value = item.totalSales || item.total || 0;
          const height = maxValue > 0 ? (value / maxValue) * 100 : 0;
          
          return (
            <div key={index} className="flex flex-col items-center flex-1">
              <div className="w-full bg-blue-500 rounded-t" style={{ height: `${height}%`, minHeight: '4px' }}></div>
              <div className="text-xs text-gray-600 mt-2 text-center">
                <div>{item._id?.date || `Day ${index + 1}`}</div>
                <div className="font-medium">₹{value}</div>
              </div>
            </div>
          );
        })}
      </div>
      {data.length === 0 && (
        <div className="text-center text-gray-500 py-8">
          No data available
        </div>
      )}
    </div>
  );
};

export default SimpleSalesChart;
