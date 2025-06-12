# Email API Documentation

## Overview

API for sending notification emails to users using predefined templates.

## Endpoints

### POST /api/email/send

Sends an email with a predefined template.

#### Request Body

```json
{
  "to": "user@example.com",
  "fullName": "John Doe",
  "emailType": "payment-verification"
}
```

#### Parameters

- `to` (string, required): Recipient email address
- `fullName` (string, required): Recipient's full name
- `emailType` (string, optional): Email template type
  - `payment-verification` (default): Payment verification email
  - `order-confirmation`: Order confirmation email (requires `orderData`)
  - `payment-remainder`: Payment reminder email (requires `percentage`, `dueDate`)
  - `register-verification`: Registration verification email
  - `thanks`: Thank you email (requires `reviewUrl`)

#### Additional Parameters by Email Type

**order-confirmation:**

```json
{
  "to": "user@example.com",
  "fullName": "John Doe",
  "emailType": "order-confirmation",
  "orderData": [
    { "text": "Departure Date", "value": "2023-10-01" },
    { "text": "Vehicle", "value": "Bus" },
    { "text": "Number of Passengers", "value": 50 }
  ]
}
```

**payment-remainder:**

```json
{
  "to": "user@example.com",
  "fullName": "John Doe",
  "emailType": "payment-remainder",
  "percentage": 75,
  "dueDate": "10-5-2025"
}
```

**thanks:**

```json
{
  "to": "user@example.com",
  "fullName": "John Doe",
  "emailType": "thanks",
  "reviewUrl": "https://example.com/review"
}
```

#### Response

**Success (200)**

```json
{
  "message": "Email sent successfully",
  "data": {
    "to": "user@example.com",
    "subject": "Payment Verification - TRANSPO"
  }
}
```

**Error (400)**

```json
{
  "message": "Missing required fields: to, fullName",
  "data": []
}
```

**Error (500)**

```json
{
  "message": "Failed to send email",
  "data": []
}
```

## Integration

### Automatic Email Sending

Payment verification emails will be automatically sent when a user uploads a transfer receipt through:

- `/api/payments/[id]/proof` (POST)

### Environment Variables

Ensure the following environment variables are configured:

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_FROM=noreply@transpo.com
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

## Email Templates

Email templates are available at:

- `src/components/email/payment-verification.tsx`
- `src/components/email/order-confirmation.tsx`
- `src/components/email/payment-remainder.tsx`
- `src/components/email/register-verification.tsx`
- `src/components/email/thanks.tsx`
