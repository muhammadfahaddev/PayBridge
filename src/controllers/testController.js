const stripe = require('../config/stripe');
const { Payment } = require('../models');

class TestController {
  async confirmTestPayment(req, res, next) {
    try {
      const { payment_id } = req.body;

      // Get payment from database
      const payment = await Payment.findOne({
        where: {
          id: payment_id,
          merchant_id: req.merchant.id
        }
      });

      if (!payment) {
        return res.status(404).json({
          success: false,
          message: 'Payment not found'
        });
      }

      // If payment is already succeeded, return existing details (idempotent)
      if (payment.status === 'succeeded') {
        return res.json({
          success: true,
          message: 'Test payment confirmed with Visa test card',
          data: {
            payment_id: payment.id,
            stripe_payment_intent_id: payment.stripe_payment_intent_id,
            status: payment.status,
            amount: payment.amount,
            currency: payment.currency,
            test_card: 'Visa 4242'
          }
        });
      }

      // Confirm payment with test card (Visa success)
      const paymentIntent = await stripe.paymentIntents.confirm(payment.stripe_payment_intent_id, {
        payment_method: 'pm_card_visa', // Stripe test payment method
        return_url: process.env.PAYMENT_RETURN_URL || 'http://localhost:3000/payment/return'
      });

      // Update payment status in database
      await payment.update({
        status: paymentIntent.status
      });

      res.json({
        success: true,
        message: 'Test payment confirmed with Visa test card',
        data: {
          payment_id: payment.id,
          stripe_payment_intent_id: paymentIntent.id,
          status: paymentIntent.status,
          amount: payment.amount,
          currency: payment.currency,
          test_card: 'Visa 4242'
        }
      });
    } catch (error) {
      next(error);
    }
  }

  async confirmTestPaymentMastercard(req, res, next) {
    try {
      const { payment_id } = req.body;

      const payment = await Payment.findOne({
        where: {
          id: payment_id,
          merchant_id: req.merchant.id
        }
      });

      if (!payment) {
        return res.status(404).json({
          success: false,
          message: 'Payment not found'
        });
      }

      // If payment is already succeeded, return existing details (idempotent)
      if (payment.status === 'succeeded') {
        return res.json({
          success: true,
          message: 'Test payment confirmed with Mastercard test card',
          data: {
            payment_id: payment.id,
            stripe_payment_intent_id: payment.stripe_payment_intent_id,
            status: payment.status,
            amount: payment.amount,
            currency: payment.currency,
            test_card: 'Mastercard 5555'
          }
        });
      }

      // Confirm with Mastercard test
      const paymentIntent = await stripe.paymentIntents.confirm(payment.stripe_payment_intent_id, {
        payment_method: 'pm_card_mastercard',
        return_url: process.env.PAYMENT_RETURN_URL || 'http://localhost:3000/payment/return'
      });

      await payment.update({
        status: paymentIntent.status
      });

      res.json({
        success: true,
        message: 'Test payment confirmed with Mastercard test card',
        data: {
          payment_id: payment.id,
          stripe_payment_intent_id: paymentIntent.id,
          status: paymentIntent.status,
          amount: payment.amount,
          currency: payment.currency,
          test_card: 'Mastercard 5555'
        }
      });
    } catch (error) {
      next(error);
    }
  }

  async confirmTestPaymentDeclined(req, res, next) {
    try {
      const { payment_id } = req.body;

      const payment = await Payment.findOne({
        where: {
          id: payment_id,
          merchant_id: req.merchant.id
        }
      });

      if (!payment) {
        return res.status(404).json({
          success: false,
          message: 'Payment not found'
        });
      }

      // If payment is already succeeded, return existing details (idempotent)
      if (payment.status === 'succeeded') {
        return res.json({
          success: true,
          message: 'Test payment confirmed (already processed)',
          data: {
            payment_id: payment.id,
            stripe_payment_intent_id: payment.stripe_payment_intent_id,
            status: payment.status,
            amount: payment.amount,
            currency: payment.currency,
            test_card: 'Previously Confirmed'
          }
        });
      }

      // Test declined payment
      const paymentIntent = await stripe.paymentIntents.confirm(payment.stripe_payment_intent_id, {
        payment_method: 'pm_card_chargeDeclined',
        return_url: process.env.PAYMENT_RETURN_URL || 'http://localhost:3000/payment/return'
      });

      await payment.update({
        status: paymentIntent.status
      });

      res.json({
        success: true,
        message: 'Test payment declined (for testing)',
        data: {
          payment_id: payment.id,
          stripe_payment_intent_id: paymentIntent.id,
          status: paymentIntent.status,
          amount: payment.amount,
          currency: payment.currency,
          test_card: 'Declined Card'
        }
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new TestController();