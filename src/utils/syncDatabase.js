require('dotenv').config();
const sequelize = require('../config/database');
const { Merchant, Payment, Refund } = require('../models');

async function syncDatabase() {
  try {
    console.log('🔄 Starting database synchronization...');
    
    // Test connection
    await sequelize.authenticate();
    console.log('✅ Database connection established');
    
    // Sync all models
    await sequelize.sync({ force: false, alter: true });
    console.log('✅ Database models synchronized');
    
    console.log('🎉 Database sync completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('❌ Database sync failed:', error);
    process.exit(1);
  }
}

syncDatabase();