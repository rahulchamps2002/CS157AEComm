import React, { useState } from 'react';
import './styles.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser } from '@fortawesome/free-solid-svg-icons';

function Navbar({ setActiveSection, loggedIn }) {
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

    return (
        <header className="navHeader">
            <h1>eBUY</h1>
            <nav className="navMenu">
                <button className="navButtons" onClick={() => setActiveSection('home')}>Home</button> 
                <button className="navButtons" onClick={() => setActiveSection('cart')}>Cart</button> 
                <button className="navButtons" onClick={() => setActiveSection('auction')}>Auction</button> 
                <button className="navButtons" onClick={() => setActiveSection('product_review')}>Products</button> 
                {loggedIn && (
                    <div
                        className="dropdown"
                        onMouseEnter={() => setIsUserMenuOpen(true)}
                        onMouseLeave={() => setIsUserMenuOpen(false)}
                        style={{ display: 'inline-block' }}
                    >
                        <button className="navButtons navIcon">
                            <FontAwesomeIcon icon={faUser} size="lg" />
                        </button>
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
                )}
                {!loggedIn && (
                    <div>
                        <button className="navLogin" onClick={() => setActiveSection('login')}>Log In</button>
                        <button className='navLogin' onClick={() => setActiveSection('register')}>Sign Up</button>
                    </div>
                )}
            </nav>
            
        </header>
    );
}

export default Navbar;
