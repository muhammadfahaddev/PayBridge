require('dotenv').config();
const sequelize = require('../config/database');
const { Merchant, Payment, Refund } = require('../models');

class DatabaseManager {
  // Test connection
  static async testConnection() {
    try {
      await sequelize.authenticate();
      console.log('✅ Database connection successful');
      return true;
    } catch (error) {
      console.error('❌ Database connection failed:', error.message);
      return false;
    }
  }

  // Sync all tables
  static async syncTables() {
    try {
      await sequelize.sync({ force: false, alter: true });
      console.log('✅ All tables synced successfully');
      return true;
    } catch (error) {
      console.error('❌ Table sync failed:', error.message);
      return false;
    }
  }

  // Drop all tables
  static async dropTables() {
    try {
      await sequelize.drop();
      console.log('✅ All tables dropped');
      return true;
    } catch (error) {
      console.error('❌ Drop tables failed:', error.message);
      return false;
    }
  }

  // Reset database
  static async resetDatabase() {
    try {
      await this.dropTables();
      await this.syncTables();
      console.log('✅ Database reset complete');
      return true;
    } catch (error) {
      console.error('❌ Database reset failed:', error.message);
      return false;
    }
  }

  // Get database stats
  static async getStats() {
    try {
      const merchantCount = await Merchant.count();
      const paymentCount = await Payment.count();
      const refundCount = await Refund.count();
      
      console.log('📊 Database Statistics:');
      console.log(`Merchants: ${merchantCount}`);
      console.log(`Payments: ${paymentCount}`);
      console.log(`Refunds: ${refundCount}`);
      
      return { merchantCount, paymentCount, refundCount };
    } catch (error) {
      console.error('❌ Stats failed:', error.message);
      return null;
    }
  }
}

// CLI usage
if (require.main === module) {
  const command = process.argv[2];
  
  switch (command) {
    case 'test':
      DatabaseManager.testConnection().then(() => process.exit(0));
      break;
    case 'sync':
      DatabaseManager.syncTables().then(() => process.exit(0));
      break;
    case 'drop':
      DatabaseManager.dropTables().then(() => process.exit(0));
      break;
    case 'reset':
      DatabaseManager.resetDatabase().then(() => process.exit(0));
      break;
    case 'stats':
      DatabaseManager.getStats().then(() => process.exit(0));
      break;
    default:
      console.log('Usage: node src/utils/dbManager.js [test|sync|drop|reset|stats]');
      process.exit(1);
  }
}

module.exports = DatabaseManager;