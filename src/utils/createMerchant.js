require('dotenv').config();
const { Merchant } = require('../models');
const sequelize = require('../config/database');

async function createMerchant() {
  try {
    await sequelize.authenticate();
    
    const merchantData = {
      name: "Test Shop",
      email: "test@example.com",
      password: "password123"
    };
    
    const merchant = await Merchant.create(merchantData);
    
    console.log('✅ Merchant created successfully:');
    console.log('ID:', merchant.id);
    console.log('Name:', merchant.name);
    console.log('Email:', merchant.email);
    console.log('API Key:', merchant.plainApiKey);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

createMerchant();