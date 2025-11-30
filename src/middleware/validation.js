const { body, param, validationResult } = require('express-validator');

// Validation result handler
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }
  next();
};

// Auth validations
const validateSignup = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Valid email is required'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters'),
  handleValidationErrors
];

const validateLogin = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Valid email is required'),
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
  handleValidationErrors
];

// Payment validations
const validateCreatePayment = [
  body('amount')
    .isInt({ min: 1 })
    .withMessage('Amount must be a positive integer')
    .custom((value, { req }) => {
      const minAmount = 15000; // 150 PKR minimum (Stripe USD equivalent)
      if (value < minAmount) {
        throw new Error(`Minimum amount is ${minAmount} paisa (PKR ${minAmount/100})`);
      }
      return true;
    }),
  body('currency')
    .optional()
    .equals('PKR')
    .withMessage('Only PKR currency is supported'),
  body('order_id')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Order ID is required and must be less than 100 characters'),
  handleValidationErrors
];

const validateConfirmPayment = [
  body('stripe_payment_intent_id')
    .matches(/^pi_/)
    .withMessage('Valid Stripe payment intent ID is required'),
  handleValidationErrors
];

// Refund validations
const validateCreateRefund = [
  body('amount')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Amount must be a positive integer'),
  body('reason')
    .optional()
    .trim()
    .isLength({ max: 255 })
    .withMessage('Reason must be less than 255 characters'),
  handleValidationErrors
];

// Param validations
const validateUUIDParam = (paramName) => [
  param(paramName)
    .isUUID()
    .withMessage(`Valid ${paramName} is required`),
  handleValidationErrors
];

module.exports = {
  validateSignup,
  validateLogin,
  validateCreatePayment,
  validateConfirmPayment,
  validateCreateRefund,
  validateUUIDParam
};