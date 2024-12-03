import React, { useState } from 'react';
import './styles/auction.css';

function Auction() {
    const [bidAmount, setBidAmount] = useState('');

    const placeBid = () => {
        alert(`Bid of $${bidAmount} placed successfully!`);
        setBidAmount('');
    };

    return (
        <div className='auction-container'>
            <h2>Place a Bid</h2>
            <input className='auction-input' type="number" value={bidAmount} onChange={(e) => setBidAmount(e.target.value)} placeholder="Enter your bid" />
            <button className='auction-button' onClick={placeBid}>Place Bid</button>
        </div>
    );
}

export default Auction;
