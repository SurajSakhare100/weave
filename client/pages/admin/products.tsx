import React, { useState } from 'react';
import ProductsComp from '../../components/Admin/Product/ProductsComp';
import AdminLayout from '../../components/Admin/AdminLayout';
import AdminProtected from '../../components/Admin/AdminProtected';

function AdminProductsPage() {
  const [loaded, setLoaded] = useState(false);

  return (
    <AdminProtected>
      <AdminLayout title="Products" description="Manage all products and their approval status">
        <ProductsComp loaded={loaded} setLoaded={setLoaded} />
      </AdminLayout>
    </AdminProtected>
  );
}

export default AdminProductsPage; 