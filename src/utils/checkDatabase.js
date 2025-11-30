require('dotenv').config();
const { Merchant, Payment, Refund } = require('../models');

async function checkDatabase() {
  try {
    console.log('🔍 Checking database contents...\n');
    
    // Check merchants
    const merchants = await Merchant.findAll();
    console.log(`👥 Merchants: ${merchants.length}`);
    merchants.forEach(m => {
      console.log(`  - ${m.name} (${m.email}) - ID: ${m.id}`);
    });
    
    console.log('');
    
    // Check payments
    const payments = await Payment.findAll({
      include: [{
        model: Merchant,
        as: 'merchant',
        attributes: ['name', 'email']
      }]
    });
    
    console.log(`💳 Payments: ${payments.length}`);
    payments.forEach(p => {
      console.log(`  - Payment ID: ${p.id}`);
      console.log(`    Merchant: ${p.merchant?.name || 'Unknown'}`);
      console.log(`    Order ID: ${p.order_id}`);
      console.log(`    Amount: PKR ${p.amount/100}`);
      console.log(`    Status: ${p.status}`);
      console.log(`    Stripe PI: ${p.stripe_payment_intent_id}`);
      console.log(`    Created: ${p.created_at}`);
      console.log('');
    });
    
    // Check refunds
    const refunds = await Refund.findAll();
    console.log(`💰 Refunds: ${refunds.length}`);
    refunds.forEach(r => {
      console.log(`  - Refund ID: ${r.id}`);
      console.log(`    Payment ID: ${r.payment_id}`);
      console.log(`    Amount: PKR ${r.amount/100}`);
      console.log(`    Status: ${r.status}`);
      console.log('');
    });
    
    // Check saved cards
    const { SavedCard } = require('../models');
    const savedCards = await SavedCard.findAll();
    
    console.log(`💳 Saved Cards: ${savedCards.length}`);
    savedCards.forEach(c => {
      console.log(`  - Card ID: ${c.id}`);
      console.log(`    Merchant ID: ${c.merchant_id}`);
      console.log(`    Brand: ${c.card_brand}`);
      console.log(`    Last4: ${c.card_last4}`);
      console.log(`    Expiry: ${c.exp_month}/${c.exp_year}`);
      console.log(`    Test Card: ${c.is_test_card}`);
      console.log(`    Payment Method: ${c.payment_method_id}`);
      console.log('');
    });
    
  } catch (error) {
    console.error('❌ Database check failed:', error.message);
  }
}

// CLI usage
if (require.main === module) {
  checkDatabase().then(() => process.exit(0));
}

module.exports = { checkDatabase };