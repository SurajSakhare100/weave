import axios from "axios";

export default async (parameter, token) => {
    const url = `https://apiv2.shiprocket.in/v1/external/courier/serviceability/?${parameter}`;

    const requestOptions = {
        url,
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        redirect: "follow",
    };

    try {
        const response = await axios(requestOptions);
        
        if (response.data.status === 200) {
            if (response.data.data && response.data.data['available_courier_companies'].length !== 0) {
                return true;
            } else {
                return false;
            }
        } else {
            return false;
        }
    } catch (error) {
        console.error('ShipRocket pincode check error:', error.message);
        throw new Error('Failed to check pincode serviceability');
    }
};