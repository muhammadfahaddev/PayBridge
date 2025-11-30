# PayBridge API Documentation for Third-Party Developers

## Table of Contents
1. [Getting Started](#getting-started)
2. [Authentication](#authentication)
3. [Payment APIs](#payment-apis)
4. [Refund APIs](#refund-apis)
5. [Error Handling](#error-handling)
6. [Code Examples](#code-examples)
7. [Testing](#testing)

---

## Getting Started

PayBridge is a simple, webhook-free payment gateway built on Stripe. Perfect for developers who want to accept payments without complex webhook handling.

### Base URL
```
Production: https://api.paybridge.com/api/v1
Development: http://localhost:3000/api/v1
```

### Quick Integration (5 minutes)

**Step 1:** Sign up for merchant account
**Step 2:** Get your API key
**Step 3:** Create and confirm payments

---

## Authentication

### API Key Authentication

All payment operations require an API key in the `Authorization` header:

```http
Authorization: Bearer pb_live_your_api_key_here
```

### Getting Your API Key

**Method 1: Dashboard**
1. Login to merchant dashboard
2. Go to Settings → API Keys
3. Copy your API key

**Method 2: API** (For programmatic signup)

```http
POST /auth/signup
Content-Type: application/json

{
  "name": "My Business",
  "email": "business@example.com",
  "password": "secure_password_123"
}

Response:
{
  "success": true,
  "data": {
    "merchant_id": "uuid-here",
    "api_key": "pb_live_abc123...",
    "token": "jwt_token_here"
  }
}
```

---

## Payment APIs

### 1. Create Payment

Creates a new payment intent.

**Endpoint:**
```http
POST /payments/create
```

**Headers:**
```http
Authorization: Bearer {your_api_key}
Content-Type: application/json
```

**Request Body:**
```json
{
  "amount": 1500,
  "currency": "PKR",
  "order_id": "ORD-12345",
  "metadata": {
    "customer_email": "customer@example.com",
    "product_name": "Premium Plan"
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "Payment created successfully",
  "data": {
    "payment_id": "abc123-uuid",
    "client_secret": "pi_xxx_secret_yyy",
    "stripe_payment_intent_id": "pi_xxx",
    "amount": 1500,
    "currency": "PKR",
    "status": "requires_payment_method"
  }
}
```

**Parameters:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| amount | integer | Yes | Amount in smallest currency unit (paisas for PKR) |
| currency | string | No | Currency code (default: PKR) |
| order_id | string | Yes | Your unique order identifier |
| metadata | object | No | Custom data to attach to payment |

---

### 2. Confirm Payment with Card

Confirms a payment using card details. This is the webhook-free approach.

**Endpoint:**
```http
POST /cards/confirm-with-card
```

**Request Body:**
```json
{
  "payment_id": "abc123-uuid",
  "card_number": "4242424242424242",
  "exp_month": 12,
  "exp_year": 2025,
  "cvc": "123",
  "cardholder_name": "John Doe"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Payment confirmed successfully with card",
  "data": {
    "payment_id": "abc123-uuid",
    "status": "succeeded",
    "amount": 1500,
    "currency": "PKR",
    "order_id": "ORD-12345",
    "card_brand": "visa",
    "card_last4": "4242"
  }
}
```

**Test Cards:**

| Card Number | Brand | Result |
|-------------|-------|--------|
| 4242424242424242 | Visa | Success |
| 5555555555554444 | Mastercard | Success |
| 378282246310005 | Amex | Success |

---

### 3. Get Payment Status

Retrieve details of a specific payment.

**Endpoint:**
```http
GET /payments/{payment_id}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "abc123-uuid",
    "merchant_id": "merchant-uuid",
    "order_id": "ORD-12345",
    "amount": 1500,
    "currency": "PKR",
    "status": "succeeded",
    "created_at": "2025-11-30T21:00:00Z",
    "refunds": []
  }
}
```

**Payment Statuses:**
- `requires_payment_method` - Waiting for payment
- `requires_confirmation` - Payment method added, needs confirmation
- `processing` - Payment is being processed
- `succeeded` - Payment successful
- `canceled` - Payment canceled
- `requires_action` - Requires additional authentication

---

### 4. List Payments

Get all payments for your merchant account with pagination and filtering.

**Endpoint:**
```http
GET /payments?page=1&limit=10&status=succeeded&order_id=ORD-123
```

**Query Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| page | integer | Page number (default: 1) |
| limit | integer | Items per page (default: 10, max: 100) |
| status | string | Filter by status |
| order_id | string | Filter by order ID |

**Response:**
```json
{
  "success": true,
  "data": {
    "payments": [
      {
        "id": "abc123",
        "amount": 1500,
        "status": "succeeded",
        "created_at": "2025-11-30T21:00:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 156,
      "pages": 16
    }
  }
}
```

---

## Refund APIs

### Create Refund

Refund a succeeded payment (full or partial).

**Endpoint:**
```http
POST /refunds/create
```

**Full Refund:**
```json
{
  "payment_id": "abc123-uuid",
  "reason": "requested_by_customer"
}
```

**Partial Refund:**
```json
{
  "payment_id": "abc123-uuid",
  "amount": 500,
  "reason": "partial_return"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Refund created successfully",
  "data": {
    "refund_id": "refund-uuid",
    "stripe_refund_id": "re_xxx",
    "amount": 1500,
    "status": "succeeded",
    "reason": "requested_by_customer"
  }
}
```

**Important Notes:**
- Only `succeeded` payments can be refunded
- Duplicate refund requests return same refund (idempotent)
- Partial refunds can be processed multiple times until full amount is refunded

---

## Error Handling

### Error Response Format

```json
{
  "success": false,
  "message": "Error description",
  "errors": [
    {
      "field": "amount",
      "message": "Amount must be greater than 0"
    }
  ]
}
```

### Common Error Codes

| HTTP Code | Meaning |
|-----------|---------|
| 400 | Bad Request - Invalid parameters |
| 401 | Unauthorized - Invalid/missing API key |
| 404 | Not Found - Resource doesn't exist |
| 429 | Too Many Requests - Rate limit exceeded |
| 500 | Server Error - Something went wrong |

### Rate Limiting

- **Limit:** 100 requests per 15 minutes per API key
- **Headers returned:**
  - `X-RateLimit-Limit: 100`
  - `X-RateLimit-Remaining: 85`
  - `X-RateLimit-Reset: 1638316800`

---

## Code Examples

### JavaScript (Node.js)

```javascript
const axios = require('axios');

const paybridge = {
  apiKey: 'pb_live_your_key',
  baseURL: 'https://api.paybridge.com/api/v1',
  
  async createPayment(amount, orderId) {
    const response = await axios.post(
      `${this.baseURL}/payments/create`,
      {
        amount,
        currency: 'PKR',
        order_id: orderId
      },
      {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        }
      }
    );
    return response.data;
  },
  
  async confirmPayment(paymentId, cardDetails) {
    const response = await axios.post(
      `${this.baseURL}/cards/confirm-with-card`,
      {
        payment_id: paymentId,
        ...cardDetails
      },
      {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        }
      }
    );
    return response.data;
  }
};

// Usage
(async () => {
  // Step 1: Create payment
  const payment = await paybridge.createPayment(1500, 'ORD-001');
  console.log('Payment created:', payment.data.payment_id);
  
  // Step 2: Confirm with card
  const result = await paybridge.confirmPayment(
    payment.data.payment_id,
    {
      card_number: '4242424242424242',
      exp_month: 12,
      exp_year: 2025,
      cvc: '123',
      cardholder_name: 'John Doe'
    }
  );
  
  if (result.data.status === 'succeeded') {
    console.log('Payment successful!');
  }
})();
```

### PHP

```php
<?php

class PayBridge {
    private $apiKey;
    private $baseURL = 'https://api.paybridge.com/api/v1';
    
    public function __construct($apiKey) {
        $this->apiKey = $apiKey;
    }
    
    public function createPayment($amount, $orderId) {
        $ch = curl_init($this->baseURL . '/payments/create');
        
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_HTTPHEADER, [
            'Authorization: Bearer ' . $this->apiKey,
            'Content-Type: application/json'
        ]);
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode([
            'amount' => $amount,
            'currency' => 'PKR',
            'order_id' => $orderId
        ]));
        
        $response = curl_exec($ch);
        curl_close($ch);
        
        return json_decode($response, true);
    }
    
    public function confirmPayment($paymentId, $cardDetails) {
        $ch = curl_init($this->baseURL . '/cards/confirm-with-card');
        
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_HTTPHEADER, [
            'Authorization: Bearer ' . $this->apiKey,
            'Content-Type: application/json'
        ]);
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode(
            array_merge(['payment_id' => $paymentId], $cardDetails)
        ));
        
        $response = curl_exec($ch);
        curl_close($ch);
        
        return json_decode($response, true);
    }
}

// Usage
$paybridge = new PayBridge('pb_live_your_key');

$payment = $paybridge->createPayment(1500, 'ORD-001');
echo "Payment created: " . $payment['data']['payment_id'] . "\n";

$result = $paybridge->confirmPayment(
    $payment['data']['payment_id'],
    [
        'card_number' => '4242424242424242',
        'exp_month' => 12,
        'exp_year' => 2025,
        'cvc' => '123',
        'cardholder_name' => 'John Doe'
    ]
);

if ($result['data']['status'] === 'succeeded') {
    echo "Payment successful!\n";
}
?>
```

### Python

```python
import requests

class PayBridge:
    def __init__(self, api_key):
        self.api_key = api_key
        self.base_url = 'https://api.paybridge.com/api/v1'
        self.headers = {
            'Authorization': f'Bearer {api_key}',
            'Content-Type': 'application/json'
        }
    
    def create_payment(self, amount, order_id):
        response = requests.post(
            f'{self.base_url}/payments/create',
            json={
                'amount': amount,
                'currency': 'PKR',
                'order_id': order_id
            },
            headers=self.headers
        )
        return response.json()
    
    def confirm_payment(self, payment_id, card_details):
        response = requests.post(
            f'{self.base_url}/cards/confirm-with-card',
            json={
                'payment_id': payment_id,
                **card_details
            },
            headers=self.headers
        )
        return response.json()

# Usage
paybridge = PayBridge('pb_live_your_key')

# Create payment
payment = paybridge.create_payment(1500, 'ORD-001')
print(f"Payment created: {payment['data']['payment_id']}")

# Confirm payment
result = paybridge.confirm_payment(
    payment['data']['payment_id'],
    {
        'card_number': '4242424242424242',
        'exp_month': 12,
        'exp_year': 2025,
        'cvc': '123',
        'cardholder_name': 'John Doe'
    }
)

if result['data']['status'] == 'succeeded':
    print('Payment successful!')
```

---

## Testing

### Using Postman

1. Import collection from: `https://github.com/muhammadfahaddev/PayBridge/postman`
2. Set environment variables:
   - `base_url`: `http://localhost:3000` or your production URL
   - `api_key`: Your merchant API key
3. Run the collection

### Test Workflow

```
1. POST /auth/signup → Get API key
2. POST /payments/create → Get payment_id
3. POST /cards/confirm-with-card → Confirm with test card
4. GET /payments/{payment_id} → Verify status
5. POST /refunds/create → Test refund
```

### Idempotency Testing

PayBridge APIs are idempotent:

```javascript
// Confirming same payment twice returns same result
await confirmPayment(paymentId, cardDetails); // First call
await confirmPayment(paymentId, cardDetails); // Second call - returns existing payment

// Refunding twice returns same refund
await createRefund(paymentId); // First call
await createRefund(paymentId); // Second call - returns existing refund
```

---

## Best Practices

### Security
✅ Use HTTPS only in production
✅ Never log or expose API keys
✅ Implement rate limiting on your side too
✅ Validate amounts before creating payments
✅ Use environment variables for API keys

### Error Handling
✅ Always check `success` field in response
✅ Handle network errors gracefully
✅ Implement retry logic with exponential backoff
✅ Show user-friendly error messages

### Payment Flow
✅ Show loading states during payment
✅ Confirm payment status before granting access
✅ Store payment_id in your database
✅ Implement webhook handling (future feature)

---

## Support

**Documentation:** https://docs.paybridge.com
**GitHub:** https://github.com/muhammadfahaddev/PayBridge
**Email:** support@paybridge.com

**Response Time:**
- Critical issues: 2 hours
- General support: 24 hours
- Feature requests: 48 hours
