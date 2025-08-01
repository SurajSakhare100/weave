import React, { useState } from 'react';
import PendingProducts from '../../components/Admin/Product/PendingProducts';
import Header from '../../components/Admin/Header/Header';
import AdminProtected from '../../components/Admin/AdminProtected';

function PendingProductsPage() {
  const [loaded, setLoaded] = useState(false);

  return (
    <AdminProtected>
      <div className="min-h-screen admin-bg-secondary">
        <Header />
        <PendingProducts loaded={loaded} setLoaded={setLoaded} />
      </div>
    </AdminProtected>
  );
}

export default PendingProductsPage; 