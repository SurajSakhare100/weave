import React, { useState } from 'react';
import OrdersComp from '../../components/Admin/Orders/OrdersComp';
import AdminLayout from '../../components/Admin/AdminLayout';
import AdminProtected from '../../components/Admin/AdminProtected';

function AdminOrdersPage() {
  const [loaded, setLoaded] = useState(false);
  return (
    <AdminProtected>
      <AdminLayout title="Orders" description="Manage customer orders and track their status">
        <OrdersComp loaded={loaded} setLoaded={setLoaded} />
      </AdminLayout>
    </AdminProtected>
  );
}

export default AdminOrdersPage; 