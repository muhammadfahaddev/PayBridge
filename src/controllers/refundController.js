const PaymentService = require('../services/PaymentService');

class RefundController {
  async createRefund(req, res, next) {
    try {
      const merchantId = req.merchant.id;
      const { payment_id, amount, reason } = req.body;

      const refund = await PaymentService.createRefund(payment_id, merchantId, {
        amount,
        reason
      });

      res.status(201).json({
        success: true,
        message: 'Refund created successfully',
        data: refund
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new RefundController();