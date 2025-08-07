import React from 'react'
//make customer page id
import AdminLayout from '@/components/Admin/AdminLayout'
import AdminProtected from '@/components/Admin/AdminProtected'
import CustomerInfoComp from '@/components/Admin/Customer/CustomerInfoComp'
import { useRouter } from 'next/router'
import CustomerOrderInfo from '@/components/Admin/Customer/CustomerOrderInfo'

export default function CustomerPage() {
    const router = useRouter();
    const { id } = router.query;
    return (
        <AdminProtected>
            <AdminLayout title="Customers" description="Manage all customers">
                <CustomerOrderInfo id={id as string} />
            </AdminLayout>
        </AdminProtected>   
    )
}