// Pakistan Payment Gateway - PKR Only

const PKR_MINIMUM = 15000;    // 150 PKR (approx $0.50 USD equivalent)
const PKR_MAXIMUM = 50000000; // 500,000 PKR (practical limit)

class StripeValidation {
  static validateAmount(amount) {
    if (amount < PKR_MINIMUM) {
      return {
        valid: false,
        message: `Minimum amount is ${PKR_MINIMUM} paisa (PKR ${(PKR_MINIMUM/100).toFixed(2)})`
      };
    }
    
    if (amount > PKR_MAXIMUM) {
      return {
        valid: false,
        message: `Maximum amount is ${PKR_MAXIMUM} paisa (PKR ${(PKR_MAXIMUM/100).toFixed(2)})`
      };
    }
    
    return { valid: true };
  }
  
  static validateCurrency(currency) {
    if (currency !== 'PKR') {
      return {
        valid: false,
        message: 'Only PKR currency is supported for Pakistan payments'
      };
    }
    
    return { valid: true };
  }
  
  static getMinimumAmount() {
    return PKR_MINIMUM;
  }
  
  static getMaximumAmount() {
    return PKR_MAXIMUM;
  }
  
  static formatAmount(amount) {
    return `PKR ${(amount/100).toFixed(2)}`;
  }
  
  static formatPaisa(amount) {
    return `${amount} paisa`;
  }
}

module.exports = StripeValidation;