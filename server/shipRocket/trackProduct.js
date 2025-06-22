import axios from "axios";
import userHelpers from "../helpers/userHelpers.js";

export default async (shipment_id, token) => {
    try {
        const config = {
            method: 'get',
            url: `https://apiv2.shiprocket.in/v1/external/courier/track/shipment/${shipment_id}`,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        };

        const response = await axios(config);
        
        if (response.data.tracking_data.error) {
            throw new Error('Tracking data error');
        } else {
            return response.data;
        }
    } catch (error) {
        console.error('ShipRocket tracking error:', error.message);
        throw new Error('Failed to track shipment');
    }
};

export const orderStatusControl = async (tracking, order) => {
    try {
        if (tracking && tracking.tracking_data) {
            const tracking_data = tracking.tracking_data;

            if (order.OrderStatus !== 'Cancelled' && order.OrderStatus !== 'Return' && order.OrderStatus !== 'Failed') {
                if (tracking_data) {
                    if (tracking_data['shipment_status'] === 13) {
                        order.OrderStatus = 'Pickup Error';
                    } else if (tracking_data['shipment_status'] === 20) {
                        order.OrderStatus = 'Pickup Exception';
                    } else if (tracking_data['shipment_status'] === 15) {
                        order.OrderStatus = 'Pickup Rescheduled';
                    } else if (tracking_data['shipment_status'] === 19) {
                        order.OrderStatus = 'Out For Pickup';
                    } else if (tracking_data['shipment_status'] === 42) {
                        order.OrderStatus = 'Picked Up';
                    } else if (tracking_data['shipment_status'] === 6) {
                        order.OrderStatus = 'Shipped';
                    } else if (tracking_data['shipment_status'] === 18) {
                        order.OrderStatus = 'In Transit';
                    } else if (tracking_data['shipment_status'] === 38) {
                        order.OrderStatus = 'Reached at Destination';
                    } else if (tracking_data['shipment_status'] === 17) {
                        order.OrderStatus = 'Out For Delivery';
                    } else if (tracking_data['shipment_status'] === 7) {
                        order.OrderStatus = 'Delivered';

                        for (let i = 0; i < tracking_data['shipment_track'].length; i++) {
                            if (tracking_data.shipment_track[i].delivered_date) {
                                let date = tracking_data.shipment_track[i].delivered_date;
                                date = date.split(' ');
                                date = date[0].split('-');
                                date = `${date[1]}-${date[2]}-${date[0]}`;
                                order.updated = date;
                                break;
                            }
                        }
                    } else if (tracking_data['shipment_status'] === 21) {
                        order.OrderStatus = 'Undelivered';
                    } else if (tracking_data['shipment_status'] === 22) {
                        order.OrderStatus = 'Delayed';
                    } else if (tracking_data['shipment_status'] === 24) {
                        order.OrderStatus = 'Destroyed';
                    } else if (tracking_data['shipment_status'] === 25) {
                        order.OrderStatus = 'Damaged';
                    } else if (tracking_data['shipment_status'] === 39) {
                        order.OrderStatus = 'Misrouted';
                    } else if (tracking_data['shipment_status'] === 12) {
                        order.OrderStatus = 'Lost';
                    } else if (tracking_data['shipment_status'] === 16) {
                        order.OrderStatus = 'Cancellation Requested';
                    } else if (tracking_data['shipment_status'] === 45) {
                        order.OrderStatus = 'CANCELLED_BEFORE_DISPATCHED';
                    } else if (tracking_data['shipment_status'] === 8) {
                        order.OrderStatus = 'Cancelled';
                    } else if (
                        tracking_data['shipment_status'] === 9 ||
                        tracking_data['shipment_status'] === 14 ||
                        tracking_data['shipment_status'] === 44 ||
                        tracking_data['shipment_status'] === 40 ||
                        tracking_data['shipment_status'] === 41 ||
                        tracking_data['shipment_status'] === 46 ||
                        tracking_data['shipment_status'] === 10) {
                        order.OrderStatus = 'Return';
                    }

                    order.shipment_track_activities = tracking_data['shipment_track_activities'];
                    order.etd = tracking_data['etd'];
                    order.track_url = tracking_data['track_url'];

                    await userHelpers.changeOrderStatus(order);
                }
            }
        }

        return order;
    } catch (error) {
        console.error('Order status control error:', error.message);
        throw new Error('Failed to update order status');
    }
};