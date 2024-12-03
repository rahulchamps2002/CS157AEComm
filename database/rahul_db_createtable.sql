CREATE DATABASE IF NOT EXISTS market;
USE market;

CREATE TABLE User (
    User_ID INT AUTO_INCREMENT PRIMARY KEY,
    Name VARCHAR(100) NOT NULL,
    Password VARCHAR(255) NOT NULL,
    Phone VARCHAR(15),
    Role ENUM('Seller', 'Buyer') NOT NULL,
    Created_At TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    Updated_At TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE UserEmail (
    User_ID INT NOT NULL,
    Email VARCHAR(100) UNIQUE NOT NULL,
    PRIMARY KEY (Email),
    FOREIGN KEY (User_ID) REFERENCES User(User_ID) ON DELETE CASCADE
);

CREATE TABLE Product (
    Product_ID INT AUTO_INCREMENT PRIMARY KEY,
    Title VARCHAR(100) NOT NULL,
    Description TEXT,
    Price DECIMAL(10, 2) NOT NULL,
    Quantity INT DEFAULT 0,
    Listing_Date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    Status ENUM('Available', 'Sold') DEFAULT 'Available'
);

CREATE TABLE ProductSeller (
    Product_ID INT NOT NULL,
    Seller_ID INT NOT NULL,
    PRIMARY KEY (Product_ID, Seller_ID),
    FOREIGN KEY (Product_ID) REFERENCES Product(Product_ID) ON DELETE CASCADE,
    FOREIGN KEY (Seller_ID) REFERENCES User(User_ID) ON DELETE CASCADE
);

CREATE TABLE Orders (
    Order_ID INT AUTO_INCREMENT PRIMARY KEY,
    User_ID INT NOT NULL,
    Total_Amount DECIMAL(10,2) NOT NULL,
    Payment_Status ENUM('Paid', 'Cancelled') DEFAULT 'Paid',
    Shipping_Status ENUM('Shipping', 'Shipped', 'Delivered', 'Cancelled') DEFAULT 'Shipping',
    Order_Date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (User_ID) REFERENCES User(User_ID) ON DELETE CASCADE
);

CREATE TABLE OrderItems (
    Order_ID INT NOT NULL,
    Product_ID INT NOT NULL,
    Quantity INT NOT NULL,
    PRIMARY KEY (Order_ID),
    FOREIGN KEY (Order_ID) REFERENCES Orders(Order_ID) ON DELETE CASCADE,
    FOREIGN KEY (Product_ID) REFERENCES Product(Product_ID) ON DELETE CASCADE
);

CREATE TABLE ShoppingCart (
    User_ID INT NOT NULL,
    Product_ID INT NOT NULL,
    Quantity INT DEFAULT 1,
    PRIMARY KEY (User_ID, Product_ID),
    FOREIGN KEY (User_ID) REFERENCES User(User_ID) ON DELETE CASCADE,
    FOREIGN KEY (Product_ID) REFERENCES Product(Product_ID) ON DELETE CASCADE
);

CREATE TABLE Auction (
    Auction_ID INT AUTO_INCREMENT PRIMARY KEY,
    Starting_Price DECIMAL(10, 2) NOT NULL,
    End_Date DATE NOT NULL, 
    Product_ID INT NOT NULL, 
    Highest_Bid DECIMAL(10,2),
    FOREIGN KEY (Product_ID) REFERENCES Product(Product_ID) ON DELETE CASCADE
);

CREATE TABLE Bid (
    Bid_ID INT AUTO_INCREMENT PRIMARY KEY,
    Auction_ID INT NOT NULL,
    User_ID INT NOT NULL,
    Bid_Amount DECIMAL(10, 2) NOT NULL,
    Bid_Time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    Current_HighestBid DECIMAL(10,2),
    FOREIGN KEY (Auction_ID) REFERENCES Auction(Auction_ID) ON DELETE CASCADE,
    FOREIGN KEY (User_ID) REFERENCES User(User_ID) ON DELETE CASCADE,
    CHECK (Bid_Amount > Current_HighestBid)
);

CREATE TABLE Notification (
    Notification_ID INT AUTO_INCREMENT PRIMARY KEY,
    User_ID INT NOT NULL,
    Message TEXT NOT NULL,
    Notification_Date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    Status ENUM('Read', 'Unread') DEFAULT 'Unread',
    FOREIGN KEY (User_ID) REFERENCES User(User_ID) ON DELETE CASCADE
);

CREATE TABLE Payment (
    -- Payment_ID INT AUTO_INCREMENT,
    Payment_Order_ID INT NOT NULL,
    Payment_Amount DECIMAL(10, 2) NOT NULL,
    Payment_Method ENUM('Credit Card', 'PayPal') NOT NULL,
    Payment_Date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (Payment_Order_ID),
    FOREIGN KEY (Payment_Order_ID) REFERENCES Orders(Order_ID) ON DELETE CASCADE
);

-- can possibly remove
/*CREATE TABLE OrderInfo (
    Order_ID INT NOT NULL,
    Product_ID INT NOT NULL,
    User_ID INT NOT NULL,
    FOREIGN KEY (Product_ID) REFERENCES Product(Product_ID) ON DELETE CASCADE,
    FOREIGN KEY (User_ID) REFERENCES User(User_ID) ON DELETE CASCADE,
    FOREIGN KEY (Order_ID) REFERENCES Orders(Order_ID) ON DELETE CASCADE
);*/

CREATE TABLE Review (
    Review_ID INT AUTO_INCREMENT PRIMARY KEY,
    Order_ID INT NOT NULL,
    Review_Text TEXT DEFAULT NULL,
    Review_Date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    Rating INT CHECK (Rating BETWEEN 1 AND 5) DEFAULT NULL,
    FOREIGN KEY (Order_ID) REFERENCES Orders(Order_ID) ON DELETE CASCADE
);

CREATE TABLE OrderShipping (
    Order_ID INT PRIMARY KEY,
    User_ID INT NOT NULL, 
    Shipping_Address TEXT NOT NULL,
    Tracking_Number VARCHAR(50) NOT NULL,
    Shipping_Method ENUM('Standard', 'Express') DEFAULT 'Standard',
    Shipping_Date DATE,
    Delivery_Date DATE,
    FOREIGN KEY (User_ID) REFERENCES User(User_ID) ON DELETE CASCADE, 
    FOREIGN KEY (Order_ID) REFERENCES Orders(Order_ID) ON DELETE CASCADE
);

DELIMITER $$

CREATE TRIGGER after_order_insert
AFTER INSERT ON Orders
FOR EACH ROW
BEGIN
    DECLARE notification_message VARCHAR(255);
    SET notification_message = CONCAT('New order placed: Order #', NEW.Order_ID);
    INSERT INTO Notification (User_ID, Message, Status)
    VALUES (NEW.User_ID, notification_message, 'Unread');
END; $$

CREATE TRIGGER after_order_shipping_update
AFTER UPDATE ON Orders
FOR EACH ROW
BEGIN
    IF NEW.Shipping_Status <> OLD.Shipping_Status THEN
        INSERT INTO Notification (User_ID, Message, Status)
        VALUES (NEW.User_ID, CONCAT('Your order #', NEW.Order_ID, ' status updated to ', NEW.Shipping_Status), 'Unread');
    END IF;
END; $$

DELIMITER ;

DELIMITER $$

CREATE TRIGGER before_order_item_insert
BEFORE INSERT ON OrderItems
FOR EACH ROW
BEGIN
    DECLARE product_quantity INT;
    SELECT Quantity INTO product_quantity
    FROM Product
    WHERE Product_ID = NEW.Product_ID;

    IF product_quantity < NEW.Quantity THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Not enough inventory!';
    ELSE
        UPDATE Product
        SET Quantity = Quantity - NEW.Quantity
        WHERE Product_ID = NEW.Product_ID;
    END IF;
END$$

DELIMITER ;
DROP TABLE IF EXISTS AuctionHighestBid;
DROP TABLE IF EXISTS Bid;
DROP TABLE IF EXISTS BidDetails;
DROP TABLE IF EXISTS Auction;
DROP TABLE IF EXISTS Notification;
DROP TABLE IF EXISTS Payment;
DROP TABLE IF EXISTS ReviewRating;
DROP TABLE IF EXISTS Review;
DROP TABLE IF EXISTS OrderShipping;
DROP TABLE IF EXISTS OrderItems;
DROP TABLE IF EXISTS ShoppingCart;
DROP TABLE IF EXISTS ProductSeller;
DROP TABLE IF EXISTS ShippingDetails;
DROP TABLE IF EXISTS OrderPayment;
DROP TABLE IF EXISTS PaymentDetails;
DROP TABLE IF EXISTS OrderInfo;
DROP TABLE IF EXISTS Shipping;
DROP TABLE IF EXISTS Orders;
DROP TABLE IF EXISTS UserEmail;
DROP TABLE IF EXISTS ProductAuction;
DROP TABLE IF EXISTS Product;
DROP TABLE IF EXISTS UserContact;
DROP TABLE IF EXISTS UserRole;
DROP TABLE IF EXISTS User;
