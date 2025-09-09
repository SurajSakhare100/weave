import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

interface SalesChartProps {
  data: any[];
  type?: 'line' | 'bar';
}

const SalesChart: React.FC<SalesChartProps> = ({ data, type = 'line' }) => {
  const chartData = data.map(item => ({
    date: item._id.date,
    online: item._id.type === 'online' ? item.totalSales : 0,
    offline: item._id.type === 'offline' ? item.totalSales : 0,
    total: item.totalSales
  }));

  if (type === 'bar') {
    return (
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip formatter={(value) => [`₹${value}`, '']} />
          <Bar dataKey="online" fill="#3b82f6" name="Online" />
          <Bar dataKey="offline" fill="#8b5cf6" name="Offline" />
        </BarChart>
      </ResponsiveContainer>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" />
        <YAxis />
        <Tooltip formatter={(value) => [`₹${value}`, '']} />
        <Line type="monotone" dataKey="total" stroke="#10b981" strokeWidth={2} />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default SalesChart;
