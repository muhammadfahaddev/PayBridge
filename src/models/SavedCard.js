const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const { v4: uuidv4 } = require('uuid');

const SavedCard = sequelize.define('saved_cards', {
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
  payment_method_id: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  card_brand: {
    type: DataTypes.STRING(20),
    allowNull: false
  },
  card_last4: {
    type: DataTypes.STRING(4),
    allowNull: false
  },
  exp_month: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  exp_year: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  is_test_card: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
});

module.exports = SavedCard;