import React, { useState, useEffect } from 'react';

function Orders({ loggedInUserId }) {
    const [orders, setOrders] = useState([]);

    useEffect(() => {
    fetch(`http://localhost:5001/orders/${loggedInUserId}`)
        .then(res => res.json())
        .then(data => {
            console.log('Orders fetched from backend:', data); // Log to confirm data reception
            setOrders(data);
        })
        .catch(err => console.error('Error fetching orders:', err));
}, [loggedInUserId]);

    return (
        <div className='order-container'>
            <h2>Your Orders</h2>
            {orders.length === 0 ? (
                <p>No orders found.</p>
            ) : (
                orders.map(order => (
                    <div key={order.Order_ID}>
                        <h3>Order ID: {order.Order_ID}</h3>
                        <p>Total Amount: ${order.Total_Amount}</p>
                        <p>Payment Status: {order.Payment_Status}</p>
                        <p>Shipping Status: {order.Shipping_Status}</p>
                    </div>
                ))
            )}
        </div>
    );
}

export default Orders;
