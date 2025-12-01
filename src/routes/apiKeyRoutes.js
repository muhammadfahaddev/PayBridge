const express = require('express');
const apiKeyController = require('../controllers/apiKeyController');
const { authenticateJWT } = require('../middleware/auth');
const { body } = require('express-validator');

const router = express.Router();

// All routes require JWT authentication
router.use(authenticateJWT);

// Get API key info
router.get('/info', apiKeyController.getApiKeyInfo);

// Regenerate API key
router.post('/regenerate', [
  body('password')
    .notEmpty()
    .withMessage('Password is required')
], apiKeyController.regenerateApiKey);

module.exports = router;