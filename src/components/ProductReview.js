import React, { useState, useEffect } from 'react';
import './styles/review.css';

function ProductReview({ loggedInUserId }) {
    const [reviews, setReviews] = useState([]);

    useEffect(() => {
        if (loggedInUserId) {
            fetch(`http://localhost:5001/show-review/${loggedInUserId}`)
                .then(res => res.json())
                .then(data => {
                    console.log('Reviews fetched:', data);
                    setReviews(data);
                })
                .catch(err => {
                    console.error('Error fetching reviews:', err);
                });
        } else {
            console.log('No loggedInUserId found');
        }
    }, [loggedInUserId]);

    return (
        <div className='review-container'>
            <h2 className='review-title'>Reviews</h2>
            {reviews.length === 0 ? (
                <p>No reviews available.</p>
            ) : (
                <ul className='review-list'>
                    {reviews.map(review => (
                        <li key={review.Review_ID} className='review-item'>
                            <div className='review-header'>
                                <p className='review-producttitle'>Product: {review.Product_Title}</p>
                            </div>
                            <p className='review-rating'>Rating: {review.Rating ? review.Rating : 'Not yet rated'}</p>
                            <p className='review-text'>Review: {review.Review_Text ? review.Review_Text : 'No review text provided'}</p>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}



export default ProductReview;