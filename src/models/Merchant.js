const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

const Merchant = sequelize.define('merchants', {
  id: {
    type: DataTypes.UUID,
    defaultValue: () => uuidv4(),
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false,
    validate: {
      notEmpty: true,
      len: [2, 100]
    }
  },
  email: {
    type: DataTypes.STRING(255),
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true
    }
  },
  password: {
    type: DataTypes.STRING(255),
    allowNull: false,
    validate: {
      len: [6, 255]
    }
  },
  api_key: {
    type: DataTypes.STRING(255),
    allowNull: false,
    unique: true
  },
  api_key_hash: {
    type: DataTypes.STRING(255),
    allowNull: false,
    unique: true
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
});

// Instance methods
Merchant.prototype.validatePassword = async function(password) {
  return bcrypt.compare(password, this.password);
};

Merchant.prototype.validateApiKey = async function(apiKey) {
  return bcrypt.compare(apiKey, this.api_key_hash);
};

module.exports = Merchant;