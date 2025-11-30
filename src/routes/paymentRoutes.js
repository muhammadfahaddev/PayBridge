const express = require('express');
const paymentController = require('../controllers/paymentController');
const { authenticateApiKey } = require('../middleware/auth');
const { 
  validateCreatePayment, 
  validateConfirmPayment, 
  validateUUIDParam 
} = require('../middleware/validation');

const router = express.Router();

// All payment routes require API key authentication
router.use(authenticateApiKey);

// Payment routes
router.post('/create', validateCreatePayment, paymentController.createPayment);
router.post('/confirm', validateConfirmPayment, paymentController.confirmPayment);
router.get('/:payment_id', validateUUIDParam('payment_id'), paymentController.getPayment);
router.get('/', paymentController.getPayments);

module.exports = router;