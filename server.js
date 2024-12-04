const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// MySQL Connection
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'Rahechamps01!', // Replace with your MySQL password
    database: 'market',
    port: 3306
});

db.connect((err) => {
    if (err) {
        console.error('Error connecting to the database:', err);
        return;
    }
    console.log('Connected to MySQL Database.');
});

// User Registration
app.post('/register', (req, res) => {
    const { name, email, password } = req.body;
    const userQuery = 'INSERT INTO User (Name, Password, Role) VALUES (?, ?, "Buyer")';
    const emailQuery = 'INSERT INTO UserEmail (User_ID, Email) VALUES (?, ?)';

    db.query(userQuery, [name, password], (err, results) => {
        if (err) {
            console.error('Error registering user:', err.message);
            return res.status(500).json({ message: 'Registration failed' });
        }
        const userId = results.insertId;
        db.query(emailQuery, [userId, email], (err) => {
            if (err) {
                console.error('Error saving email:', err.message);
                return res.status(500).json({ message: 'Registration failed' });
            }
            res.status(201).json({ message: 'User registered successfully' });
        });
    });
});

// User Login
app.post('/login', (req, res) => {
    const { email, password } = req.body;
    const query = `
        SELECT u.*
        FROM User u
        JOIN UserEmail ue ON u.User_ID = ue.User_ID
        WHERE ue.Email = ? AND u.Password = ?
    `;
    db.query(query, [email, password], (err, results) => {
        if (err) return res.status(500).json({ message: 'Database error' });
        if (results.length > 0) {
            res.status(200).json({ message: 'Login successful', user: results[0] });
        } else {
            res.status(401).json({ message: 'Invalid credentials' });
        }
    });
});

// Fetch Products
app.get('/products', (req, res) => {
    const query = 'SELECT * FROM Product WHERE Status = "Available"';
    db.query(query, (err, results) => {
        if (err) return res.status(500).json({ message: 'Error fetching products' });
        res.status(200).json(results);
    });
});

// Fetch Cart Items for a User
app.get('/cart/:userId', (req, res) => {
    const { userId } = req.params;
    const query = `
        SELECT 
            sc.Product_ID, 
            p.Title, 
            p.Description, 
            p.Price, 
            sc.Quantity 
        FROM ShoppingCart sc
        JOIN Product p ON sc.Product_ID = p.Product_ID
        WHERE sc.User_ID = ?
    `;
    db.query(query, [userId], (err, results) => {
        if (err) {
            console.error('Error fetching cart items:', err.message);
            return res.status(500).json({ message: 'Error fetching cart items' });
        }
        res.status(200).json(results);
    });
});

// Add to Cart
app.post('/add-to-cart', (req, res) => {
    const { userId, productId, quantity } = req.body;
    const query = `
        INSERT INTO ShoppingCart (User_ID, Product_ID, Quantity)
        VALUES (?, ?, ?)
        ON DUPLICATE KEY UPDATE Quantity = Quantity + VALUES(Quantity)
    `;
    db.query(query, [userId, productId, quantity], (err) => {
        if (err) return res.status(500).json({ message: 'Error adding to cart' });
        res.status(201).json({ message: 'Product added to cart' });
    });
});

// Place a Bid
app.post('/auctions/bid', (req, res) => {
    const { auctionId, userId, bidAmount } = req.body;

    const getAuctionQuery = `
        SELECT Highest_Bid
        FROM Auction
        WHERE Auction_ID = ?
    `;

    db.query(getAuctionQuery, [auctionId], (err, auctionResults) => {
        if (err) {
            console.error('Error fetching auction:', err.message);
            return res.status(500).json({ message: 'Error fetching auction details' });
        }

        const currentHighestBid = auctionResults[0]?.Highest_Bid || 0;

        if (bidAmount <= currentHighestBid) {
            return res.status(400).json({ message: 'Bid must be higher than the current highest bid' });
        }

        const placeBidQuery = `
            INSERT INTO Bid (Auction_ID, User_ID, Bid_Amount, Bid_Time, Current_HighestBid)
            VALUES (?, ?, ?, CURRENT_TIMESTAMP, ?)
        `;

        db.query(placeBidQuery, [auctionId, userId, bidAmount, currentHighestBid], (err) => {
            if (err) {
                console.error('Error placing bid:', err.message);
                return res.status(500).json({ message: 'Error placing bid' });
            }

            const updateAuctionQuery = `
                UPDATE Auction
                SET Highest_Bid = ?
                WHERE Auction_ID = ?
            `;

            db.query(updateAuctionQuery, [bidAmount, auctionId], (err) => {
                if (err) {
                    console.error('Error updating highest bid:', err.message);
                    return res.status(500).json({ message: 'Error updating auction' });
                }

                res.status(200).json({ message: 'Bid placed successfully' });
            });
        });
    });
});

// Fetch Orders for a User
app.get('/orders/:userId', (req, res) => {
    const { userId } = req.params;
    const query = `
        SELECT 
            o.Order_ID, 
            o.Total_Amount, 
            o.Payment_Status, 
            o.Shipping_Status, 
            oi.Product_ID, 
            p.Title,
            p.Description
        FROM Orders o
        JOIN OrderItems oi ON o.Order_ID = oi.Order_ID
        JOIN Product p ON oi.Product_ID = p.Product_ID
        WHERE o.User_ID = ?
    `;
    db.query(query, [userId], (err, results) => {
        if (err) {
            console.error('Error fetching orders:', err.message);
            return res.status(500).json({ message: 'Error fetching orders' });
        }
        res.status(200).json(results);
    });
});

// Fetch Auctions
app.get('/auction', (req, res) => {
    const query = `
        SELECT 
            a.Auction_ID, 
            a.Starting_Price, 
            a.End_Date, 
            p.Title, 
            p.Description, 
            a.Highest_Bid
        FROM Auction a
        JOIN Product p ON a.Product_ID = p.Product_ID
        WHERE a.End_Date > CURRENT_DATE
    `;
    db.query(query, (err, results) => {
        if (err) {
            console.error('Error fetching auctions:', err.message);
            return res.status(500).json({ message: 'Error fetching auctions' });
        }
        res.status(200).json(results);
    });
});

// Fetch Bids for a Specific Auction
app.get('/bid/:auctionId', (req, res) => {
    const { auctionId } = req.params;
    const query = `
        SELECT 
            b.Bid_Amount, 
            b.Bid_Time, 
            u.Name AS Bidder
        FROM Bid b
        JOIN User u ON b.User_ID = u.User_ID
        WHERE b.Auction_ID = ?
        ORDER BY b.Bid_Amount DESC
    `;
    db.query(query, [auctionId], (err, results) => {
        if (err) {
            console.error('Error fetching bids:', err.message);
            return res.status(500).json({ message: 'Error fetching bids' });
        }
        res.status(200).json(results);
    });
});

// Start the server
const PORT = 5001;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
