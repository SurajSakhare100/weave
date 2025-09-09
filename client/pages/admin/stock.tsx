import React from 'react';
import AdminLayout from '@/components/Admin/AdminLayout';
import AdminProtected from '@/components/Admin/AdminProtected';
import AdminStockDashboard from '@/components/Admin/StockManagement/AdminStockDashboard';

const AdminStockPage = () => {
  return (
    <AdminProtected>
      <AdminLayout>
        <AdminStockDashboard />
      </AdminLayout>
    </AdminProtected>
  );
};

export default AdminStockPage;
