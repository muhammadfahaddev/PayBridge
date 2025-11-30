const jwt = require('jsonwebtoken');
const { Merchant } = require('../models');

// JWT Authentication
const authenticateJWT = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Access token required'
      });
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    const merchant = await Merchant.findByPk(decoded.id);
    if (!merchant || !merchant.is_active) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token or merchant inactive'
      });
    }

    req.merchant = merchant;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Invalid token'
    });
  }
};

// API Key Authentication
const authenticateApiKey = async (req, res, next) => {
  try {
    const apiKey = req.headers['x-api-key'] || req.headers['authorization']?.replace('Bearer ', '');
    
    console.log('Received API Key:', apiKey); // Debug log
    
    if (!apiKey) {
      return res.status(401).json({
        success: false,
        message: 'API key required'
      });
    }

    const merchants = await Merchant.findAll({ where: { is_active: true } });
    let authenticatedMerchant = null;

    for (const merchant of merchants) {
      console.log('Checking merchant:', merchant.email); // Debug log
      if (await merchant.validateApiKey(apiKey)) {
        authenticatedMerchant = merchant;
        console.log('API key matched for:', merchant.email); // Debug log
        break;
      }
    }

    if (!authenticatedMerchant) {
      console.log('No merchant found for API key'); // Debug log
      return res.status(401).json({
        success: false,
        message: 'Invalid API key'
      });
    }

    req.merchant = authenticatedMerchant;
    next();
  } catch (error) {
    console.error('Auth error:', error); // Debug log
    return res.status(401).json({
      success: false,
      message: 'Authentication failed'
    });
  }
};

module.exports = {
  authenticateJWT,
  authenticateApiKey
};