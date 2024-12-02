import React, { useState } from 'react';
import './styles.css';

function Navbar({ setActiveSection }) {
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

    return (
        <header className="navHeader">
            <h1>Marketplace</h1>
            <nav>
                <button className="navButtons" onClick={() => setActiveSection('home')}>Home</button> |
                <button className="navButtons" onClick={() => setActiveSection('login_register')}>Login/Register</button> |
                {/*<button className="navButtons" onClick={() => setActiveSection('products')}>Products</button> |*/}
                <button className="navButtons" onClick={() => setActiveSection('cart')}>Cart</button> |
                {/*<button className="navButtons" onClick={() => setActiveSection('review')}>Review</button> |*/}
                <button className="navButtons" onClick={() => setActiveSection('auction')}>Auction</button> |
                {/*<button className="navButtons" onClick={() => setActiveSection('shipping')}>Shipping</button> |*/}
                {/*<button className="navButtons" onClick={() => setActiveSection('notifications')}>Notifications</button> |*/}
                {/*<button className="navButtons" onClick={() => setActiveSection('orders')}>Orders</button> |*/}
                <button className='navButtons' onClick={() => setActiveSection('product_review')}>Products</button>
                {/* Dropdown for User */}
                <div
                    className="dropdown"
                    onMouseEnter={() => setIsUserMenuOpen(true)}
                    onMouseLeave={() => setIsUserMenuOpen(false)}
                >
                    <button className="navButtons">User</button>
                    {isUserMenuOpen && (
                        <div className="dropdownMenu">
                            <button
                                className="dropdownItem"
                                onClick={() => setActiveSection('orders')}
                            >
                                Orders
                            </button>
                            <button
                                className="dropdownItem"
                                onClick={() => setActiveSection('notifications')}
                            >
                                Notifications
                            </button>
                            <button
                                className="dropdownItem"
                                onClick={() => setActiveSection('shipping')}
                            >
                                Shipping
                            </button>
                            
                        </div>
                    )}
                </div>
            </nav>
        </header>
    );
}

export default Navbar;
