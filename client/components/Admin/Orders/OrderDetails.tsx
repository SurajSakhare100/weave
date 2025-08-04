import React from 'react';
import { 
    Package, 
    User, 
    MapPin, 
    Phone,
    Mail,
    Calendar,
    CreditCard,
    Truck,
    CheckCircle,
    Clock,
    X,
    AlertCircle
} from 'lucide-react';
import { formatCurrency, getOrderStatusColor } from '../../../utils/adminUtils';

interface OrderDetailsProps {
    order: any;
    onClose: () => void;
}

function OrderDetails({ order, onClose }: OrderDetailsProps) {
    if (!order) return null;

    const getStatusIcon = (status: string) => {
        switch (status.toLowerCase()) {
            case 'delivered':
                return <CheckCircle className="h-5 w-5 text-green-600" />;
            case 'shipped':
                return <Truck className="h-5 w-5 text-blue-600" />;
            case 'processing':
                return <Package className="h-5 w-5 text-yellow-600" />;
            case 'cancelled':
                return <X className="h-5 w-5 text-red-600" />;
            default:
                return <Clock className="h-5 w-5 text-gray-600" />;
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">Order Details</h2>
                        <p className="text-sm text-gray-600 mt-1">
                            Order ID: {order.secretOrderId || order._id}
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                    >
                        <X className="h-6 w-6" />
                    </button>
                </div>

                <div className="p-6">
                    {/* Order Status */}
                    <div className="mb-6">
                        <div className="flex items-center space-x-3">
                            {getStatusIcon(order.OrderStatus)}
                            <span className={`inline-flex items-center px-3 py-1 text-sm font-medium rounded-full border ${getOrderStatusColor(order.OrderStatus)}`}>
                                {order.OrderStatus}
                            </span>
                            <span className="text-sm text-gray-500">
                                {new Date(order.date).toLocaleDateString('en-US', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                })}
                            </span>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Customer Information */}
                        <div className="bg-gray-50 rounded-lg p-4">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                                <User className="h-5 w-5 mr-2" />
                                Customer Information
                            </h3>
                            <div className="space-y-3">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Name</label>
                                    <p className="text-sm text-gray-900">{order.customer}</p>
                                </div>
                                {order.shippingAddress && (
                                    <>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Phone</label>
                                            <p className="text-sm text-gray-900 flex items-center">
                                                <Phone className="h-4 w-4 mr-1" />
                                                {order.shippingAddress.phone}
                                            </p>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Address</label>
                                            <p className="text-sm text-gray-900 flex items-start">
                                                <MapPin className="h-4 w-4 mr-1 mt-0.5 flex-shrink-0" />
                                                <span>
                                                    {order.shippingAddress.address}<br />
                                                    {order.shippingAddress.city}, {order.shippingAddress.state}<br />
                                                    {order.shippingAddress.pincode}
                                                </span>
                                            </p>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Order Information */}
                        <div className="bg-gray-50 rounded-lg p-4">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                                <Package className="h-5 w-5 mr-2" />
                                Order Information
                            </h3>
                            <div className="space-y-3">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Order Date</label>
                                    <p className="text-sm text-gray-900 flex items-center">
                                        <Calendar className="h-4 w-4 mr-1" />
                                        {new Date(order.date).toLocaleDateString()}
                                    </p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Payment Method</label>
                                    <p className="text-sm text-gray-900 flex items-center">
                                        <CreditCard className="h-4 w-4 mr-1" />
                                        {order.payType}
                                    </p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Payment Status</label>
                                    <p className="text-sm text-gray-900 flex items-center">
                                        {order.payStatus === 'paid' ? (
                                            <CheckCircle className="h-4 w-4 mr-1 text-green-600" />
                                        ) : (
                                            <AlertCircle className="h-4 w-4 mr-1 text-yellow-600" />
                                        )}
                                        {order.payStatus || 'Pending'}
                                    </p>
                                </div>
                                {order.vendorName && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Vendor</label>
                                        <p className="text-sm text-gray-900">{order.vendorName}</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Order Items */}
                    {order.items && order.items.length > 0 && (
                        <div className="mt-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Items</h3>
                            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Product
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Quantity
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Price
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Total
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {order.items.map((item: any, index: number) => (
                                            <tr key={index}>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center">
                                                        {item.image && (
                                                            <img
                                                                className="h-10 w-10 rounded object-cover mr-3"
                                                                src={item.image}
                                                                alt={item.name}
                                                            />
                                                        )}
                                                        <div>
                                                            <div className="text-sm font-medium text-gray-900">
                                                                {item.name}
                                                            </div>
                                                            {item.sizes && (
                                                                <div className="text-sm text-gray-500">
                                                                    Size: {item.sizes}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    {item.quantity}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    {formatCurrency(item.price)}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                    {formatCurrency(item.price * item.quantity)}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* Order Summary */}
                    <div className="mt-6 bg-gray-50 rounded-lg p-4">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h3>
                        <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-600">Subtotal:</span>
                                <span className="text-gray-900">{formatCurrency(order.price * 0.9)}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-600">Tax:</span>
                                <span className="text-gray-900">{formatCurrency(order.price * 0.1)}</span>
                            </div>
                            <div className="border-t border-gray-200 pt-2">
                                <div className="flex justify-between text-lg font-semibold">
                                    <span className="text-gray-900">Total:</span>
                                    <span className="text-gray-900">{formatCurrency(order.price)}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Delivery Information */}
                    {order.isDelivered && order.deliveredAt && (
                        <div className="mt-6 bg-green-50 border border-green-200 rounded-lg p-4">
                            <h3 className="text-lg font-semibold text-green-800 mb-2 flex items-center">
                                <CheckCircle className="h-5 w-5 mr-2" />
                                Delivery Information
                            </h3>
                            <p className="text-sm text-green-700">
                                Delivered on {new Date(order.deliveredAt).toLocaleDateString('en-US', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                })}
                            </p>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="flex justify-end space-x-3 p-6 border-t border-gray-200 bg-gray-50">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
}

export default OrderDetails;