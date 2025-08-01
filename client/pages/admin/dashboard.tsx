import React from 'react';
import DashboardComp from '../../components/Admin/Dashboard/DashboardComp';
import AdminLayout from '../../components/Admin/AdminLayout';
import AdminProtected from '../../components/Admin/AdminProtected';

function AdminDashboard() {
  return (
    <AdminProtected>
      <AdminLayout title="Dashboard" description="Overview of your application">
        <DashboardComp />
      </AdminLayout>
    </AdminProtected>
  );
}

export default AdminDashboard; 