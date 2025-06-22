import axios from "axios";
import qs from 'qs'

export default async (
    payment,
    products, token
) => {
    try {
        const processedProducts = [];

        for (let key = 0; key < products.length; key++) {
            const obj = products[key];
            
            const params = qs.stringify({
                "order_id": obj.secretOrderId,
                "order_date": new Date(),
                "channel_id": "",
                "pickup_location": obj.pickup_location,
                "billing_customer_name": obj.details.name,
                "billing_last_name": " ",
                "billing_address": obj.details.address,
                "billing_address_2": obj.details.locality,
                "billing_city": obj.details.city,
                "billing_pincode": obj.details.pin,
                "billing_state": obj.details.state,
                "billing_country": "India",
                "billing_email": obj.details.email,
                "billing_phone": obj.details.number,
                "shipping_is_billing": 1,
                "order_items": [{
                    selling_price: obj.selling_price,
                    name: `${obj.proName} ${obj.variantSize === 'S' ||
                        obj.variantSize === 'M' || obj.variantSize === 'L' ||
                        obj.variantSize === 'XL' ? 'Size ' + obj.variantSize : ''}`,
                    sku: obj.product.toString(),
                    discount: obj.discount,
                    tax: 0,
                    hsn: 121,
                    units: obj.quantity,
                }],
                "payment_method": payment, //or Postpaid
                "shipping_charges": 0,
                "giftwrap_charges": 0,
                "transaction_charges": 0,
                "total_discount": 0,
                "sub_total": obj.price,
                "length": 10,
                "breadth": 15,
                "height": 20,
                "weight": 2.5
            });

            const url = `https://apiv2.shiprocket.in/v1/external/orders/create/adhoc?${params}`;

            try {
                const response = await axios({
                    method: "POST",
                    url,
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    redirect: "follow",
                });

                if (response.status === 200) {
                    obj.order_id_shiprocket = response.data.order_id;
                    obj.shipment_id = response.data.shipment_id;
                } else {
                    obj.order_id_shiprocket = null;
                    obj.shipment_id = null;
                }
            } catch (error) {
                console.error(`ShipRocket order creation error for ${obj.secretOrderId}:`, error.message);
                obj.order_id_shiprocket = null;
                obj.shipment_id = null;
            }

            processedProducts.push(obj);
        }

        return processedProducts;
    } catch (error) {
        console.error('ShipRocket order creation error:', error.message);
        throw new Error('Failed to create ShipRocket orders');
    }
}