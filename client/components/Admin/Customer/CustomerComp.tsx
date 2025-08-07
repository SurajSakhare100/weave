import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useGetCustomersQuery } from '@/services/adminApi';
import { Eye, Plus, RefreshCw, Search } from 'lucide-react';
import React, { useState } from 'react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import Link from 'next/link';

export default function CustomerComp() {


    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const [search, setSearch] = useState('');
    const [sort, setSort] = useState('createdAt');
    const [order, setOrder] = useState('desc');

    const { data: customers, isLoading, error } = useGetCustomersQuery({ page, limit, search, sort, order });

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-40">
                <div className="admin-spinner" />
                <span className="ml-2">Loading customers...</span>
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center text-red-500 py-8">
                Failed to load customers. Please try again.
            </div>
        );
    }

    return (
        <div>
            <div className="flex justify-between items-center mb-2">
                
                <div className="flex items-center gap-2">
                    <Input type="text" placeholder="Search" value={search} onChange={(e) => setSearch(e.target.value)} />
                    <Button variant="outline">
                        <Search />
                    </Button>
                    <Button variant="outline">
                        <RefreshCw />
                    </Button>
                </div>
            </div>
            <div className="admin-table-wrapper shadow-sm mt-4 overflow-x-auto">
            <div className="admin-card-header" style={{ backgroundColor: 'white' }}>
                    <h1 className="admin-text-primary" style={{ fontSize: '1.5rem', fontWeight: 700 }}>
                        {/* Order History <span className="admin-text-secondary">({orders.total})</span> */}
                        Customers <span className="admin-text-secondary">({customers.total})</span>
                    </h1>
                </div>
                <Table className=" admin-table min-w-full divide-y divide-gray-200 shadow-md rounded-lg overflow-hidden">
                    <TableHeader>
                        <TableRow className="bg-gray-50">
                            <TableHead className="px-6 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">Name</TableHead>
                            <TableHead className="px-6 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">Email</TableHead>
                            <TableHead className="px-6 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">Number</TableHead>
                            <TableHead className="px-6 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">Address</TableHead>
                            <TableHead className="px-6 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">City</TableHead>
                            <TableHead className="px-6 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">State</TableHead>
                            <TableHead className="px-6 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">Zip</TableHead>
                            <TableHead className="px-6 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">Country</TableHead>
                            <TableHead className="px-6 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">Created At</TableHead>
                            <TableHead className="px-6 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody className="bg-white divide-y divide-gray-200">
                        {customers?.customers.length === 0 ? (
                            <tr>
                                <td colSpan={11} className="text-center text-gray-500 py-8">
                                    No customers found.
                                </td>
                            </tr>
                        ) : (
                            customers?.customers.map((customer) => {
                                const address = customer.addressInfo && Array.isArray(customer.addressInfo) && customer.addressInfo.length > 0
                                    ? customer.addressInfo[0]
                                    : null;
                                return (
                                    <TableRow key={customer._id} className="hover:bg-gray-100 transition">
                                        <TableCell className="px-6 py-4 whitespace-nowrap">{customer.firstName} {customer.lastName}</TableCell>
                                        <TableCell className="px-6 py-4 whitespace-nowrap">{customer.email}</TableCell>
                                        <TableCell className="px-6 py-4 whitespace-nowrap">{customer.number}</TableCell>
                                        <TableCell className="px-6 py-4 whitespace-nowrap">{address ? address.address || '—' : '—'}</TableCell>
                                        <TableCell className="px-6 py-4 whitespace-nowrap">{address ? address.city || '—' : '—'}</TableCell>
                                        <TableCell className="px-6 py-4 whitespace-nowrap">{address ? address.state || '—' : '—'}</TableCell>
                                        <TableCell className="px-6 py-4 whitespace-nowrap">{address ? address.zip || '—' : '—'}</TableCell>
                                        <TableCell className="px-6 py-4 whitespace-nowrap">{address ? address.country || '—' : '—'}</TableCell>
                                        <TableCell className="px-6 py-4 whitespace-nowrap">
                                            {new Date(customer.createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}
                                        </TableCell>
                                        <TableCell>
                                            <Button variant="outline" title="View Details" className='admin-btn admin-btn-primary'>
                                                <Link href={`/admin/customer/${customer._id}`}>
                                                    <Eye />
                                                </Link>
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                );
                            })
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}