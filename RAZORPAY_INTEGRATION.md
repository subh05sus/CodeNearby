# Razorpay Integration Documentation

## Overview
This project implements Razorpay payment gateway integration for token purchases in the CodeNearby API platform.

## Features
- ✅ Order creation via Razorpay API
- ✅ Payment verification with signature validation
- ✅ Webhook handling for payment status updates
- ✅ Database transaction logging
- ✅ React component for seamless payment flow
- ✅ Support for both USD and INR currencies
- ✅ Token balance updates post-payment

## API Endpoints

### 1. Create Payment Order
**POST** `/api/v1/billing/buy-tokens`

**Request Body:**
```json
{
  "packageId": "basic|standard|pro|enterprise",
  "currency": "USD|INR"
}
```

**Response:**
```json
{
  "success": true,
  "orderId": "order_razorpay_id",
  "amount": 99900,
  "currency": "INR",
  "key": "rzp_test_key",
  "userEmail": "user@example.com",
  "userName": "User Name",
  "package": { ... },
  "message": "Order created successfully"
}
```

### 2. Verify Payment
**POST** `/api/v1/billing/verify-payment`

**Request Body:**
```json
{
  "razorpay_order_id": "order_xxx",
  "razorpay_payment_id": "pay_xxx", 
  "razorpay_signature": "signature_xxx"
}
```

**Response:**
```json
{
  "success": true,
  "paymentId": "pay_xxx",
  "orderId": "order_xxx",
  "tokensAdded": 1500,
  "newBalance": 2000,
  "newTier": "premium",
  "message": "Payment verified and tokens added successfully!"
}
```

### 3. Webhook Handler
**POST** `/api/v1/billing/webhook`

Handles Razorpay webhooks for:
- `payment.captured`
- `payment.failed`
- Other payment events

## Environment Variables

```env
# Razorpay Test Credentials
RZP_TEST_KEY_ID=rzp_test_xxx
RZP_TEST_KEY_SECRET=xxx

# Optional: Webhook Secret
RZP_WEBHOOK_SECRET=webhook_secret
```

## Frontend Component Usage

```tsx
import RazorpayPayment from "@/components/razorpay-payment";

<RazorpayPayment
  packageId="basic"
  currency="INR"
  amount={999}
  packageName="Basic Package"
  tokens={1000}
  bonus={500}
  onSuccess={() => {
    toast.success("Payment successful!");
    router.push("/dashboard");
  }}
  onError={(error) => {
    toast.error(`Payment failed: ${error}`);
  }}
/>
```

## Database Collections

### pending_orders
Stores order information during payment process:
```json
{
  "orderId": "order_xxx",
  "userId": "user_id",
  "packageId": "basic",
  "amount": 99900,
  "currency": "INR",
  "status": "created|completed",
  "createdAt": "2025-01-15T...",
  "expiresAt": "2025-01-15T..." // 15 minutes from creation
}
```

### transactions
Completed transaction records:
```json
{
  "userId": "user_id",
  "orderId": "order_xxx", 
  "paymentId": "pay_xxx",
  "packageId": "basic",
  "amount": 99900,
  "currency": "INR",
  "tokensAdded": 1500,
  "status": "completed",
  "createdAt": "2025-01-15T..."
}
```

### webhook_logs
Webhook event logs for debugging:
```json
{
  "event": "payment.captured",
  "paymentId": "pay_xxx",
  "orderId": "order_xxx",
  "amount": 99900,
  "currency": "INR",
  "status": "captured",
  "createdAt": "2025-01-15T..."
}
```

## Payment Flow

1. **User clicks "Purchase" button**
2. **Frontend calls** `/api/v1/billing/buy-tokens`
3. **Backend creates Razorpay order** and stores in `pending_orders`
4. **Frontend opens Razorpay checkout** with order details
5. **User completes payment** on Razorpay interface
6. **Razorpay returns payment details** to frontend
7. **Frontend calls** `/api/v1/billing/verify-payment`
8. **Backend verifies signature** and payment status
9. **Backend updates user tokens** and tier if successful
10. **Backend logs transaction** and updates order status
11. **User redirected to dashboard** with success message

## Security Features

- **Signature Verification**: All payments verified using HMAC-SHA256
- **Order Expiration**: Orders expire after 15 minutes
- **Duplicate Prevention**: Orders can only be processed once
- **Webhook Validation**: Webhook signatures verified before processing
- **User Authorization**: All endpoints require valid session

## Testing

Use Razorpay test credentials:
- **Test Card**: 4111 1111 1111 1111
- **Expiry**: Any future date
- **CVV**: Any 3 digits
- **OTP**: 123456

## Error Handling

The integration handles various error scenarios:
- Invalid package IDs
- Expired orders
- Failed signature verification
- Network timeouts
- Invalid payment status

All errors are logged and appropriate messages returned to frontend.

## Production Deployment

1. Replace test credentials with live Razorpay keys
2. Set up webhook URL in Razorpay dashboard
3. Configure webhook secret for production
4. Test with real payments in staging environment
5. Monitor transaction logs and webhook events
