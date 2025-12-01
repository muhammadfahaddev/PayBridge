require('dotenv').config();
const sequelize = require('../config/database');

async function fixSavedCards() {
  try {
    console.log('🔄 Fixing saved_cards table...\n');
    
    // Drop unique constraint on payment_method_id
    await sequelize.query(`
      ALTER TABLE saved_cards 
      DROP INDEX payment_method_id
    `);
    
    console.log('✅ Unique constraint removed from payment_method_id\n');
    console.log('🎉 Fix completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('❌ Fix failed:', error.message);
    process.exit(1);
  }
}

fixSavedCards();
