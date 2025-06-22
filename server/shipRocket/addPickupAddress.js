import axios from "axios";

export default async (data, token) => {
    try {
        const config = {
            method: 'post',
            url: 'https://apiv2.shiprocket.in/v1/external/settings/company/addpickup',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            data: data
        };

        const response = await axios(config);
        
        if (response.data.success) {
            return response.data;
        } else {
            throw new Error('Failed to add pickup address');
        }
    } catch (error) {
        console.error('ShipRocket add pickup address error:', error.message);
        throw new Error('Failed to add pickup address to ShipRocket');
    }
};