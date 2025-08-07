import React, { useState } from 'react'
import { useGetCustomerOrdersQuery, useGetCustomerByIdQuery, useGetCustomerOrdersByIdQuery } from '@/services/adminApi'
import { getOrderBadgeClass } from '@/utils/adminUtils'
import { X, Package, User, MapPin, Calendar, CreditCard, Truck, CheckCircle, Clock } from 'lucide-react'

interface OrderDetailsModalProps {
    orderId: string;
    onClose: () => void;
}

function OrderDetailsModal({ orderId, onClose }: OrderDetailsModalProps) {
    const { data: order, isLoading, error } = useGetCustomerOrdersByIdQuery(orderId);
    if (isLoading) return (
        <div className="admin-modal-overlay">
            <div className="admin-modal" style={{ maxWidth: '800px', width: '90%' }}>
                <div className="admin-card-body">
                    <div className="admin-spinner" style={{ margin: '2rem auto', display: 'block' }}></div>
                    <p className="admin-text-secondary text-center">Loading order details...</p>
                </div>
            </div>
        </div>
    );

    if (error || !order) return (
        <div className="admin-modal-overlay">
            <div className="admin-modal" style={{ maxWidth: '800px', width: '90%' }}>
                <div className="admin-card-body">
                    <p className="admin-text-danger text-center">Error loading order details</p>
                    <button onClick={onClose} className="admin-btn admin-btn-primary" style={{ marginTop: '1rem' }}>
                        Close
                    </button>
                </div>
            </div>
        </div>
    );

    const getStatusIcon = (status: string) => {
        switch (status?.toLowerCase()) {
            case 'delivered':
                return <CheckCircle className="h-5 w-5" style={{ color: '#10b981' }} />;
            case 'shipped':
                return <Truck className="h-5 w-5" style={{ color: '#3b82f6' }} />;
            case 'processing':
                return <Package className="h-5 w-5" style={{ color: '#f59e0b' }} />;
            case 'cancelled':
                return <X className="h-5 w-5" style={{ color: '#ef4444' }} />;
            default:
                return <Clock className="h-5 w-5" style={{ color: '#6b7280' }} />;
        }
    };

    const totalAmount = order.orderItems?.reduce((acc: number, item: any) =>
        acc + (item.price * item.quantity), 0) || 0;

    return (
        <div className="admin-modal-overlay">
            <div className="admin-modal" style={{ maxWidth: '900px', width: '90%', maxHeight: '90vh', overflow: 'auto' }}>
                {/* Header */}
                <div className="admin-card-header" style={{ backgroundColor: 'white', borderBottom: '1px solid #e2e8f0' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                            <h2 className="admin-text-primary" style={{ fontSize: '1.5rem', fontWeight: 700 }}>
                                Order Details
                            </h2>
                            <p className="admin-text-secondary" style={{ fontSize: '0.875rem', marginTop: '0.25rem' }}>
                                Order ID: {order._id}
                            </p>
                        </div>
                        <button
                            onClick={onClose}
                            className="admin-btn admin-btn-outline"
                            style={{ padding: '0.5rem', borderRadius: '50%', width: '40px', height: '40px' }}
                        >
                            <X className="h-5 w-5" />
                        </button>
                    </div>
                </div>

                <div className="admin-card-body" style={{ backgroundColor: 'white' }}>
                    {/* Order Status */}
                    <div style={{ marginBottom: '1.5rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            {getStatusIcon(order.status)}
                            <span className={getOrderBadgeClass(order.status)}>
                                {order.status}
                            </span>
                            <span className="admin-text-secondary" style={{ fontSize: '0.875rem' }}>
                                {new Date(order.createdAt).toLocaleDateString('en-IN', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                })}
                            </span>
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
                        {/* Customer Information */}
                        <div className="admin-card" style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0' }}>
                            <div className="admin-card-header" style={{ backgroundColor: '#f8fafc' }}>
                                <h3 className="admin-text-primary" style={{ fontSize: '1.125rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <User className="h-5 w-5" />
                                    Customer Information
                                </h3>
                            </div>
                            <div className="admin-card-body" style={{ backgroundColor: '#f8fafc' }}>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                    <div>
                                        <label className="admin-text-secondary" style={{ fontSize: '0.875rem', fontWeight: 500, display: 'block', marginBottom: '0.25rem' }}>
                                            Name
                                        </label>
                                        <p className="admin-text-primary" style={{ fontSize: '1rem' }}>
                                            {order.user?.firstName} {order.user?.lastName}
                                        </p>
                                    </div>
                                    <div>
                                        <label className="admin-text-secondary" style={{ fontSize: '0.875rem', fontWeight: 500, display: 'block', marginBottom: '0.25rem' }}>
                                            Email
                                        </label>
                                        <p className="admin-text-primary" style={{ fontSize: '1rem' }}>
                                            {order.user?.email}
                                        </p>
                                    </div>
                                    <div>
                                        <label className="admin-text-secondary" style={{ fontSize: '0.875rem', fontWeight: 500, display: 'block', marginBottom: '0.25rem' }}>
                                            Phone
                                        </label>
                                        <p className="admin-text-primary" style={{ fontSize: '1rem' }}>
                                            {order.user?.number || 'Not provided'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Order Information */}
                        <div className="admin-card" style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0' }}>
                            <div className="admin-card-header" style={{ backgroundColor: '#f8fafc' }}>
                                <h3 className="admin-text-primary" style={{ fontSize: '1.125rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <Package className="h-5 w-5" />
                                    Order Information
                                </h3>
                            </div>
                            <div className="admin-card-body" style={{ backgroundColor: '#f8fafc' }}>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                    <div>
                                        <label className="admin-text-secondary" style={{ fontSize: '0.875rem', fontWeight: 500, display: 'block', marginBottom: '0.25rem' }}>
                                            Order Date
                                        </label>
                                        <p className="admin-text-primary" style={{ fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                            <Calendar className="h-4 w-4" />
                                            {new Date(order.createdAt).toLocaleDateString('en-IN')}
                                        </p>
                                    </div>
                                    <div>
                                        <label className="admin-text-secondary" style={{ fontSize: '0.875rem', fontWeight: 500, display: 'block', marginBottom: '0.25rem' }}>
                                            Payment Method
                                        </label>
                                        <p className="admin-text-primary" style={{ fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                            <CreditCard className="h-4 w-4" />
                                            {order.paymentMethod || 'Not specified'}
                                        </p>
                                    </div>
                                    <div>
                                        <label className="admin-text-secondary" style={{ fontSize: '0.875rem', fontWeight: 500, display: 'block', marginBottom: '0.25rem' }}>
                                            Payment Status
                                        </label>
                                        <p className="admin-text-primary" style={{ fontSize: '1rem' }}>
                                            <span className={order.isPaid ? 'admin-badge admin-badge-success' : 'admin-badge admin-badge-warning'}>
                                                {order.isPaid ? 'Paid' : 'Pending'}
                                            </span>
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Order Items */}
                    {order.orderItems && order.orderItems.length > 0 && (
                        <div style={{ marginTop: '1.5rem' }}>
                            <h3 className="admin-text-primary" style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1rem' }}>
                                Order Items
                            </h3>
                            <div className="admin-card" style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0' }}>
                                <div className="admin-card-body" style={{ backgroundColor: '#f8fafc', padding: 0 }}>
                                    <table className="admin-table" style={{ backgroundColor: '#f8fafc' }}>
                                        <thead>
                                            <tr>
                                                <th>Product</th>
                                                <th>Quantity</th>
                                                <th>Price</th>
                                                <th>Total</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {order.orderItems.map((item: any, index: number) => (
                                                <tr key={index}>
                                                    <td>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                                            {item.productId?.files?.[0] && (
                                                                <img
                                                                    src={item.productId.files[0]}
                                                                    alt={item.productId.name}
                                                                    style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '4px' }}
                                                                />
                                                            )}
                                                            <div>
                                                                <div className="admin-text-primary" style={{ fontWeight: 500 }}>
                                                                    {item.productId?.name || 'Product not found'}
                                                                </div>
                                                                {item.size && (
                                                                    <div className="admin-text-secondary" style={{ fontSize: '0.875rem' }}>
                                                                        Size: {item.size}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="admin-text-primary">{item.quantity}</td>
                                                    <td className="admin-text-primary">₹{item.price}</td>
                                                    <td className="admin-text-primary">₹{item.price * item.quantity}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Order Summary */}
                    <div style={{ marginTop: '1.5rem' }}>
                        <div className="admin-card" style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0' }}>
                            <div className="admin-card-header" style={{ backgroundColor: '#f8fafc' }}>
                                <h3 className="admin-text-primary" style={{ fontSize: '1.125rem', fontWeight: 600 }}>
                                    Order Summary
                                </h3>
                            </div>
                            <div className="admin-card-body" style={{ backgroundColor: '#f8fafc' }}>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <span className="admin-text-secondary">Subtotal:</span>
                                        <span className="admin-text-primary">₹{totalAmount}</span>
                                    </div>
                                    {order.couponCode && (
                                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                            <span className="admin-text-secondary">Discount ({order.couponCode.code}):</span>
                                            <span className="admin-text-primary">-₹{order.couponCode.discount || 0}</span>
                                        </div>
                                    )}
                                    <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #e2e8f0', paddingTop: '0.5rem', marginTop: '0.5rem' }}>
                                        <span className="admin-text-primary" style={{ fontWeight: 600, fontSize: '1.125rem' }}>Total:</span>
                                        <span className="admin-text-primary" style={{ fontWeight: 600, fontSize: '1.125rem' }}>₹{order.totalPrice}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Shipping Address */}
                    {order.shippingAddress && (
                        <div style={{ marginTop: '1.5rem' }}>
                            <div className="admin-card" style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0' }}>
                                <div className="admin-card-header" style={{ backgroundColor: '#f8fafc' }}>
                                    <h3 className="admin-text-primary" style={{ fontSize: '1.125rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <MapPin className="h-5 w-5" />
                                        Shipping Address
                                    </h3>
                                </div>
                                <div className="admin-card-body" style={{ backgroundColor: '#f8fafc' }}>
                                    <p className="admin-text-primary">
                                        {order.shippingAddress.address}, {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipCode}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="admin-card-footer" style={{ backgroundColor: 'white', borderTop: '1px solid #e2e8f0' }}>
                    <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                        <button onClick={onClose} className="admin-btn admin-btn-primary">
                            Close
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function CustomerOrderInfo({ id }: { id: string }) {
    const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);

    const { data: orders, isLoading: ordersLoading, error: ordersError } = useGetCustomerOrdersQuery(id, { skip: !id });
    const { data: customer, isLoading: customerLoading, error: customerError } = useGetCustomerByIdQuery(id, { skip: !id });

    if (!id) return <div>No id found</div>;
    if (ordersLoading) return <div>Loading...</div>;

    if (ordersLoading) return <div>Loading...</div>;
    if (ordersError) return <div>Error: {'An unknown error occurred'}</div>;
    if (!orders) return <div>No orders found</div>;
    if (!customer) return <div>Customer not found</div>;

    const handleViewOrder = (orderId: string) => {
        setSelectedOrderId(orderId);
    };

    const handleCloseModal = () => {
        setSelectedOrderId(null);
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {/* Customer Details Card */}
            <div className="admin-card" style={{
                margin: '1rem 0',
                padding: 0,
                backgroundColor: 'white',
                border: '1px solid #e2e8f0'
            }}>
                <div className="admin-card-header" style={{ backgroundColor: 'white' }}>
                    <h2 className="admin-text-primary" style={{ fontSize: '1.25rem', fontWeight: 600 }}>
                        Customer Details
                    </h2>
                </div>
                <div className="admin-card-body" style={{ backgroundColor: 'white' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                        <div>
                            <label className="admin-text-secondary" style={{ fontSize: '0.875rem', fontWeight: 500, display: 'block', marginBottom: '0.25rem' }}>
                                Full Name
                            </label>
                            <p className="admin-text-primary" style={{ fontSize: '1rem', fontWeight: 500 }}>
                                {customer.firstName} {customer.lastName}
                            </p>
                        </div>
                        <div>
                            <label className="admin-text-secondary" style={{ fontSize: '0.875rem', fontWeight: 500, display: 'block', marginBottom: '0.25rem' }}>
                                Email
                            </label>
                            <p className="admin-text-primary" style={{ fontSize: '1rem' }}>
                                {customer.email}
                            </p>
                        </div>
                        <div>
                            <label className="admin-text-secondary" style={{ fontSize: '0.875rem', fontWeight: 500, display: 'block', marginBottom: '0.25rem' }}>
                                Phone Number
                            </label>
                            <p className="admin-text-primary" style={{ fontSize: '1rem' }}>
                                {customer.number || 'Not provided'}
                            </p>
                        </div>
                        <div>
                            <label className="admin-text-secondary" style={{ fontSize: '0.875rem', fontWeight: 500, display: 'block', marginBottom: '0.25rem' }}>
                                Address
                            </label>
                            <p className="admin-text-primary" style={{ fontSize: '1rem' }}>
                                {customer.address || 'Not provided'}
                            </p>
                        </div>
                        <div>
                            <label className="admin-text-secondary" style={{ fontSize: '0.875rem', fontWeight: 500, display: 'block', marginBottom: '0.25rem' }}>
                                City
                            </label>
                            <p className="admin-text-primary" style={{ fontSize: '1rem' }}>
                                {customer.city || 'Not provided'}
                            </p>
                        </div>
                        <div>
                            <label className="admin-text-secondary" style={{ fontSize: '0.875rem', fontWeight: 500, display: 'block', marginBottom: '0.25rem' }}>
                                Member Since
                            </label>
                            <p className="admin-text-primary" style={{ fontSize: '1rem' }}>
                                {new Date(customer.createdAt).toLocaleDateString('en-IN', { 
                                    year: 'numeric', 
                                    month: 'long', 
                                    day: 'numeric' 
                                })}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Orders Table Card */}
            <div className="admin-card" style={{
                margin: '1rem 0',
                padding: 0,
                backgroundColor: 'white',
                border: '1px solid #e2e8f0'
            }}>
                <div className="admin-card-header" style={{ backgroundColor: 'white' }}>
                    <h1 className="admin-text-primary" style={{ fontSize: '1.5rem', fontWeight: 700 }}>
                        Order History <span className="admin-text-secondary">({orders.total})</span>
                    </h1>
                </div>
                <div className="admin-card-body" style={{ padding: 0, backgroundColor: 'white' }}>
                    <table className="admin-table" style={{ backgroundColor: 'white' }}>
                        <thead>
                            <tr>
                                <th>Order ID</th>
                                <th>Total</th>
                                <th>Status</th>
                                <th>Date</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {orders.orders.map((order) => (
                                <tr key={order._id}>
                                    <td>{order._id}</td>
                                    <td>₹{order.orderItems.reduce((acc, item) => acc + item.price * item.quantity, 0)}</td>
                                    <td>
                                        <span className={getOrderBadgeClass(order.status)}>
                                            {order.status}
                                        </span>
                                    </td>
                                    <td>{new Date(order.createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}</td>
                                    <td>
                                        <button
                                            className="admin-btn admin-btn-primary"
                                            style={{ padding: '0.25rem 0.75rem', fontSize: '0.9rem' }}
                                            onClick={() => handleViewOrder(order._id)}
                                        >
                                            View
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Order Details Modal */}
            {selectedOrderId && (
                <OrderDetailsModal
                    orderId={selectedOrderId}
                    onClose={handleCloseModal}
                />
            )}
        </div>
    )
}