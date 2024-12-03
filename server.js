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

// Delete an Item from Cart
app.delete('/cart/delete', (req, res) => {
    const { userId, productId } = req.body;
    const query = 'DELETE FROM ShoppingCart WHERE User_ID = ? AND Product_ID = ?';
    db.query(query, [userId, productId], (err) => {
        if (err) {
            console.error('Error deleting item from cart:', err.message);
            return res.status(500).json({ message: 'Error deleting item from cart' });
        }
        res.status(200).json({ message: 'Item deleted successfully' });
    });
});

// Checkout (Place an Order and Clear Cart)
app.post('/checkout', (req, res) => {
    const { userId, cartItems, paymentMethod, shippingAddress, totalCost } = req.body;

    const orderQuery = `
        INSERT INTO Orders (User_ID, Total_Amount, Payment_Status, Shipping_Status)
        VALUES (?, ?, 'Paid', 'Shipping')
    `;

    db.query(orderQuery, [userId, totalCost], (err, orderResults) => {
        if (err) {
            console.error('Error placing order:', err.message);
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
                        console.error('Error adding order item:', err.message);
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
                        console.error('Error clearing cart:', err.message);
                        return res.status(500).json({ message: 'Error clearing cart' });
                    }
                    res.status(200).json({ message: 'Order placed and cart emptied successfully' });
                });
            })
            .catch(err => {
                console.error('Error during checkout:', err.message);
                res.status(500).json({ message: 'Checkout failed' });
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
            p.Title
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


// Start the server
const PORT = 5001;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
