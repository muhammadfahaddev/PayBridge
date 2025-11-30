# PayBridge Postman Collection

## Import Instructions

### 1. Import Collection
1. Open Postman
2. Click **Import** button
3. Select `PayBridge_API_Collection.json`
4. Click **Import**

### 2. Import Environment
1. Click **Import** button
2. Select `Environment.json`
3. Click **Import**
4. Select **PayBridge Environment** from dropdown

## Setup Variables

### After Merchant Signup:
1. Run **Merchant Signup** request
2. Copy `api_key` from response
3. Set in environment: `api_key = pb_live_xxxxx`
4. Copy `token` from response  
5. Set in environment: `jwt_token = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

### After Create Payment:
1. Run **Create Payment** request
2. Copy `payment_id` from response
3. Set in environment: `payment_id = uuid-here`
4. Copy `stripe_payment_intent_id` from response
5. Set in environment: `stripe_payment_intent_id = pi_xxxxx`

## Testing Flow

### 1. Authentication Flow
```
1. Merchant Signup → Get API key & JWT token
2. Merchant Login → Get JWT token
3. Get Profile → Verify JWT token works
```

### 2. Payment Flow
```
1. Create Payment → Get payment_id & client_secret
2. [Frontend: Use Stripe.js to confirm payment]
3. Confirm Payment → Verify payment status
4. Get Payment by ID → Check payment details
5. Get All Payments → List all payments
```

### 3. Refund Flow
```
1. Create Full Refund → Refund entire amount
2. Create Partial Refund → Refund partial amount
```

## Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `base_url` | API base URL | `http://localhost:3000` |
| `jwt_token` | JWT token for auth | `eyJhbGciOiJIUzI1NiIs...` |
| `api_key` | API key for payments | `pb_live_xxxxxxxxxxxxx` |
| `payment_id` | Payment UUID | `550e8400-e29b-41d4-a716...` |
| `stripe_payment_intent_id` | Stripe PI ID | `pi_1234567890abcdef` |

## Request Examples

### Merchant Signup
```json
POST /api/v1/auth/signup
{
  "name": "My Test Shop",
  "email": "test@example.com", 
  "password": "password123"
}
```

### Create Payment
```json
POST /api/v1/payments/create
Authorization: Bearer {{api_key}}
{
  "amount": 1500,
  "currency": "PKR",
  "order_id": "ORD-123"
}
```

### Confirm Payment
```json
POST /api/v1/payments/confirm
Authorization: Bearer {{api_key}}
{
  "payment_id": "{{payment_id}}",
  "stripe_payment_intent_id": "{{stripe_payment_intent_id}}"
}
```

## Error Testing

Test these scenarios:
- Invalid API key
- Missing required fields
- Invalid payment ID
- Expired JWT token
- Invalid Stripe payment intent ID

## Production Environment

For production testing:
1. Change `base_url` to production URL
2. Use production Stripe keys
3. Use real payment amounts