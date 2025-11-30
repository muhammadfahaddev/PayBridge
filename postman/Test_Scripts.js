// Postman Test Scripts for PayBridge API

// 1. Merchant Signup - Auto set API key and JWT token
pm.test("Merchant Signup Success", function () {
    pm.response.to.have.status(201);
    
    const response = pm.response.json();
    pm.expect(response.success).to.be.true;
    pm.expect(response.data).to.have.property('api_key');
    pm.expect(response.data).to.have.property('token');
    
    // Auto set environment variables
    pm.environment.set("api_key", response.data.api_key);
    pm.environment.set("jwt_token", response.data.token);
    pm.environment.set("merchant_id", response.data.merchant_id);
});

// 2. Merchant Login - Auto set JWT token
pm.test("Merchant Login Success", function () {
    pm.response.to.have.status(200);
    
    const response = pm.response.json();
    pm.expect(response.success).to.be.true;
    pm.expect(response.data).to.have.property('token');
    
    // Auto set JWT token
    pm.environment.set("jwt_token", response.data.token);
});

// 3. Create Payment - Auto set payment details
pm.test("Create Payment Success", function () {
    pm.response.to.have.status(201);
    
    const response = pm.response.json();
    pm.expect(response.success).to.be.true;
    pm.expect(response.data).to.have.property('payment_id');
    pm.expect(response.data).to.have.property('stripe_payment_intent_id');
    
    // Auto set payment variables
    pm.environment.set("payment_id", response.data.payment_id);
    pm.environment.set("stripe_payment_intent_id", response.data.stripe_payment_intent_id);
});

// 4. Confirm Payment Success
pm.test("Confirm Payment Success", function () {
    pm.response.to.have.status(200);
    
    const response = pm.response.json();
    pm.expect(response.success).to.be.true;
    pm.expect(response.data).to.have.property('status');
});

// 5. Get Payment Success
pm.test("Get Payment Success", function () {
    pm.response.to.have.status(200);
    
    const response = pm.response.json();
    pm.expect(response.success).to.be.true;
    pm.expect(response.data).to.have.property('id');
    pm.expect(response.data).to.have.property('amount');
});

// 6. Create Refund Success
pm.test("Create Refund Success", function () {
    pm.response.to.have.status(201);
    
    const response = pm.response.json();
    pm.expect(response.success).to.be.true;
    pm.expect(response.data).to.have.property('refund_id');
    pm.expect(response.data).to.have.property('stripe_refund_id');
});

// 7. Health Check
pm.test("Health Check Success", function () {
    pm.response.to.have.status(200);
    
    const response = pm.response.json();
    pm.expect(response.status).to.eql('OK');
});

// 8. Response Time Test
pm.test("Response time is less than 2000ms", function () {
    pm.expect(pm.response.responseTime).to.be.below(2000);
});

// 9. Content Type Test
pm.test("Content-Type is application/json", function () {
    pm.expect(pm.response.headers.get("Content-Type")).to.include("application/json");
});

// 10. Error Response Test
pm.test("Error Response Format", function () {
    if (pm.response.code >= 400) {
        const response = pm.response.json();
        pm.expect(response).to.have.property('success');
        pm.expect(response.success).to.be.false;
        pm.expect(response).to.have.property('message');
    }
});