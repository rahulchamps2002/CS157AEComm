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
    password: '1234567', // Replace with your MySQL password
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

// Place an Order
app.post('/place-order', (req, res) => {
    const { userId, cartItems, paymentMethod, shippingAddress, totalCost } = req.body;

    const orderQuery = `
        INSERT INTO Orders (User_ID, Total_Amount, Payment_Status, Shipping_Status)
        VALUES (?, ?, 'Paid', 'Shipping')
    `;

    db.query(orderQuery, [userId, totalCost], (err, orderResults) => {
        if (err) {
            console.error('Error placing order:', err);
            return res.status(500).json({ message: 'Order placement failed' });
        }

        const orderId = orderResults.insertId;

        // Add items to OrderItems
        const itemQueries = cartItems.map(item => {
            return new Promise((resolve, reject) => {
                const orderItemQuery = `
                    INSERT INTO OrderItems (Order_ID, Product_ID, Quantity)
                    VALUES (?, ?, ?)
                `;
                db.query(orderItemQuery, [orderId, item.Product_ID, item.Quantity], (err) => {
                    if (err) {
                        console.error('Error adding order item:', err);
                        reject(err);
                    } else {
                        resolve();
                    }
                });
            });
        });

        Promise.all(itemQueries)
            .then(() => {
                // Clear the shopping cart for the user
                const clearCartQuery = 'DELETE FROM ShoppingCart WHERE User_ID = ?';
                db.query(clearCartQuery, [userId], (err) => {
                    if (err) {
                        console.error('Error clearing cart:', err);
                        return res.status(500).json({ message: 'Error clearing cart' });
                    }
                    res.status(200).json({ message: 'Order placed successfully' });
                });
            })
            .catch((err) => {
                res.status(500).json({ message: 'Error placing order' });
            });
    });
});

// Fetch Orders for a User
app.get('/orders/:userId', (req, res) => {
    const { userId } = req.params;
    const query = `
        SELECT Order_ID, Total_Amount, Payment_Status, Shipping_Status
        FROM Orders
        WHERE User_ID = ?
    `;
    db.query(query, [userId], (err, results) => {
        if (err) {
            console.error('Error fetching orders:', err);
            return res.status(500).json({ message: 'Error fetching orders' });
        }
        res.status(200).json(results);
    });
});

// Start the server
const PORT = 5001;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
