import React, { useState, useEffect } from 'react';
import './styles/review.css';

function Review({ loggedInUserId }) {
    const [reviews, setReviews] = useState([]);
    const [rating, setRating] = useState(0);
    const [hover, setHover] = useState(null);
    const [reviewText, setReviewText] = useState('');

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

    const handleSubmitReview = () => {
        console.log('Submitting review:', { rating, reviewText });
        fetch('http://localhost:5001/submit-review', {
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
                console.log('Review submitted:', data);
                setReviews(prevReviews => [...prevReviews, data]);
                setRating(0);
                setReviewText('');
            })
            .catch(err => {
                console.error('Error submitting review:', err);
            });
    };

    return (
        <div className='review-container'>
            <h2 className='review-title'>User Reviews</h2>
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
            <div className='review-addReviewContainer'>
                <h3>Add a written review</h3>
                <div className='review-ratingContainer'>
                    <p className='review-stars'>Overall rating</p>
                    {[...Array(5)].map((star, index) => {
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
                                onMouseLeave={() => setHover(null)}>
                                &#9733;
                            </span>
                        );
                    })}
                </div>
                <textarea
                    className='review-textarea'
                    value={reviewText}
                    onChange={(e) => setReviewText(e.target.value)}
                    placeholder="What did you like or dislike? What did you use this product for?"
                />
                <button className='review-submitbutton' onClick={handleSubmitReview}>Submit</button>
            </div>
        </div>
    );
}



export default Review;
