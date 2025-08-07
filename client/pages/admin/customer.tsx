import AdminLayout from '@/components/Admin/AdminLayout'
import AdminProtected from '@/components/Admin/AdminProtected'
import CustomerComp from '@/components/Admin/Customer/CustomerComp'
import React from 'react'

export default function Customer() {
  return (
    <AdminProtected>
      <AdminLayout title="Customers" description="Manage all customers">
        <CustomerComp />
      </AdminLayout>
    </AdminProtected>   
  )
}