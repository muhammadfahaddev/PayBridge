require('dotenv').config();
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const sequelize = require('../config/database');

async function migrateApiKeys() {
  try {
    console.log('🔄 Migrating API keys...\n');
    
    // Check if api_key column exists
    const [columns] = await sequelize.query(`
      SHOW COLUMNS FROM merchants LIKE 'api_key'
    `);
    
    // Add api_key column if not exists
    if (columns.length === 0) {
      await sequelize.query(`
        ALTER TABLE merchants 
        ADD COLUMN api_key VARCHAR(255) NULL
      `);
      console.log('✅ Column added\n');
    } else {
      console.log('✅ Column already exists\n');
    }
    
    // Get all merchants without api_key
    const [merchants] = await sequelize.query(`
      SELECT id, email, api_key_hash 
      FROM merchants 
      WHERE api_key IS NULL OR api_key = ''
    `);
    
    console.log(`Found ${merchants.length} merchants to update\n`);
    
    // Update each merchant
    for (const merchant of merchants) {
      const newApiKey = `pb_live_${uuidv4().replace(/-/g, '')}`;
      const salt = await bcrypt.genSalt(12);
      const hashedApiKey = await bcrypt.hash(newApiKey, salt);
      
      await sequelize.query(`
        UPDATE merchants 
        SET api_key = ?, api_key_hash = ?
        WHERE id = ?
      `, {
        replacements: [newApiKey, hashedApiKey, merchant.id]
      });
      
      console.log(`✅ Updated: ${merchant.email}`);
      console.log(`   API Key: ${newApiKey}\n`);
    }
    
    // Make api_key NOT NULL and UNIQUE
    await sequelize.query(`
      ALTER TABLE merchants 
      MODIFY COLUMN api_key VARCHAR(255) NOT NULL UNIQUE
    `);
    
    console.log('🎉 Migration completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  }
}

migrateApiKeys();