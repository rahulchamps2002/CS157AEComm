import React, { useState, useEffect } from 'react';
import Review from './Review'; 
import './styles/product.css';

function Products({ loggedInUserId }) {
    const [products, setProducts] = useState([]);
    const [currentScreen, setCurrentScreen] = useState('products'); 
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [productReviews, setProductReviews] = useState({}); 
    const [showReviewsFor, setShowReviewsFor] = useState(null); 

    useEffect(() => {
        fetch('http://localhost:5001/products')
            .then((res) => res.json())
            .then((data) => setProducts(data))
            .catch((err) => console.error('Error fetching products:', err));
    }, []);

    const fetchReviews = async (productId) => {
        try {
            const res = await fetch(`http://localhost:5001/show-review/${productId}`);
            const data = await res.json();
            setProductReviews((prev) => ({ ...prev, [productId]: data }));
            setShowReviewsFor(productId); 
        } catch (err) {
            console.error('Error fetching reviews:', err);
        }
    };

    const addToCart = async (productId) => {
        if (!loggedInUserId) {
            alert('Please log in to add items to your cart.');
            return;
        }
        await fetch('http://localhost:5001/add-to-cart', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: loggedInUserId, productId, quantity: 1 }),
        });
        alert('Product added to cart');
    };

    const openReviews = (product) => {
        setSelectedProduct(product);
        setCurrentScreen('reviews'); 
    };

    const backToProducts = () => {
        setSelectedProduct(null);
        setCurrentScreen('products'); 
    };

    return currentScreen === 'products' ? (
        <div className="product-container">
            <h2 className="product-title">Available Products</h2>
            {products.length === 0 ? (
                <p className="product-message">No products available.</p>
            ) : (
                <ul className="product-list">
                    {products.map((product) => (
                        <li key={product.Product_ID} className="product-item">
                            <div className="product-header">
                                <h3 className="product-name">{product.Title}</h3>
                                <button
                                    className="product-reviewbutton"
                                    onClick={() => openReviews(product)}>
                                    Reviews
                                </button>
                            </div>
                            <p className="product-description">{product.Description}</p>
                            <div className="product-footer">
                                <button
                                    className="product-addtocartbutton"
                                    onClick={() => addToCart(product.Product_ID)}>
                                    Add to Cart
                                </button>
                            </div>
                            
                            {showReviewsFor === product.Product_ID && (
                                <div className="product-reviews">
                                    <h4>Reviews:</h4>
                                    {productReviews[product.Product_ID]?.length > 0 ? (
                                        <ul>
                                            {productReviews[product.Product_ID].map((review) => (
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
        /*fix*/
        <div className="review-screen">
            <Review
                loggedInUserId={loggedInUserId}
                productId={selectedProduct?.Product_ID}
                productTitle={selectedProduct?.Title}
            />
            <button onClick={backToProducts} className="back-button">
                Back to Products
            </button>
        </div>
    );
}

export default Products;
