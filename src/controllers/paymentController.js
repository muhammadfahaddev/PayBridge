const PaymentService = require('../services/PaymentService');
const StripeValidation = require('../utils/stripeValidation');

class PaymentController {
  async createPayment(req, res, next) {
    try {
      const merchantId = req.merchant.id;
      const { amount, currency = 'PKR', order_id, metadata } = req.body;

      // Additional Stripe validations
      const currencyValidation = StripeValidation.validateCurrency(currency);
      if (!currencyValidation.valid) {
        return res.status(400).json({
          success: false,
          message: currencyValidation.message
        });
      }

      const amountValidation = StripeValidation.validateAmount(amount);
      if (!amountValidation.valid) {
        return res.status(400).json({
          success: false,
          message: amountValidation.message,
          hint: `Try amount >= ${StripeValidation.getMinimumAmount()} (${StripeValidation.formatAmount(StripeValidation.getMinimumAmount())})`
        });
      }

      const payment = await PaymentService.createPayment(merchantId, {
        amount,
        currency,
        order_id,
        metadata
      });

      res.status(201).json({
        success: true,
        message: 'Payment created successfully',
        data: payment
      });
    } catch (error) {
      next(error);
    }
  }

  async confirmPayment(req, res, next) {
    try {
      const { payment_id, stripe_payment_intent_id } = req.body;

      const payment = await PaymentService.confirmPayment(payment_id, stripe_payment_intent_id);

      res.json({
        success: true,
        message: 'Payment confirmed successfully',
        data: payment
      });
    } catch (error) {
      next(error);
    }
  }

  async getPayment(req, res, next) {
    try {
      const { payment_id } = req.params;
      const merchantId = req.merchant.id;

      const payment = await PaymentService.getPayment(payment_id, merchantId);

      res.json({
        success: true,
        data: payment
      });
    } catch (error) {
      next(error);
    }
  }

  async getPayments(req, res, next) {
    try {
      const merchantId = req.merchant.id;
      const { page, limit, status, order_id } = req.query;

      const result = await PaymentService.getPayments(merchantId, {
        page,
        limit,
        status,
        order_id
      });

      res.json({
        success: true,
        data: result.payments,
        pagination: result.pagination
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new PaymentController();