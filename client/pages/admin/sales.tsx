import React from 'react';
import AdminLayout from '@/components/Admin/AdminLayout';
import AdminProtected from '@/components/Admin/AdminProtected';
import AdminSalesDashboard from '@/components/Admin/SalesManagement/AdminSalesDashboard';

const AdminSalesPage = () => {
  return (
    <AdminProtected>
      <AdminLayout>
        <AdminSalesDashboard />
      </AdminLayout>
    </AdminProtected>
  );
};

export default AdminSalesPage;
