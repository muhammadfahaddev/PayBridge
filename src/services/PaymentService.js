const stripe = require('../config/stripe');
const { Payment, Refund, SavedCard } = require('../models');

class PaymentService {
  async createPayment(merchantId, { amount, currency = 'PKR', order_id, metadata = {} }) {
    try {
      // Create Stripe PaymentIntent
      const paymentIntent = await stripe.paymentIntents.create({
        amount,
        currency: currency.toLowerCase(),
        payment_method_types: ['card'],
        metadata: {
          merchant_id: merchantId,
          order_id,
          ...metadata
        }
      });

      // Save to database
      const payment = await Payment.create({
        merchant_id: merchantId,
        order_id,
        stripe_payment_intent_id: paymentIntent.id,
        client_secret: paymentIntent.client_secret,
        amount,
        currency: currency.toUpperCase(),
        status: paymentIntent.status,
        metadata
      });

      return {
        payment_id: payment.id,
        client_secret: paymentIntent.client_secret,
        stripe_payment_intent_id: paymentIntent.id,
        amount,
        currency: currency.toUpperCase(),
        status: paymentIntent.status
      };
    } catch (error) {
      throw error;
    }
  }

  async confirmPayment(paymentId, stripePaymentIntentId) {
    try {
      // Retrieve payment from Stripe to verify status
      const paymentIntent = await stripe.paymentIntents.retrieve(stripePaymentIntentId);

      // Update payment in database
      const payment = await Payment.findByPk(paymentId);
      if (!payment) {
        throw new Error('Payment not found');
      }

      if (payment.stripe_payment_intent_id !== stripePaymentIntentId) {
        throw new Error('Payment intent ID mismatch');
      }

      await payment.update({
        status: paymentIntent.status
      });

      return {
        payment_id: paymentId,
        status: paymentIntent.status,
        amount: payment.amount,
        currency: payment.currency
      };
    } catch (error) {
      throw error;
    }
  }

  async getPayment(paymentId, merchantId) {
    try {
      const payment = await Payment.findOne({
        where: {
          id: paymentId,
          merchant_id: merchantId
        },
        include: [{
          model: Refund,
          as: 'refunds'
        }]
      });

      if (!payment) {
        throw new Error('Payment not found');
      }

      return payment;
    } catch (error) {
      throw error;
    }
  }

  async getPayments(merchantId, { page = 1, limit = 10, status, order_id } = {}) {
    try {
      const offset = (page - 1) * limit;
      const where = { merchant_id: merchantId };

      if (status) where.status = status;
      if (order_id) where.order_id = order_id;

      const { rows: payments, count } = await Payment.findAndCountAll({
        where,
        limit: parseInt(limit),
        offset,
        order: [['created_at', 'DESC']],
        include: [{
          model: Refund,
          as: 'refunds'
        }]
      });

      return {
        payments,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: count,
          pages: Math.ceil(count / limit)
        }
      };
    } catch (error) {
      throw error;
    }
  }

  async createPaymentMethod(merchantId, cardNumber, expMonth, expYear, cvc) {
    try {
      // Only allow test cards for security
      const testTokens = {
        '4242424242424242': 'pm_card_visa',
        '5555555555554444': 'pm_card_mastercard',
        '378282246310005': 'pm_card_amex'
      };

      if (testTokens[cardNumber]) {
        const cardBrand = cardNumber.startsWith('4') ? 'visa' : cardNumber.startsWith('5') ? 'mastercard' : 'amex';
        const cardLast4 = cardNumber.slice(-4);
        const paymentMethodId = testTokens[cardNumber];

        // Check if card already exists for this merchant
        let savedCard = await SavedCard.findOne({
          where: {
            merchant_id: merchantId,
            payment_method_id: paymentMethodId
          }
        });

        if (!savedCard) {
          // Save card to database
          savedCard = await SavedCard.create({
            merchant_id: merchantId,
            payment_method_id: paymentMethodId,
            card_brand: cardBrand,
            card_last4: cardLast4,
            exp_month: expMonth,
            exp_year: expYear,
            is_test_card: true
          });
        }

        return {
          card_id: savedCard.id,
          merchant_id: merchantId,
          payment_method_id: paymentMethodId,
          card_brand: cardBrand,
          card_last4: cardLast4,
          exp_month: expMonth,
          exp_year: expYear,
          test_card: true
        };
      }

      // Return helpful error for invalid test cards
      const error = new Error('Invalid test card number');
      error.statusCode = 400;
      error.details = {
        allowed_cards: [
          { number: '4242424242424242', brand: 'Visa', description: 'Test card - always succeeds' },
          { number: '5555555555554444', brand: 'Mastercard', description: 'Test card - always succeeds' },
          { number: '378282246310005', brand: 'Amex', description: 'Test card - always succeeds' }
        ],
        note: 'For real cards, use Stripe.js on frontend'
      };
      throw error;
    } catch (error) {
      throw error;
    }
  }

  async confirmPaymentWithCard(paymentId, merchantId, cardNumber, expMonth, expYear, cvc) {
    try {
      // Get payment from database
      const payment = await Payment.findOne({
        where: {
          id: paymentId,
          merchant_id: merchantId
        }
      });

      if (!payment) {
        throw new Error('Payment not found');
      }

      // If payment is already succeeded, return the existing payment details (idempotent)
      if (payment.status === 'succeeded') {
        // Get saved card details
        const testTokens = {
          '4242424242424242': 'pm_card_visa',
          '5555555555554444': 'pm_card_mastercard',
          '378282246310005': 'pm_card_amex'
        };

        const paymentMethodId = testTokens[cardNumber];
        const cardBrand = cardNumber.startsWith('4') ? 'visa' : cardNumber.startsWith('5') ? 'mastercard' : 'amex';
        const cardLast4 = cardNumber.slice(-4);

        let savedCard = await SavedCard.findOne({
          where: {
            merchant_id: merchantId,
            payment_method_id: paymentMethodId
          }
        });

        return {
          payment_id: paymentId,
          merchant_id: merchantId,
          stripe_payment_intent_id: payment.stripe_payment_intent_id,
          status: payment.status,
          amount: payment.amount,
          currency: payment.currency,
          order_id: payment.order_id,
          card_id: savedCard?.id,
          card_brand: cardBrand,
          card_last4: cardLast4
        };
      }

      // Check if payment is in a non-confirmable state
      if (['canceled', 'processing'].includes(payment.status)) {
        const error = new Error(`Cannot confirm payment with status: ${payment.status}`);
        error.statusCode = 400;
        error.details = {
          payment_id: paymentId,
          status: payment.status,
          message: payment.status === 'canceled'
            ? 'This payment has been canceled. Create a new payment to try again.'
            : 'This payment is currently being processed. Please wait for the current process to complete.'
        };
        throw error;
      }

      let paymentMethodId;
      let cardBrand;
      let cardLast4;

      // First try test tokens for known test cards
      const testTokens = {
        '4242424242424242': 'pm_card_visa',
        '5555555555554444': 'pm_card_mastercard',
        '378282246310005': 'pm_card_amex'
      };

      if (testTokens[cardNumber]) {
        paymentMethodId = testTokens[cardNumber];
        cardBrand = cardNumber.startsWith('4') ? 'visa' : cardNumber.startsWith('5') ? 'mastercard' : 'amex';
        cardLast4 = cardNumber.slice(-4);
      } else {
        const error = new Error('Invalid test card number');
        error.statusCode = 400;
        error.details = {
          allowed_cards: [
            { number: '4242424242424242', brand: 'Visa' },
            { number: '5555555555554444', brand: 'Mastercard' },
            { number: '378282246310005', brand: 'Amex' }
          ]
        };
        throw error;
      }

      // Confirm payment intent
      const paymentIntent = await stripe.paymentIntents.confirm(payment.stripe_payment_intent_id, {
        payment_method: paymentMethodId,
        return_url: process.env.PAYMENT_RETURN_URL || 'http://localhost:3000/payment/return'
      });

      // Update payment status in database
      await payment.update({
        status: paymentIntent.status
      });

      // Save card details if not already saved
      let savedCard = await SavedCard.findOne({
        where: {
          merchant_id: merchantId,
          payment_method_id: paymentMethodId
        }
      });

      if (!savedCard) {
        savedCard = await SavedCard.create({
          merchant_id: merchantId,
          payment_method_id: paymentMethodId,
          card_brand: cardBrand,
          card_last4: cardLast4,
          exp_month: expMonth,
          exp_year: expYear,
          is_test_card: testTokens[cardNumber] ? true : false
        });
      }

      return {
        payment_id: paymentId,
        merchant_id: merchantId,
        stripe_payment_intent_id: paymentIntent.id,
        status: paymentIntent.status,
        amount: payment.amount,
        currency: payment.currency,
        order_id: payment.order_id,
        card_id: savedCard.id,
        card_brand: cardBrand,
        card_last4: cardLast4
      };
    } catch (error) {
      throw error;
    }
  }

  async confirmPaymentWithMethod(paymentId, merchantId, paymentMethodId) {
    try {
      // Get payment from database
      const payment = await Payment.findOne({
        where: {
          id: paymentId,
          merchant_id: merchantId
        }
      });

      if (!payment) {
        throw new Error('Payment not found');
      }

      // If payment is already succeeded, return the existing payment details (idempotent)
      if (payment.status === 'succeeded') {
        return {
          payment_id: paymentId,
          stripe_payment_intent_id: payment.stripe_payment_intent_id,
          status: payment.status,
          amount: payment.amount,
          currency: payment.currency
        };
      }

      // Check if payment is in a non-confirmable state
      if (['canceled', 'processing'].includes(payment.status)) {
        const error = new Error(`Cannot confirm payment with status: ${payment.status}`);
        error.statusCode = 400;
        error.details = {
          payment_id: paymentId,
          status: payment.status,
          message: payment.status === 'canceled'
            ? 'This payment has been canceled. Create a new payment to try again.'
            : 'This payment is currently being processed. Please wait for the current process to complete.'
        };
        throw error;
      }

      // Confirm payment intent with existing payment method
      const paymentIntent = await stripe.paymentIntents.confirm(payment.stripe_payment_intent_id, {
        payment_method: paymentMethodId,
        return_url: process.env.PAYMENT_RETURN_URL || 'http://localhost:3000/payment/return'
      });

      // Update payment status in database
      await payment.update({
        status: paymentIntent.status
      });

      return {
        payment_id: paymentId,
        stripe_payment_intent_id: paymentIntent.id,
        status: paymentIntent.status,
        amount: payment.amount,
        currency: payment.currency
      };
    } catch (error) {
      throw error;
    }
  }

  async createRefund(paymentId, merchantId, { amount, reason = 'requested_by_customer' } = {}) {
    try {
      // Get payment
      const payment = await Payment.findOne({
        where: {
          id: paymentId,
          merchant_id: merchantId
        }
      });

      if (!payment) {
        throw new Error('Payment not found');
      }

      if (payment.status !== 'succeeded') {
        throw new Error('Can only refund succeeded payments');
      }

      // Check if a full refund already exists (idempotent behavior)
      if (!amount) {
        // Full refund requested - check if one already exists
        const existingRefund = await Refund.findOne({
          where: {
            payment_id: paymentId,
            amount: payment.amount,
            status: 'succeeded'
          }
        });

        if (existingRefund) {
          // Return existing refund details instead of creating duplicate
          return {
            refund_id: existingRefund.id,
            stripe_refund_id: existingRefund.stripe_refund_id,
            amount: existingRefund.amount,
            status: existingRefund.status,
            reason: existingRefund.reason
          };
        }
      }

      // Create refund in Stripe
      const refundData = {
        payment_intent: payment.stripe_payment_intent_id
      };

      if (amount) {
        refundData.amount = amount;
      }

      const stripeRefund = await stripe.refunds.create(refundData);

      // Save refund to database
      const refund = await Refund.create({
        payment_id: paymentId,
        stripe_refund_id: stripeRefund.id,
        amount: stripeRefund.amount,
        status: stripeRefund.status,
        reason
      });

      return {
        refund_id: refund.id,
        stripe_refund_id: stripeRefund.id,
        amount: stripeRefund.amount,
        status: stripeRefund.status,
        reason
      };
    } catch (error) {
      throw error;
    }
  }
}

module.exports = new PaymentService();