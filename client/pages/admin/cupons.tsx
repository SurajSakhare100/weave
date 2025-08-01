import React, { useState } from 'react';
import Cupon from '../../components/Admin/Cupons/Cupons';
import Header from '../../components/Admin/Header/Header';
import AdminProtected from '../../components/Admin/AdminProtected';

function AdminCouponsPage() {
  const [loaded, setLoaded] = useState(false);
  return (
    <AdminProtected>
      <div className="min-h-screen admin-bg-secondary">
        <Header />
        <Cupon loaded={loaded} setLoaded={setLoaded} />
      </div>
    </AdminProtected>
  );
}

export default AdminCouponsPage; 