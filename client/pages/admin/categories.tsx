import React, { useState } from 'react';
import CategoriesComp from '../../components/Admin/Categories/CategoriesComp';
import AdminLayout from '../../components/Admin/AdminLayout';
import AdminProtected from '../../components/Admin/AdminProtected';

function AdminCategoriesPage() {
  const [loaded, setLoaded] = useState(false)
  return (
    <AdminProtected>
      <AdminLayout title="Categories" description="Manage product categories">
        <CategoriesComp loaded={loaded} setLoaded={setLoaded} />
      </AdminLayout>
    </AdminProtected>
  );
}

export default AdminCategoriesPage; 