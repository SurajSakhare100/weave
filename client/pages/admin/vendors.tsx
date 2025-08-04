import React, { useState } from 'react';
import AdminLayout from '../../components/Admin/AdminLayout';
import AdminProtected from '../../components/Admin/AdminProtected';
import VendorsComp from '../../components/Admin/Vendor/VendorsComp';
function AdminVendorsPage() {
  const [loaded, setLoaded] = useState(false);

  return (
    <AdminProtected>
      <AdminLayout title="Vendors" description="Manage all vendors and their approval status">
        <VendorsComp loaded={loaded} setLoaded={setLoaded} />
      </AdminLayout>
    </AdminProtected>
  );
}

export default AdminVendorsPage; 