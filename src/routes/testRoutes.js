const express = require('express');
const testController = require('../controllers/testController');
const { authenticateApiKey } = require('../middleware/auth');
const { validateUUIDParam } = require('../middleware/validation');
const { body } = require('express-validator');

const router = express.Router();

// Only enable in development
if (process.env.NODE_ENV === 'development') {
  
  // All test routes require API key authentication
  router.use(authenticateApiKey);

  // Test payment confirmation routes
  router.post('/confirm-visa', [
    body('payment_id').isUUID().withMessage('Valid payment ID required')
  ], testController.confirmTestPayment);

  router.post('/confirm-mastercard', [
    body('payment_id').isUUID().withMessage('Valid payment ID required')
  ], testController.confirmTestPaymentMastercard);

  router.post('/confirm-declined', [
    body('payment_id').isUUID().withMessage('Valid payment ID required')
  ], testController.confirmTestPaymentDeclined);

} else {
  // Production - disable test routes
  router.use((req, res) => {
    res.status(404).json({
      success: false,
      message: 'Test routes not available in production'
    });
  });
}

module.exports = router;