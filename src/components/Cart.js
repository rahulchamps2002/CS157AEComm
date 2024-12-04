import React, { useState, useEffect } from 'react';
import './styles/cart.css';

function Cart({ loggedInUserId }) {
    const [cartItems, setCartItems] = useState([]);
    const [totalCost, setTotalCost] = useState(0);
    const [currentScreen, setCurrentScreen] = useState('cart'); // 'cart' or 'checkout'
    const [paymentMethod, setPaymentMethod] = useState('Credit Card');
    const [shippingAddress, setShippingAddress] = useState('');

    useEffect(() => {
        if (loggedInUserId) {
            fetch(`http://localhost:5001/cart/${loggedInUserId}`)
                .then(res => res.json())
                .then(data => {
                    setCartItems(data);
                    calculateTotalCost(data);
                })
                .catch(err => console.error('Error fetching cart:', err));
        }
    }, [loggedInUserId]);

    const calculateTotalCost = (items) => {
        const total = items.reduce((acc, item) => acc + item.Price * item.Quantity, 0);
        setTotalCost(total);
    };

    const handleDelete = (productId) => {
        fetch('http://localhost:5001/cart/delete', {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: loggedInUserId, productId })
        })
            .then((res) => res.json())
            .then((data) => {
                if (data.message === 'Item deleted successfully') {
                    const updatedCart = cartItems.filter(item => item.Product_ID !== productId);
                    setCartItems(updatedCart);
                    calculateTotalCost(updatedCart);
                } else {
                    alert('Failed to delete item from cart');
                }
            })
            .catch(err => console.error('Error deleting item:', err));
    };

    const handleCheckout = async () => {
        if (!shippingAddress.trim()) {
            alert('Please enter a valid shipping address.');
            return;
        }

        const orderDetails = {
            userId: loggedInUserId,
            cartItems,
            paymentMethod,
            shippingAddress,
            totalCost,
        };

        try {
            const response = await fetch('http://localhost:5001/checkout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(orderDetails),
            });

            if (!response.ok) {
                const errorResult = await response.json();
                alert(errorResult.message || 'Checkout failed. Please try again.');
                return;
            }

            const result = await response.json();
            alert(result.message);

            setCartItems([]);
            setTotalCost(0);
            setCurrentScreen('cart'); 
        } catch (error) {
            console.error('Error during checkout:', error);
            alert('Failed to complete checkout.');
        }
    };

    return currentScreen === 'cart' ? (
        
        <div className="cart-wrapper">
            <h2>Your Cart</h2>
            {cartItems.length === 0 ? (
                <p className='cart-p'>Your cart is empty.</p>
            ) : (
                <div className="cart-layout">
                    <div className="cart-items">
                        {cartItems.map(item => (
                            <div key={item.Product_ID} className="cart-item">
                                <h3>{item.Title}</h3>
                                <p>{item.Description}</p>
                                <div className="item-details">
                                    <p>${item.Price}</p>
                                    <div className="quantity-and-remove">
                                        <p>Quantity: {item.Quantity}</p>
                                        <button
                                            className="delete-button"
                                            onClick={() => handleDelete(item.Product_ID)}>
                                            Remove
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="cart-summary">
                        <h3>Total Cost</h3>
                        <p>${totalCost.toFixed(2)}</p>
                        <p>Taxes: --</p>
                        <p>Shipping: Free</p>
                        <button
                            className="checkout-button"
                            onClick={() => setCurrentScreen('checkout')}>
                            Checkout
                        </button>
                    </div>
                </div>
            )}
        </div>
    ) : (
        <div className="checkout-container">
            <h2>Checkout</h2>
            <div className='payment_address'>
                
                <label>Payment Method:</label>
                <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="payment-method">
                    <option value="Credit Card">Credit Card</option>
                    <option value="PayPal">PayPal</option>
                </select>
        
            </div>
            <div className='payment_address'>
                <label>Shipping Address:</label>
                <input
                    type="text"
                    value={shippingAddress}
                    onChange={(e) => setShippingAddress(e.target.value)}
                    className="address-input"
                />
            </div>
            <div className="checkout-actions">
                <button
                    onClick={() => setCurrentScreen('cart')}
                    className="cancel-button">
                    Back to Cart
                </button>
                <button onClick={handleCheckout} className="confirm-button">
                    Confirm Order
                </button>
                
            </div>
        </div>
    );
}

export default Cart;