const express = require('express');
const refundController = require('../controllers/refundController');
const { authenticateApiKey } = require('../middleware/auth');
const { validateCreateRefund } = require('../middleware/validation');

const router = express.Router();

// All refund routes require API key authentication
router.use(authenticateApiKey);

// Refund routes
router.post('/create', validateCreateRefund, refundController.createRefund);

module.exports = router;