import React, { useState, useEffect } from 'react';
import './styles/order.css'; 
import Review from './Review';

function Orders({ loggedInUserId }) {
    const [orders, setOrders] = useState([]);
    const [currentScreen, setCurrentScreen] = useState('orders');
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [orderReviews, setOrderReviews] = useState({});
    const [showReviewsFor, setShowReviewsFor] = useState(null);

    useEffect(() => {
        fetch(`http://localhost:5001/orders/${loggedInUserId}`)
            .then((res) => res.json())
            .then((data) => {
                console.log('Orders fetched:', data);
                const formattedOrders = formatOrdersData(data);
                setOrders(formattedOrders);
            })
            .catch((err) => console.error('Error fetching orders:', err));
    }, [loggedInUserId]);

    const formatOrdersData = (data) => {
        const orders = [];
        data.forEach((item) => {
            const existingOrder = orders.find((order) => order.Order_ID === item.Order_ID);
            if (existingOrder) {
                existingOrder.products.push(item);
            } else {
                orders.push({
                    Order_ID: item.Order_ID,
                    Total_Amount: item.Total_Amount,
                    Payment_Status: item.Payment_Status,
                    Shipping_Status: item.Shipping_Status,
                    products: [item],  
                });
            }
        });
        return orders;
    };

    const fetchOrderReviews = async (orderId) => {
        try {
            const res = await fetch(`http://localhost:5001/show-order-reviews/${orderId}`);
            const data = await res.json();
            setOrderReviews((prev) => ({ ...prev, [orderId]: data }));
            setShowReviewsFor(orderId);
        } catch (err) {
            console.error('Error fetching order reviews:', err);
        }
    };

    const openOrderDetails = (order) => {
        setSelectedOrder(order);
        setCurrentScreen('orderDetails');
    };

    const backToOrders = () => {
        setSelectedOrder(null);
        setCurrentScreen('orders');
    };

    return currentScreen === 'orders' ? (
        <div className="order-container">
            <h2>Your Orders</h2>
            {orders.length === 0 ? (
                <p>No orders found.</p>
            ) : (
                <ul className="order-list">
                    {orders.map((order) => (
                        <li key={order.Order_ID} className="order-item">
                            <div className="order-header">
                                <h3>Order {order.Order_ID} Details</h3>
                                <button
                                    className="order-reviewbutton"
                                    onClick={() => openOrderDetails(order)}
                                >
                                    View Order
                                </button>
                            </div>
                            
                        </li>
                    ))}
                </ul>
            )}
        </div>
    ) : (
        <div className="order-detail-screen">
            <p><b>Total Amount: </b>${selectedOrder.Total_Amount}</p>
            <p><b>Payment Status: </b>{selectedOrder.Payment_Status}</p>
            <p><b>Shipping Status: </b>{selectedOrder.Shipping_Status}</p>
            <h4>Purchased Products:</h4>
            <ul className='order-list'>
                {selectedOrder?.products.map((product, index) => (
                    <li className='order-items' key={index}>
                        <p>{product.Title}</p>
                        <p>{product.Description}</p>
                    </li>
                ))}
            </ul>
            <button onClick={backToOrders} className="back-button">
                Back to Orders
            </button>
            <Review
                loggedInUserId={loggedInUserId}
                orderId={selectedOrder?.Order_ID}
                orderTitle={selectedOrder?.products?.map((p) => p.Title).join(', ')}
            />
        </div>
    );
}

export default Orders;
