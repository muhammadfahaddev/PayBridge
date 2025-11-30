const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const { v4: uuidv4 } = require('uuid');

const Payment = sequelize.define('payments', {
  id: {
    type: DataTypes.UUID,
    defaultValue: () => uuidv4(),
    primaryKey: true
  },
  merchant_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'merchants',
      key: 'id'
    }
  },
  order_id: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  stripe_payment_intent_id: {
    type: DataTypes.STRING(255),
    allowNull: false,
    unique: true
  },
  client_secret: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  amount: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 1
    }
  },
  currency: {
    type: DataTypes.STRING(3),
    allowNull: false,
    defaultValue: 'PKR',
    validate: {
      isIn: [['PKR', 'USD', 'EUR', 'GBP']]
    }
  },
  status: {
    type: DataTypes.ENUM(
      'requires_payment_method',
      'requires_confirmation',
      'requires_action',
      'processing',
      'requires_capture',
      'canceled',
      'succeeded'
    ),
    defaultValue: 'requires_payment_method'
  },
  metadata: {
    type: DataTypes.JSON,
    defaultValue: {}
  }
});

module.exports = Payment;