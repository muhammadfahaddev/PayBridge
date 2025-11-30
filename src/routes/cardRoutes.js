const express = require('express');
const cardController = require('../controllers/cardController');
const { authenticateApiKey } = require('../middleware/auth');
const { body } = require('express-validator');

const router = express.Router();

// All card routes require API key authentication
router.use(authenticateApiKey);

// Test card validation with helpful messages
const validateTestCard = [
  body('card_number')
    .trim()
    .custom((value) => {
      const testCards = ['4242424242424242', '5555555555554444', '378282246310005'];
      if (!testCards.includes(value)) {
        throw new Error('Only test cards allowed. Use: 4242424242424242 (Visa), 5555555555554444 (Mastercard), or 378282246310005 (Amex)');
      }
      return true;
    }),
  body('exp_month')
    .optional()
    .isInt({ min: 1, max: 12 })
    .withMessage('Valid expiry month required (1-12)'),
  body('exp_year')
    .optional()
    .isInt({ min: new Date().getFullYear(), max: new Date().getFullYear() + 20 })
    .withMessage('Valid expiry year required'),
  body('cvc')
    .optional()
    .isLength({ min: 3, max: 4 })
    .isNumeric()
    .withMessage('Valid CVC required (3-4 digits)'),
  (req, res, next) => {
    const errors = require('express-validator').validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Card validation failed',
        errors: errors.array(),
        hint: 'Use test cards: 4242424242424242 (Visa), 5555555555554444 (Mastercard), 378282246310005 (Amex)'
      });
    }
    next();
  }
];

const validatePaymentMethod = [
  body('payment_method_id')
    .matches(/^pm_/)
    .withMessage('Valid payment method ID required')
];

const validatePaymentId = [
  body('payment_id')
    .isUUID()
    .withMessage('Valid payment ID required')
];

// Create payment method with card details
router.post('/create-payment-method', validateTestCard, cardController.createPaymentMethod);

// Confirm payment with card details
router.post('/confirm-with-card', [
  ...validatePaymentId,
  ...validateTestCard
], cardController.confirmPaymentWithCard);

// Confirm payment with existing payment method
router.post('/confirm-with-method', [
  ...validatePaymentId,
  ...validatePaymentMethod
], cardController.confirmPaymentWithMethod);

module.exports = router;