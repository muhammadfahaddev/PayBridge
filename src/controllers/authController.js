const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const { Merchant } = require('../models');

class AuthController {
  async signup(req, res, next) {
    try {
      const { name, email, password } = req.body;

      // Check if merchant already exists
      const existingMerchant = await Merchant.findOne({ where: { email } });
      if (existingMerchant) {
        return res.status(400).json({
          success: false,
          message: 'Merchant already exists with this email'
        });
      }

      // Hash password
      const salt = await bcrypt.genSalt(12);
      const hashedPassword = await bcrypt.hash(password, salt);
      
      // Generate and hash API key
      const apiKey = `pb_live_${uuidv4().replace(/-/g, '')}`;
      const apiKeySalt = await bcrypt.genSalt(12);
      const hashedApiKey = await bcrypt.hash(apiKey, apiKeySalt);

      // Create merchant
      const merchant = await Merchant.create({ 
        name, 
        email, 
        password: hashedPassword,
        api_key_hash: hashedApiKey
      });
      
      // Generate JWT token
      const token = jwt.sign(
        { id: merchant.id, email: merchant.email },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
      );

      res.status(201).json({
        success: true,
        message: 'Merchant created successfully',
        data: {
          merchant_id: merchant.id,
          name: merchant.name,
          email: merchant.email,
          api_key: apiKey,
          token
        }
      });
    } catch (error) {
      next(error);
    }
  }

  async login(req, res, next) {
    try {
      const { email, password } = req.body;

      // Find merchant
      const merchant = await Merchant.findOne({ where: { email } });
      if (!merchant) {
        return res.status(401).json({
          success: false,
          message: 'Invalid credentials'
        });
      }

      // Validate password
      const isValidPassword = await merchant.validatePassword(password);
      if (!isValidPassword) {
        return res.status(401).json({
          success: false,
          message: 'Invalid credentials'
        });
      }

      // Check if merchant is active
      if (!merchant.is_active) {
        return res.status(401).json({
          success: false,
          message: 'Account is inactive'
        });
      }

      // Generate JWT token
      const token = jwt.sign(
        { id: merchant.id, email: merchant.email },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
      );

      res.json({
        success: true,
        message: 'Login successful',
        data: {
          merchant_id: merchant.id,
          name: merchant.name,
          email: merchant.email,
          token
        }
      });
    } catch (error) {
      next(error);
    }
  }

  async getProfile(req, res, next) {
    try {
      const merchant = req.merchant;

      res.json({
        success: true,
        data: {
          merchant_id: merchant.id,
          name: merchant.name,
          email: merchant.email,
          is_active: merchant.is_active,
          created_at: merchant.created_at
        }
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new AuthController();