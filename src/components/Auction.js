import React, { useState, useEffect } from 'react';

function Auctions({ loggedInUserId }) {
    const [auctions, setAuctions] = useState([]);
    const [selectedAuction, setSelectedAuction] = useState(null);
    const [bids, setBids] = useState([]);

    useEffect(() => {
        fetch('http://localhost:5001/auctions')
            .then((res) => res.json())
            .then((data) => {
                console.log('Fetched Auctions:', data); 
                setAuctions(data);
            })
            .catch((err) => console.error('Error fetching auctions:', err));
    }, []);
    

    const viewBids = (auctionId) => {
        fetch(`http://localhost:5001/bids/${auctionId}`)
            .then((res) => res.json())
            .then((data) => {
                setSelectedAuction(auctionId);
                setBids(data);
            })
            .catch((err) => console.error('Error fetching bids:', err));
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
                                    <p>Ends On: {new Date(auction.End_Date).toLocaleDateString()}</p>
                                    <button onClick={() => viewBids(auction.Auction_ID)}>
                                        View Bids
                                    </button>
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
