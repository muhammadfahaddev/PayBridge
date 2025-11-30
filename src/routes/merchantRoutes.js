const express = require('express');
const authController = require('../controllers/authController');
const { validateSignup } = require('../middleware/validation');

const router = express.Router();

// Legacy merchant signup route (for backward compatibility)
router.post('/signup', validateSignup, authController.signup);

module.exports = router;