import React, { useEffect, useState } from 'react';

function Product_Review({ loggedInUserId }) {
    const [products, setProducts] = useState([]);
    const [reviews, setReviews] = useState([]);
    const [rating, setRating] = useState(0);
    const [hover, setHover] = useState(null);
    const [reviewText, setReviewText] = useState('');

    useEffect(() => {
        fetch('http://localhost:5000/products')
            .then(res => res.json())
            .then(data => setProducts(data))
            .catch(err => console.error('Error fetching products:', err));
    }, []);

    useEffect(() => {
        if (loggedInUserId) {
            fetch(`http://localhost:5000/show-review/${loggedInUserId}`)
                .then(res => res.json())
                .then(data => setReviews(data))
                .catch(err => console.error('Error fetching reviews:', err));
        }
    }, [loggedInUserId]);

    const addToCart = async (productId) => {
        if (!loggedInUserId) {
            alert('Please log in to add items to your cart.');
            return;
        }
        await fetch('http://localhost:5000/add-to-cart', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: loggedInUserId, productId, quantity: 1 })
        });
        alert('Product added to cart');
    };

    const handleSubmitReview = () => {
        fetch('http://localhost:5000/submit-review', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                userId: loggedInUserId,
                rating,
                reviewText,
            }),
        })
            .then(res => res.json())
            .then(data => {
                setReviews(prevReviews => [...prevReviews, data]);
                setRating(0);
                setReviewText('');
            })
            .catch(err => console.error('Error submitting review:', err));
    };

    return (
        <div className="pr_container">
            
            <div className="pr_section" style={styles.section}>
                <h2 className="pr_sectionTitle">Available Products</h2>
                {products.length === 0 ? (
                    <p>No products available.</p>
                ) : (
                    <ul className="pr_list">
                        {products.map(product => (
                            <li key={product.Product_ID} className="pr_item">
                                <h3>{product.Title}</h3>
                                <p>{product.Description}</p>
                                <p>Price: ${product.Price}</p>
                                <button style={styles.button} onClick={() => addToCart(product.Product_ID)}>Add to Cart</button>
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            <div className="pr_section">
                <h2 className="pr_sectionTitle">User Reviews</h2>
                {reviews.length === 0 ? (
                    <p>No reviews available.</p>
                ) : (
                    <ul className="pr_list">
                        {reviews.map(review => (
                            <li key={review.Review_ID} className="pr_item">
                                <p><strong>Product:</strong> {review.Product_Title}</p>
                                <p><strong>Rating:</strong> {review.Rating || 'Not yet rated'}</p>
                                <p><strong>Review:</strong> {review.Review_Text || 'No review text provided'}</p>
                            </li>
                        ))}
                    </ul>
                )}
                <div style={styles.addReviewContainer}>
                    <h3>Add a Written Review</h3>
                    <div style={styles.ratingContainer}>
                        <p style={{ fontWeight: 'bold', marginRight: '10px' }}>Overall Rating</p>
                        {[...Array(5)].map((_, index) => {
                            const ratingValue = index + 1;
                            return (
                                <span
                                    key={index}
                                    style={{
                                        fontSize: '24px',
                                        cursor: 'pointer',
                                        color: ratingValue <= (hover || rating) ? '#ffc107' : '#e4e5e9',
                                        transition: 'color 200ms',
                                    }}
                                    onClick={() => setRating(ratingValue)}
                                    onMouseEnter={() => setHover(ratingValue)}
                                    onMouseLeave={() => setHover(null)}
                                >
                                    &#9733;
                                </span>
                            );
                        })}
                    </div>
                    <textarea
                        style={styles.textArea}
                        value={reviewText}
                        onChange={(e) => setReviewText(e.target.value)}
                        placeholder="What did you like or dislike? What did you use this product for?"
                    />
                    <button style={styles.button} onClick={handleSubmitReview}>Submit</button>
                </div>
            </div>
        </div>
    );
}

const styles = {
   
    button: {
        padding: '10px 20px',
        backgroundColor: '#007bff',
        color: 'white',
        border: 'none',
        borderRadius: '5px',
        cursor: 'pointer',
        fontWeight: 'bold',
    },
    textArea: {
        width: '100%',
        height: '100px',
        padding: '10px',
        borderRadius: '5px',
        border: '1px solid #ccc',
        marginBottom: '20px',
    },
    addReviewContainer: {
        marginTop: '20px',
        padding: '20px',
        border: '1px solid #ccc',
        borderRadius: '5px',
        boxShadow: '0px 0px 10px rgba(0, 0, 0, 0.1)',
    },
    ratingContainer: {
        display: 'flex',
        marginBottom: '20px',
    },
};

export default Product_Review;
