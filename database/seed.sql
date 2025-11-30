-- PayBridge Sample Data
-- Insert test data for development

USE paybridge;

-- Sample merchant (password: 'password123')
INSERT INTO merchants (id, name, email, password, api_key_hash, is_active) VALUES 
('550e8400-e29b-41d4-a716-446655440000', 'Test Shop', 'test@example.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/VcSAg/9qm', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/VcSAg/9qm', TRUE);

-- Note: In real application, use the API to create merchants
-- This will properly hash passwords and generate API keys

SELECT 'Sample data inserted successfully' as message;