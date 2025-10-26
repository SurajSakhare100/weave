/* eslint-disable react-hooks/rules-of-hooks */
import React, { use } from 'react'
import { Loader } from 'lucide-react'
import {  useGetCustomerOrdersQuery } from '@/services/adminApi';

export default function CustomerInfoComp({id}: {id: string}) {
    if(!id) return <Loader/>;
    const { data: customer, isLoading, error } = useGetCustomerOrdersQuery(id);
    if (isLoading) return <div>Loading...</div>;
    
    if (error) return <div>Error: { 'An unknown error occurred'}</div>;
    if (!customer) return <div>Customer not found</div>;
   

        return (
        <div>
            <h1>Customer Info {customer.firstName} {customer.lastName}</h1>
            <div className="flex flex-col gap-2">
                <div className="flex flex-col gap-2">
                    <h2>Email</h2>
                    <p>{customer.email}</p>
                </div>
                <div className="flex flex-col gap-2">
                    <h2>Number</h2>
                    <p>{customer.number}</p>
                </div>
                <div className="flex flex-col gap-2">
                    <h2>Address</h2>
                    <p>{customer.address}</p>
                </div>
                <div className="flex flex-col gap-2">
                    <h2>City</h2>
                    <p>{customer.city}</p>
                </div>
            </div>  
        </div>
    )
}