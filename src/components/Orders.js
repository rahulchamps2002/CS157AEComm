import React, { useState, useEffect } from 'react';
import './styles/order.css'; // Assuming you have styles similar to product.css
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
                    products: [item],  // First product for this order
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
                                <h3>Order ID: {order.Order_ID}</h3>
                                <button
                                    className="order-reviewbutton"
                                    onClick={() => openOrderDetails(order)}
                                >
                                    View Order Details
                                </button>
                            </div>
                            <p>Total Amount: ${order.Total_Amount}</p>
                            <p>Payment Status: {order.Payment_Status}</p>
                            <p>Shipping Status: {order.Shipping_Status}</p>

                            {showReviewsFor === order.Order_ID && (
                                <div className="order-reviews">
                                    <h4>Reviews:</h4>
                                    {orderReviews[order.Order_ID]?.length > 0 ? (
                                        <ul>
                                            {orderReviews[order.Order_ID].map((review) => (
                                                <li key={review.Review_ID} className="review-item">
                                                    <p>
                                                        <strong>Rating:</strong> {review.Rating}/5
                                                    </p>
                                                    <p>
                                                        <strong>Comment:</strong>{' '}
                                                        {review.Review_Text || 'No comment provided.'}
                                                    </p>
                                                </li>
                                            ))}
                                        </ul>
                                    ) : (
                                        <p>No reviews yet.</p>
                                    )}
                                </div>
                            )}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    ) : (
        <div className="order-detail-screen">

            <h4>Purchased Products:</h4>
            <ul className='order-list'>
                {selectedOrder?.products.map((product, index) => (
                    <li className='order-items' key={index}>
                        <h5>{product.Title}</h5>
                        <p>{product.Description}</p>
                        <p>Price: ${product.Price}</p>
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
