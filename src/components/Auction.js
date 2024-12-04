import React, { useState, useEffect } from 'react';

function Auctions({ loggedInUserId: propUserId }) {
    const [auctions, setAuctions] = useState([]);
    const [selectedAuction, setSelectedAuction] = useState(null);
    const [bids, setBids] = useState([]);
    const [bidAmounts, setBidAmounts] = useState({});
    const loggedInUserId = propUserId || localStorage.getItem('loggedInUserId'); // Use prop or fallback to local storage

    useEffect(() => {
        fetch('http://localhost:5001/auction')
            .then((res) => res.json())
            .then((data) => {
                setAuctions(data);
            })
            .catch((err) => console.error('Error fetching auctions:', err));
    }, []);

    const viewBids = (auctionId) => {
        fetch(`http://localhost:5001/bid/${auctionId}`)
            .then((res) => res.json())
            .then((data) => {
                setSelectedAuction(auctionId);
                setBids(data);
            })
            .catch((err) => console.error('Error fetching bids:', err));
    };

    const handleBidInput = (auctionId, value) => {
        setBidAmounts((prev) => ({ ...prev, [auctionId]: value }));
    };

    const placeBid = (auctionId) => {
        if (!loggedInUserId) {
            alert('Please log in to place a bid.');
            return;
        }

        const bidAmount = bidAmounts[auctionId];
        if (!bidAmount || bidAmount <= 0) {
            alert('Please enter a valid bid amount.');
            return;
        }

        fetch('http://localhost:5001/auctions/bid', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ auctionId, userId: loggedInUserId, bidAmount }),
        })
            .then((res) => {
                if (res.ok) {
                    return res.json();
                } else {
                    throw new Error('Failed to place bid');
                }
            })
            .then((data) => {
                alert(data.message);
                setBidAmounts((prev) => ({ ...prev, [auctionId]: '' })); // Clear input for that auction
                viewBids(auctionId); // Refresh bids
            })
            .catch((err) => {
                console.error('Error placing bid:', err);
                alert('An error occurred while placing your bid. Please try again.');
            });
    };

    const backToAuctions = () => {
        setSelectedAuction(null);
        setBids([]);
    };

    return (
        <div className="auction-container">
            {!selectedAuction ? (
                <>
                    <h2>Active Auctions</h2>
                    {auctions.length === 0 ? (
                        <p>No active auctions available.</p>
                    ) : (
                        <ul>
                            {auctions.map((auction) => (
                                <li key={auction.Auction_ID}>
                                    <h3>{auction.Title}</h3>
                                    <p>{auction.Description}</p>
                                    <p>Starting Price: ${auction.Starting_Price}</p>
                                    <p>Current Highest Bid: ${auction.Highest_Bid || 'No bids yet'}</p>
                                    <p>Ends On: {new Date(auction.End_Date).toLocaleDateString()}</p>
                                    <input
                                        type="number"
                                        placeholder="Enter your bid"
                                        value={bidAmounts[auction.Auction_ID] || ''}
                                        onChange={(e) =>
                                            handleBidInput(auction.Auction_ID, e.target.value)
                                        }
                                    />
                                    <button onClick={() => placeBid(auction.Auction_ID)}>Place Bid</button>
                                    <button onClick={() => viewBids(auction.Auction_ID)}>View Bids</button>
                                </li>
                            ))}
                        </ul>
                    )}
                </>
            ) : (
                <>
                    <h2>Bids for Auction {selectedAuction}</h2>
                    {bids.length === 0 ? (
                        <p>No bids for this auction yet.</p>
                    ) : (
                        <ul>
                            {bids.map((bid, index) => (
                                <li key={index}>
                                    <p>
                                        <strong>Bidder:</strong> {bid.Bidder}
                                    </p>
                                    <p>
                                        <strong>Amount:</strong> ${bid.Bid_Amount}
                                    </p>
                                    <p>
                                        <strong>Time:</strong> {new Date(bid.Bid_Time).toLocaleString()}
                                    </p>
                                </li>
                            ))}
                        </ul>
                    )}
                    <button onClick={backToAuctions}>Back to Auctions</button>
                </>
            )}
        </div>
    );
}

export default Auctions;
