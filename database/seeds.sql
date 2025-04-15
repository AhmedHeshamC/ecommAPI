-- Clear existing data
DELETE FROM product_images;
DELETE FROM cart_items;
DELETE FROM carts;
DELETE FROM order_items;
DELETE FROM orders;
DELETE FROM products;

-- Seed products
-- Electronics Category
INSERT INTO products (name, description, price, inventory, category) 
VALUES 
('Bluetooth Headphones', 'Wireless over-ear headphones with noise cancellation', 99.99, 50, 'electronics'),
('Smart Watch', 'Fitness tracker with heart rate monitor and sleep tracking', 149.99, 30, 'electronics');

-- Clothing Category
INSERT INTO products (name, description, price, inventory, category) 
VALUES 
('Cotton T-Shirt', 'Comfortable 100% cotton t-shirt available in multiple colors', 19.99, 100, 'clothing'),
('Denim Jeans', 'Classic fit denim jeans with stretch technology', 59.99, 75, 'clothing');

-- Home & Garden Category
INSERT INTO products (name, description, price, inventory, category) 
VALUES 
('Ceramic Plant Pot', 'Modern design ceramic pot for indoor plants', 24.99, 40, 'home'),
('Scented Candle Set', 'Set of 3 premium scented candles with long burn time', 34.99, 60, 'home');

-- Sports Category
INSERT INTO products (name, description, price, inventory, category) 
VALUES 
('Yoga Mat', 'Non-slip exercise mat for yoga and fitness', 29.99, 45, 'sports'),
('Water Bottle', 'BPA-free insulated water bottle that keeps drinks cold for 24 hours', 19.99, 80, 'sports');

-- Books Category
INSERT INTO products (name, description, price, inventory, category) 
VALUES 
('Programming Guide', 'Comprehensive guide to modern programming techniques', 39.99, 25, 'books'),
('Cookbook', 'Collection of 100 quick and easy recipes', 24.99, 35, 'books');

-- Add product images
INSERT INTO product_images (product_id, image_url) 
VALUES 
(1, 'https://example.com/images/headphones1.jpg'),
(1, 'https://example.com/images/headphones2.jpg'),
(2, 'https://example.com/images/smartwatch1.jpg'),
(3, 'https://example.com/images/tshirt1.jpg'),
(4, 'https://example.com/images/jeans1.jpg'),
(5, 'https://example.com/images/plantpot1.jpg'),
(6, 'https://example.com/images/candles1.jpg'),
(7, 'https://example.com/images/yogamat1.jpg'),
(8, 'https://example.com/images/waterbottle1.jpg'),
(9, 'https://example.com/images/programming1.jpg'),
(10, 'https://example.com/images/cookbook1.jpg');
