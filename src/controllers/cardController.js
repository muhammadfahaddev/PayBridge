const PaymentService = require('../services/PaymentService');

class CardController {
  // Create payment method with card details
  async createPaymentMethod(req, res, next) {
    try {
      const { card_number, exp_month, exp_year, cvc } = req.body;
      const merchantId = req.merchant.id;

      const paymentMethod = await PaymentService.createPaymentMethod(merchantId, card_number, exp_month, exp_year, cvc);

      res.json({
        success: true,
        message: paymentMethod.test_card ? 'Test payment method saved successfully' : 'Payment method created successfully',
        data: paymentMethod
      });
    } catch (error) {
      next(error);
    }
  }

  // Confirm payment with card
  async confirmPaymentWithCard(req, res, next) {
    try {
      const { payment_id, card_number, exp_month, exp_year, cvc } = req.body;
      const merchantId = req.merchant.id;

      const payment = await PaymentService.confirmPaymentWithCard(payment_id, merchantId, card_number, exp_month, exp_year, cvc);

      res.json({
        success: true,
        message: 'Payment confirmed successfully with card',
        data: payment
      });
    } catch (error) {
      next(error);
    }
  }

  // Confirm payment with existing payment method
  async confirmPaymentWithMethod(req, res, next) {
    try {
      const { payment_id, payment_method_id } = req.body;
      const merchantId = req.merchant.id;

      const payment = await PaymentService.confirmPaymentWithMethod(payment_id, merchantId, payment_method_id);

      res.json({
        success: true,
        message: 'Payment confirmed successfully',
        data: payment
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new CardController();