DROP DATABASE IF EXISTS bamazon_DB;

CREATE DATABASE bamazon_DB;

USE bamazon_DB;

CREATE TABLE products (
	item_id INT NOT NULL AUTO_INCREMENT,
    PRIMARY KEY (item_id),
    product_name VARCHAR(50) NULL,
    department_name VARCHAR(50) NULL,
    price DECIMAL (10,2),
    quantity INT (10),
    product_sales DECIMAL(13,2) DEFAULT 0.00
);

INSERT INTO products (product_name, department_name, price, quantity)
VALUES 	("Framed Art", "Home", 99.99, 8),
				("Dinner Table Set", "Home", 449.99, 5),
				("Queen Size Bed Sheet Set", "Home", 49.99, 9),
                ("Playstation 4", "Electronics", 499.99, 15),
                ("Nikon D850 Camera", "Electronics", 2999.99, 12),
                ("iPhone 10", "Electronics", 999.99, 20),
                ("Nike Shoes", "Clothing", 59.99, 10),
                ("Wide Brimmed Hat", "Clothing", 19.99, 30),
                ("Pink Dress", "Clothing", 39.99, 35),
                ("Track Suit", "Clothing", 99.99, 25);
                
                
CREATE TABLE departments (
	department_id INT NOT NULL AUTO_INCREMENT,
    PRIMARY KEY (department_id),
    department_name VARCHAR(50) NULL,
    over_head_costs DECIMAL (10,2),
    product_sales DECIMAL(13,2) DEFAULT 0.00
);

INSERT INTO departments (department_name, over_head_costs)
VALUES 	( "Home", 1500.00),
                ("Electronics", 4500.00),
                ("Clothing", 1200.00);