import React, { useState } from 'react';
import { useRouter } from 'next/router';
import PendingVendors from '../../components/Admin/Vendor/PendingVendors';
import Header from '../../components/Admin/Header/Header';
import AdminProtected from '../../components/Admin/AdminProtected';

function PendingVendorsPage() {
  const [loaded, setLoaded] = useState(false);
  const router = useRouter();

  return (
    <AdminProtected>
      <div className="min-h-screen admin-bg-secondary">
        <Header />
        <PendingVendors loaded={loaded} setLoaded={setLoaded} />
      </div>
    </AdminProtected>
  );
}

export default PendingVendorsPage; 