-- PayBridge Database Setup
-- Run this script in MySQL to create database and user

-- Create database
CREATE DATABASE IF NOT EXISTS paybridge CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Create user (optional - you can use root)
-- CREATE USER 'paybridge_user'@'localhost' IDENTIFIED BY 'your_password';
-- GRANT ALL PRIVILEGES ON paybridge.* TO 'paybridge_user'@'localhost';
-- FLUSH PRIVILEGES;

-- Use the database
USE paybridge;

-- Show created database
SHOW DATABASES LIKE 'paybridge';