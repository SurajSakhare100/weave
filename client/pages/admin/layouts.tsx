import React from 'react';
import AdminLayout from '../../components/Admin/AdminLayout';
import AdminProtected from '../../components/Admin/AdminProtected';

function AdminLayoutsPage() {
  return (
    <AdminProtected>
      <AdminLayout title="Layout Management" description="Manage website layouts and configurations">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="text-center py-12">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Layout Management</h3>
            <p className="text-gray-600">Layout management features coming soon...</p>
          </div>
        </div>
      </AdminLayout>
    </AdminProtected>
  );
}

export default AdminLayoutsPage; 