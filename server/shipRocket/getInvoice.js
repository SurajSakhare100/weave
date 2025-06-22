import axios from "axios";

export default async (orderId, token) => {
    try {
        const data = {
            "ids": [orderId]
        };

        const config = {
            method: 'post',
            url: 'https://apiv2.shiprocket.in/v1/external/orders/print/invoice',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            data: data
        };

        const response = await axios(config);
        
        if (response.status === 200) {
            return response.data;
        } else {
            throw new Error('Failed to get invoice');
        }
    } catch (error) {
        console.error('ShipRocket get invoice error:', error.message);
        throw new Error('Failed to get invoice from ShipRocket');
    }
};