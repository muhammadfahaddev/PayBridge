# PayBridge - API Key Management Guide

## Overview

This document explains how API keys work in PayBridge and how to distribute them to third-party developers.

---

## Current System

### How API Keys Work

1. **Generation:** API key is automatically created when merchant signs up
2. **Format:** `pb_live_{random_32_chars}` for production
3. **Storage:** Hashed with bcrypt before saving to database
4. **Authentication:** Sent as Bearer token in Authorization header

### API Key Lifecycle

```
Merchant Signup
    ↓
API Key Generated (pb_live_xxx)
    ↓
Hashed & Stored in Database
    ↓
Shown to Merchant (one-time)
    ↓
Merchant copies & saves securely
    ↓
Used for payment operations
```

---

## API Key Distribution Strategies

### Strategy 1: Direct Integration (Recommended)

**Scenario:** Merchant integrates PayBridge into their own website/app

**Flow:**
1. Merchant signs up on PayBridge
2. Copies API key from dashboard
3. Adds key to their website's backend
4. Uses key to process payments for their customers

**Example:**
```javascript
// Merchant's e-commerce website backend
const PAYBRIDGE_API_KEY = process.env.PAYBRIDGE_API_KEY; // pb_live_xxx

app.post('/checkout', async (req, res) => {
  const payment = await paybridge.createPayment({
    amount: req.body.amount,
    order_id: generateOrderId()
  });
  res.json(payment);
});
```

**Security:**
- ✅ API key stays on merchant's server
- ✅ Never exposed to end users
- ✅ Merchant has full control

---

### Strategy 2: Platform Model

**Scenario:** PayBridge as a platform, merchants are your customers

**Flow:**
1. Platform (you) has master account
2. Each merchant gets sub-account with unique API key
3. Platform manages all API keys
4. Merchants use dashboard to track their transactions

**Implementation:**
Currently PayBridge supports one merchant per API key. Future enhancements:
- Multi-merchant support
- Sub-accounts under master account
- Revenue sharing

---

### Strategy 3: White-Label Solution

**Scenario:** Resell PayBridge under your brand

**Flow:**
1. You deploy PayBridge on your domain
2. Your customers sign up (become merchants)
3. Each customer gets API key
4. They integrate with your branded API

**Branding Changes:**
- API key prefix: `yb_live_xxx` (your brand)
- Custom domain: `api.yourbrand.com`
- Custom dashboard UI

---

## API Key Security Best Practices

### For PayBridge (Backend)

✅ **Never log API keys**
```javascript
// Bad
console.log('API Key:', apiKey);

// Good
console.log('API Key:', 'pb_****' + apiKey.slice(-4));
```

✅ **Hash before storing**
```javascript
const apiKeyHash = await bcrypt.hash(apiKey, 10);
await Merchant.update({ api_key_hash: apiKeyHash });
```

✅ **Rate limiting**
```javascript
// Already implemented: 100 requests per 15 minutes
```

### For Merchants (Third-Party Developers)

✅ **Use environment variables**
```bash
# .env file
PAYBRIDGE_API_KEY=pb_live_your_key
```

✅ **Never commit to version control**
```gitignore
.env
.env.local
config.js
```

✅ **Use server-side only**
```javascript
// Bad - Frontend
const apiKey = 'pb_live_xxx'; // Exposed to users!

// Good - Backend
const apiKey = process.env.PAYBRIDGE_API_KEY;
```

---

## Dashboard Implementation

### API Key Display

**Merchant Dashboard - API Keys Page:**

```html
<div class="api-key-section">
  <h2>Your API Key</h2>
  
  <div class="api-key-display">
    <input 
      type="text" 
      id="apiKeyInput"
      value="pb_live_••••••••••••••••••••••••7a3f"
      readonly
    />
    <button onclick="toggleAPIKey()">👁️ Show</button>
    <button onclick="copyAPIKey()">📋 Copy</button>
  </div>
  
  <div class="warning">
    ⚠️ Keep your API key secure. Do not share it publicly.
  </div>
</div>

<script>
let isVisible = false;
let fullAPIKey = 'pb_live_abc123...'; // From API

function toggleAPIKey() {
  const input = document.getElementById('apiKeyInput');
  isVisible = !isVisible;
  
  if (isVisible) {
    input.value = fullAPIKey;
    event.target.textContent = '🙈 Hide';
  } else {
    input.value = maskAPIKey(fullAPIKey);
    event.target.textContent = '👁️ Show';
  }
}

function maskAPIKey(key) {
  return key.slice(0, 8) + '••••••••••••••••••••' + key.slice(-4);
}

function copyAPIKey() {
  navigator.clipboard.writeText(fullAPIKey);
  alert('API key copied to clipboard!');
}
</script>
```

---

## API Key Rotation

### Implementation Plan

**New Endpoint:**
```javascript
// POST /api/v1/auth/regenerate-api-key
// Authorization: Bearer {jwt_token}

async regenerateAPIKey(req, res) {
  const merchantId = req.merchant.id;
  
  // Generate new API key
  const newAPIKey = 'pb_live_' + crypto.randomBytes(16).toString('hex');
  const apiKeyHash = await bcrypt.hash(newAPIKey, 10);
  
  // Update in database
  await Merchant.update(
    { api_key_hash: apiKeyHash },
    { where: { id: merchantId } }
  );
  
  res.json({
    success: true,
    data: {
      api_key: newAPIKey,
      created_at: new Date()
    },
    message: 'API key regenerated. Old key is now invalid.'
  });
}
```

**Dashboard UI:**
```html
<div class="danger-zone">
  <h3>Danger Zone</h3>
  <button 
    onclick="regenerateAPIKey()"
    class="btn-danger"
  >
    🔄 Regenerate API Key
  </button>
  <p class="warning">
    ⚠️ This will invalidate your current API key. 
    All integrations using the old key will stop working.
  </p>
</div>
```

---

## Testing API Keys

### Test Mode vs Live Mode

**Future Enhancement:**

```javascript
// Test API key (sandbox)
const testKey = 'pb_test_abc123...';

// Live API key (production)
const liveKey = 'pb_live_xyz789...';
```

**Benefits:**
- Test integrations without real money
- Separate test and production data
- Safe experimentation

**Implementation:**
1. Add `mode` field to Merchant model
2. Generate two keys: test and live
3. Filter payments by mode
4. Use Stripe test mode for test keys

---

## API Key Analytics

### Track API Key Usage

**Metrics to Track:**

```javascript
// Create analytics table
APIKeyUsage: {
  id: UUID,
  merchant_id: UUID,
  endpoint: String,      // /payments/create
  method: String,        // POST
  status_code: Integer,  // 200, 400, etc.
  response_time: Integer, // milliseconds
  timestamp: DateTime
}
```

**Dashboard Display:**
```
API Usage Statistics (Last 30 Days)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Total Requests:     1,234
Successful:         1,150 (93%)
Failed:             84 (7%)
Avg Response Time:  245ms

Most Used Endpoints:
1. /payments/create       45%
2. /cards/confirm         30%
3. /payments/:id          15%
4. /refunds/create        10%
```

---

## Multi-Key Support (Future)

### Use Case: Different Applications

**Example:**
- Website API key: `pb_live_web_xxx`
- Mobile App API key: `pb_live_app_xxx`
- Admin Panel API key: `pb_live_admin_xxx`

**Benefits:**
- Rotate one key without affecting others
- Track usage per application
- Set different rate limits
- Revoke specific keys

**Implementation:**
```javascript
// Database schema
APIKey: {
  id: UUID,
  merchant_id: UUID,
  key_hash: String,
  name: String,          // "Website", "Mobile App"
  permissions: JSON,     // ["payments", "refunds"]
  rate_limit: Integer,   // custom rate limit
  is_active: Boolean,
  last_used: DateTime
}
```

---

## Security Incidents Response

### If API Key is Compromised

**Merchant Action:**
1. Immediately regenerate API key
2. Review recent transactions
3. Contact PayBridge support

**PayBridge Action:**
1. Invalidate compromised key
2. Monitor for suspicious activity
3. Notify merchant
4. Investigate breach

**Automated Detection:**
```javascript
// Flag suspicious patterns
if (requestsInLastMinute > 1000) {
  notifyMerchant('Unusual API activity detected');
  temporarilyBlockAPIKey();
}
```

---

## Summary

### Current Implementation
✅ Automatic API key generation on signup
✅ Bcrypt hashing for secure storage
✅ Bearer token authentication
✅ Rate limiting (100 req/15 min)

### Recommended Enhancements
🔲 API key rotation endpoint
🔲 Test mode vs Live mode keys
🔲 Multiple API keys per merchant
🔲 API usage analytics
🔲 Webhook signing keys
🔲 Automated suspicious activity detection

### Distribution Model
**Recommended:** Strategy 1 (Direct Integration)
- Simple for merchants
- Secure
- Easy to maintain

---

## Next Steps

1. **Review this guide**
2. **Implement API key rotation** (if needed)
3. **Create dashboard API key management page**
4. **Add API usage analytics**
5. **Document for third-party developers**

Questions? Review the main implementation plan.
