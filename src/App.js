import React, { useState } from 'react';
import Navbar from './components/Navbar';
import Home from './components/Home';
import Login from './components/Login';
import Register from './components/Register';
import Products from './components/Products';
import Cart from './components/Cart';
import Orders from './components/Orders';
import Review from './components/Review';
import Auction from './components/Auction';
import Shipping from './components/Shipping';
import Notifications from './components/Notifications';
import ProductReview from './components/ProductReview';

function App() {
    const [activeSection, setActiveSection] = useState('home');
    const [loggedInUserId, setLoggedInUserId] = useState(null);

    return (
        <div>
            <Navbar setActiveSection={setActiveSection} loggedIn={loggedInUserId !== null} />
            {activeSection === 'home' && <Home />}
            {activeSection === 'login' && <Login setLoggedInUserId={setLoggedInUserId} />}
            {activeSection === 'register' && <Register />}
            {activeSection === 'products' && <Products loggedInUserId={loggedInUserId} />}
            {activeSection === 'cart' && <Cart loggedInUserId={loggedInUserId} />}
	        {activeSection === 'orders' && <Orders loggedInUserId={loggedInUserId} />}
            {activeSection === 'review' && <Review />}
            {activeSection === 'auction' && <Auction />}
            {activeSection === 'shipping' && <Shipping />}
            {activeSection === 'notifications' && <Notifications />}
            {activeSection === 'productreview' && <ProductReview />}

        </div>
    );
}

export default App;