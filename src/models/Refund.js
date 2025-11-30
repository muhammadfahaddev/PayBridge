const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const { v4: uuidv4 } = require('uuid');

const Refund = sequelize.define('refunds', {
  id: {
    type: DataTypes.UUID,
    defaultValue: () => uuidv4(),
    primaryKey: true
  },
  payment_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'payments',
      key: 'id'
    }
  },
  stripe_refund_id: {
    type: DataTypes.STRING(255),
    allowNull: false,
    unique: true
  },
  amount: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 1
    }
  },
  status: {
    type: DataTypes.ENUM('pending', 'succeeded', 'failed', 'canceled'),
    defaultValue: 'pending'
  },
  reason: {
    type: DataTypes.STRING(255),
    defaultValue: 'requested_by_customer'
  }
});

module.exports = Refund;