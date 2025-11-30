# PayBridge — Third‑Party Payment Gateway (No Webhooks)

This document describes the complete technical plan for implementing **PayBridge**, a third‑party payment gateway built on top of **Stripe PaymentIntents**, without using webhooks.

---

## 1. Introduction

> **Update Added:** Merchant signup + login using **Local Auth (email + password)** is now included.

PayBridge acts as a middle‑layer payment gateway between:
- Third‑party apps (e‑commerce sites, mobile apps, SaaS platforms)
- Stripe (test/sandbox mode)
- PayBridge backend (Node.js + Express)

Merchants integrate with PayBridge using simple REST APIs to:
- Create payments
- Confirm payments
- Check payment status
- Process refunds
- Retrieve transaction history

Webhooks are **not** used. PayBridge instead verifies payment success via **Stripe Retrieve API**.

---

## 1.1 Authentication (Local Auth)
PayBridge provides **email + password authentication** for merchants. This includes:
- `POST /auth/signup` → Create account
- `POST /auth/login` → Login & get JWT token
- API requests require: `Authorization: Bearer <token>`

Password is stored as **bcrypt hash**.
JWT secret stored securely in environment variables.

---

## 2. Key Concepts
### No‑Webhook Flow
Instead of Stripe sending updates to PayBridge, the merchant/frontend calls:
```
POST /payments/confirm
```
PayBridge then verifies the payment by calling:
```
stripe.paymentIntents.retrieve(pi_id)
```
This keeps the system simple and makes it fully 3rd‑party friendly.

---

## 3. System Flow (End‑to‑End)

### 1) Merchant Signup
- Merchant calls `POST /merchant/signup`
- PayBridge generates:
  - `merchant_id` (UUID)
  - `api_key` (secure token)
- Record saved in DB

### 2) Payment Creation
Merchant calls `POST /payments/create` using `api_key`.
PayBridge:
- Creates Stripe PaymentIntent
- Stores record in DB
- Returns:
```
payment_id,
client_secret,
stripe_payment_intent_id
```

### 3) Frontend Payment Confirmation
Merchant uses Stripe JS:
```
stripe.confirmCardPayment(client_secret)
```

### 4) Merchant Confirms With PayBridge (No Webhooks)
Frontend or backend sends:
```
POST /payments/confirm
```
PayBridge:
- Retrieves Stripe PaymentIntent
- Updates DB with the verified status

### 5) Status Check
Merchant fetches:
```
GET /payments/:payment_id
```

### 6) Refunds
Merchant requests:
```
POST /refunds/create
```
PayBridge:
- Calls `stripe.refunds.create()`
- Saves refund record

---

## 4. API Specification

### ✔ Merchant Signup
**POST /merchant/signup**
```json
{
  "name": "My Shop",
  "email": "owner@gmail.com"
}
```
**Response:**
```json
{
  "merchant_id": "mrc_xxx",
  "api_key": "pb_live_xxx"
}
```

### ✔ Create Payment
**POST /payments/create**
```json
{
  "amount": 1500,
  "currency": "PKR",
  "order_id": "ORD-57"
}
```

### ✔ Confirm Payment (No Webhook Needed)
**POST /payments/confirm**
```json
{
  "payment_id": "pay_001",
  "stripe_payment_intent_id": "pi_abc"
}
```

### ✔ Check Payment Status
**GET /payments/:payment_id**

### ✔ Refund
**POST /refunds/create**
```json
{
  "payment_id": "pay_001"
}
```

---

## 5. Database Schema (MySQL)

### merchants
```
id (uuid)
name
email
api_key_hash
created_at
is_active
```

### payments
```
id (uuid)
merchant_id
order_id
stripe_payment_intent_id
client_secret
amount
currency
status
metadata
created_at
updated_at
```

### refunds
```
id (uuid)
payment_id
stripe_refund_id
amount
status
reason
created_at
```

### api_logs (optional)
```
id
merchant_id
method
path
status_code
request_json
response_json
created_at
```

---

## 6. Security Model
- API key required for all merchant requests
- API keys stored as hashed values (bcrypt or HMAC)
- HTTPS enforced
- Rate limiting per merchant
- Stripe secrets stored in environment variables
- No card data ever touches PayBridge (Stripe handles it)

---

## 7. Implementation Notes (Node.js)

### Create Payment
```js
const intent = await stripe.paymentIntents.create({
  amount,
  currency,
  metadata: { merchant_id, order_id }
});
```

### Confirm Payment (No Webhook)
```js
const pi = await stripe.paymentIntents.retrieve(stripe_payment_intent_id);
await db.payments.update(payment_id, { status: pi.status });
```

### Refund
```js
const refund = await stripe.refunds.create({
  payment_intent: stripe_payment_intent_id
});
```

---

## 8. Extra 3rd‑Party Features
- Transaction search & filters
- Dashboard for merchants
- API key rotation
- Sandbox mode

---

## 9. Summary
This document describes a **complete webhook‑less payment gateway system** using Stripe PaymentIntents. PayBridge handles merchant onboarding, payment creation, payment confirmation, refunding, and transaction management — all via simple 3rd‑party friendly APIs.

If required, more sections can be added:
- Full SQL schema
- Full NestJS/Node.js code
- ERD diagram
- Postman collection

