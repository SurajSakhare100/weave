import axios from 'axios';

export default async () => {
    const url = "https://apiv2.shiprocket.in/v1/external/auth/login";

    const requestOptions = {
        method: "POST",
        url,
        headers: {
            "Content-Type": "application/json",
        },
        data: {
            email: process.env.SHIPROCKET_EMAIL,
            password: process.env.SHIPROCKET_PASS,
        },
        redirect: "follow",
    };

    try {
        const response = await axios(requestOptions);
        
        if (response.status === 200) {
            return response.data.token;
        } else {
            throw new Error('Failed to get token');
        }
    } catch (error) {
        console.error('ShipRocket token error:', error.message);
        throw new Error('Failed to authenticate with ShipRocket');
    }
};