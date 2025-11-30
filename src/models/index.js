const Merchant = require('./Merchant');
const Payment = require('./Payment');
const Refund = require('./Refund');
const SavedCard = require('./SavedCard');

// Define associations
Merchant.hasMany(Payment, { foreignKey: 'merchant_id', as: 'payments' });
Payment.belongsTo(Merchant, { foreignKey: 'merchant_id', as: 'merchant' });

Payment.hasMany(Refund, { foreignKey: 'payment_id', as: 'refunds' });
Refund.belongsTo(Payment, { foreignKey: 'payment_id', as: 'payment' });

Merchant.hasMany(SavedCard, { foreignKey: 'merchant_id', as: 'saved_cards' });
SavedCard.belongsTo(Merchant, { foreignKey: 'merchant_id', as: 'merchant' });

module.exports = {
  Merchant,
  Payment,
  Refund,
  SavedCard
};