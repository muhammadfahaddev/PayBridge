const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const { Merchant } = require('../models');

class ApiKeyController {
  async regenerateApiKey(req, res, next) {
    try {
      const merchantId = req.merchant.id;
      const { password } = req.body;

      // Verify password
      const merchant = await Merchant.findByPk(merchantId);
      const isValidPassword = await merchant.validatePassword(password);
      
      if (!isValidPassword) {
        return res.status(401).json({
          success: false,
          message: 'Invalid password'
        });
      }

      // Generate new API key
      const newApiKey = `pb_live_${uuidv4().replace(/-/g, '')}`;
      const salt = await bcrypt.genSalt(12);
      const hashedApiKey = await bcrypt.hash(newApiKey, salt);

      // Update merchant
      await merchant.update({
        api_key_hash: hashedApiKey
      });

      res.json({
        success: true,
        message: 'API key regenerated successfully',
        data: {
          api_key: newApiKey,
          warning: 'Save this key securely. It will not be shown again.'
        }
      });
    } catch (error) {
      next(error);
    }
  }

  async getApiKeyInfo(req, res, next) {
    try {
      const merchant = req.merchant;

      res.json({
        success: true,
        data: {
          merchant_id: merchant.id,
          api_key_hash: merchant.api_key_hash,
          note: 'Original API key cannot be retrieved. Use regenerate endpoint to create a new one.'
        }
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new ApiKeyController();