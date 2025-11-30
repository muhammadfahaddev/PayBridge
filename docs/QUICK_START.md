# PayBridge - Quick Start Guide

## For Third-Party Developers

### 5-Minute Integration

**Step 1: Get API Key (1 min)**
```bash
curl -X POST https://api.paybridge.com/api/v1/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "name": "My Business",
    "email": "you@example.com",
    "password": "secure_pass_123"
  }'

# Save the api_key from response
```

**Step 2: Create Payment (2 min)**
```javascript
const response = await fetch('https://api.paybridge.com/api/v1/payments/create', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    amount: 1500,        // PKR 15.00
    currency: 'PKR',
    order_id: 'ORD-001'
  })
});

const payment = await response.json();
// Save payment.data.payment_id
```

**Step 3: Confirm Payment (2 min)**
```javascript
const result = await fetch('https://api.paybridge.com/api/v1/cards/confirm-with-card', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    payment_id: payment.data.payment_id,
    card_number: '4242424242424242',  // Test card
    exp_month: 12,
    exp_year: 2025,
    cvc: '123',
    cardholder_name: 'Test User'
  })
});

const confirmation = await result.json();
if (confirmation.data.status === 'succeeded') {
  console.log('✅ Payment successful!');
}
```

---

## Complete Integration Example

### E-commerce Checkout Page

**HTML:**
```html
<!DOCTYPE html>
<html>
<head>
  <title>Checkout - PayBridge Demo</title>
  <style>
    .checkout-form {
      max-width: 400px;
      margin: 50px auto;
      padding: 20px;
      border: 1px solid #ddd;
      border-radius: 8px;
    }
    .form-group {
      margin-bottom: 15px;
    }
    label {
      display: block;
      margin-bottom: 5px;
      font-weight: bold;
    }
    input {
      width: 100%;
      padding: 8px;
      border: 1px solid #ccc;
      border-radius: 4px;
    }
    button {
      width: 100%;
      padding: 12px;
      background: #007bff;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 16px;
    }
    button:disabled {
      background: #ccc;
      cursor: not-allowed;
    }
    .success {
      color: green;
      font-weight: bold;
    }
    .error {
      color: red;
    }
  </style>
</head>
<body>
  <div class="checkout-form">
    <h2>Checkout</h2>
    <p>Total: <strong>PKR 1,500</strong></p>
    
    <form id="paymentForm">
      <div class="form-group">
        <label>Card Number</label>
        <input type="text" id="cardNumber" placeholder="4242 4242 4242 4242" maxlength="16" required>
      </div>
      
      <div class="form-group">
        <label>Cardholder Name</label>
        <input type="text" id="cardholderName" placeholder="John Doe" required>
      </div>
      
      <div style="display: flex; gap: 10px;">
        <div class="form-group" style="flex: 1;">
          <label>Expiry Month</label>
          <input type="text" id="expMonth" placeholder="12" maxlength="2" required>
        </div>
        <div class="form-group" style="flex: 1;">
          <label>Expiry Year</label>
          <input type="text" id="expYear" placeholder="2025" maxlength="4" required>
        </div>
        <div class="form-group" style="flex: 1;">
          <label>CVC</label>
          <input type="text" id="cvc" placeholder="123" maxlength="3" required>
        </div>
      </div>
      
      <button type="submit" id="payButton">Pay PKR 1,500</button>
    </form>
    
    <div id="message" style="margin-top: 15px;"></div>
  </div>

  <script src="checkout.js"></script>
</body>
</html>
```

**JavaScript (checkout.js):**
```javascript
const API_KEY = 'pb_live_your_api_key_here';
const API_BASE = 'https://api.paybridge.com/api/v1';

// Get form elements
const form = document.getElementById('paymentForm');
const payButton = document.getElementById('payButton');
const message = document.getElementById('message');

// Handle form submission
form.addEventListener('submit', async (e) => {
  e.preventDefault();
  
  // Disable button
  payButton.disabled = true;
  payButton.textContent = 'Processing...';
  message.textContent = '';
  
  try {
    // Step 1: Create payment
    const paymentResponse = await fetch(`${API_BASE}/payments/create`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        amount: 1500,
        currency: 'PKR',
        order_id: 'ORD-' + Date.now(),
        metadata: {
          customer_email: 'customer@example.com',
          product: 'Premium Plan'
        }
      })
    });
    
    const paymentData = await paymentResponse.json();
    
    if (!paymentData.success) {
      throw new Error(paymentData.message);
    }
    
    const paymentId = paymentData.data.payment_id;
    
    // Step 2: Confirm payment
    const confirmResponse = await fetch(`${API_BASE}/cards/confirm-with-card`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        payment_id: paymentId,
        card_number: document.getElementById('cardNumber').value.replace(/\s/g, ''),
        exp_month: parseInt(document.getElementById('expMonth').value),
        exp_year: parseInt(document.getElementById('expYear').value),
        cvc: document.getElementById('cvc').value,
        cardholder_name: document.getElementById('cardholderName').value
      })
    });
    
    const confirmData = await confirmResponse.json();
    
    if (confirmData.success && confirmData.data.status === 'succeeded') {
      message.innerHTML = '<div class="success">✅ Payment successful!</div>';
      message.innerHTML += `<p>Payment ID: ${paymentId}</p>`;
      
      // Redirect to success page
      setTimeout(() => {
        window.location.href = '/success.html?payment_id=' + paymentId;
      }, 2000);
    } else {
      throw new Error(confirmData.message || 'Payment failed');
    }
    
  } catch (error) {
    message.innerHTML = `<div class="error">❌ ${error.message}</div>`;
    payButton.disabled = false;
    payButton.textContent = 'Pay PKR 1,500';
  }
});

// Format card number as user types
document.getElementById('cardNumber').addEventListener('input', (e) => {
  let value = e.target.value.replace(/\s/g, '');
  if (value.length > 16) {
    value = value.slice(0, 16);
  }
  e.target.value = value;
});
```

---

## Test Cards

| Card Number | Brand | Result |
|-------------|-------|--------|
| 4242424242424242 | Visa | ✅ Success |
| 5555555555554444 | Mastercard | ✅ Success |
| 378282246310005 | Amex | ✅ Success |

**Use with any:**
- Future expiry date (e.g., 12/2025)
- Any 3-digit CVC (e.g., 123)
- Any name (e.g., John Doe)

---

## Common Integration Patterns

### Pattern 1: Simple Checkout
```
User clicks "Buy Now"
    ↓
Create payment with amount
    ↓
Show payment form
    ↓
Confirm payment with card
    ↓
Show success/failure
```

### Pattern 2: Subscription
```
User selects plan
    ↓
Create recurring payment
    ↓
Save payment method
    ↓
Charge monthly automatically
```

### Pattern 3: Cart Checkout
```
User adds items to cart
    ↓
Calculate total amount
    ↓
Create payment for total
    ↓
Show checkout form
    ↓
Confirm payment
    ↓
Create order in your system
```

---

## Error Handling

**Always handle these scenarios:**

```javascript
try {
  const result = await createPayment(...);
  
  if (!result.success) {
    // API returned error
    console.error('API Error:', result.message);
    showErrorToUser(result.message);
    return;
  }
  
  // Success
  processPayment(result.data);
  
} catch (error) {
  // Network error or exception
  console.error('Network Error:', error);
  showErrorToUser('Unable to connect. Please try again.');
}
```

**Common Errors:**
- `401 Unauthorized` - Invalid API key
- `400 Bad Request` - Invalid parameters
- `404 Not Found` - Payment doesn't exist
- `429 Too Many Requests` - Rate limit exceeded

---

## Security Checklist

✅ **Use HTTPS only**
✅ **Store API key securely** (environment variables)
✅ **Never expose API key** in frontend code
✅ **Validate amounts** before creating payments
✅ **Implement CSRF protection** on your forms
✅ **Use prepared statements** when storing in database
✅ **Log payment IDs** for audit trail

---

## Production Checklist

Before going live:

- [ ] Replace test API key with live API key
- [ ] Test with real small amount (e.g., PKR 10)
- [ ] Set up error monitoring (Sentry, etc.)
- [ ] Enable HTTPS on your website
- [ ] Test refund flow
- [ ] Set up backup API key (for rotation)
- [ ] Document payment flow for your team
- [ ] Add payment confirmation emails
- [ ] Set up transaction monitoring
- [ ] Test edge cases (timeout, network errors)

---

## Need Help?

**Documentation:** Full docs at `/docs/API_DOCUMENTATION.md`
**Postman Collection:** Import from `/postman/` directory
**Support:** Create issue on GitHub
**Examples:** See `/docs/examples/` directory

---

## Next Steps

1. **Get API key** - Sign up at dashboard
2. **Test integration** - Use this guide
3. **Review full docs** - API_DOCUMENTATION.md
4. **Deploy to production** - Use production API key
5. **Monitor payments** - Check dashboard regularly

Happy integrating! 🚀
