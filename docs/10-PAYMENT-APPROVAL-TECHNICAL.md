# Payment Approval Email with PDF Invoice Feature

## Overview

Fitur ini mengirimkan email dengan PDF invoice ketika admin menyetujui pembayaran customer. PDF invoice dibuat secara otomatis menggunakan jsPDF library.

## Files Created/Modified

### 1. PDF Generator (`src/lib/pdf-generator.ts`)

- **Purpose**: Generate PDF invoice dari data payment
- **Main Functions**:
  - `generateInvoicePDF(data: InvoiceData): Buffer` - Generate PDF invoice
  - `generateInvoiceNumber(paymentId: string): string` - Generate unique invoice number
- **Features**:
  - Company branding dengan warna TRANSPO
  - Format invoice profesional
  - Support untuk transport dan tour orders
  - Automatic invoice numbering
  - Customer information display
  - Item breakdown dengan pricing
  - Payment information

### 2. Email Template (`src/components/email/payment-approval.tsx`)

- **Purpose**: Email template untuk approval notification
- **Props**: fullName, orderType, totalAmount, invoiceNumber, paymentDate
- **Features**:
  - Professional email design
  - Clear payment approval message
  - Payment details display
  - Call-to-action button

### 3. Email Templates Extension (`src/lib/email-templates.ts`)

- **Added**: New email type "payment-approval"
- **Added**: PaymentApprovalData interface
- **Modified**: sendTemplateEmail function untuk support attachments
- **Added**: emailTemplates.sendPaymentApproval function

### 4. Nodemailer Extension (`src/lib/nodemailer.ts`)

- **Modified**: sendMail function untuk support email attachments
- **Added**: attachments parameter dengan type definition

### 5. Payment Approval Service (`src/lib/payment-approval.ts`)

- **Purpose**: Orchestrate payment approval dengan email dan PDF generation
- **Main Function**: `sendPaymentApprovalWithInvoice(paymentId: string)`
- **Features**:
  - Fetch complete payment data dengan relationships
  - Generate invoice data dari payment/order information
  - Create PDF invoice
  - Send email dengan PDF attachment
  - Handle both transport dan tour orders

### 6. Payment Status API Extension (`src/app/api/payments/[id]/status/route.ts`)

- **Modified**: PUT endpoint untuk trigger email ketika status = "APPROVED"
- **Added**: Auto email sending dengan error handling
- **Behavior**: Email failure tidak akan fail status update

## How It Works

### 1. Admin Approval Flow

```
1. Admin opens payment in admin panel
2. Admin changes payment status to "APPROVED"
3. API endpoint `/api/payments/[id]/status` dipanggil
4. Status updated di database
5. Jika status = "APPROVED", trigger sendPaymentApprovalWithInvoice()
6. Email dengan PDF invoice dikirim ke customer
```

### 2. PDF Generation Process

```
1. Fetch payment data dengan order dan user relationships
2. Extract invoice data (customer info, items, pricing)
3. Generate unique invoice number
4. Create PDF menggunakan jsPDF
5. Return PDF sebagai Buffer
```

### 3. Email Sending Process

```
1. Generate PDF invoice
2. Create email content menggunakan PaymentApproval template
3. Attach PDF ke email
4. Send via nodemailer
5. Log success/failure
```

## Configuration

### Environment Variables Required

```env
SMTP_HOST=your_smtp_host
SMTP_PORT=587
SMTP_USER=your_smtp_user
SMTP_PASS=your_smtp_password
SMTP_FROM=your_from_email
SMTP_SECURE=false
```

### Dependencies Added

- `jspdf` - For PDF generation

## Usage Example

### Manual Trigger (for testing)

```typescript
import { sendPaymentApprovalWithInvoice } from "@/lib/payment-approval";

// Send approval email for specific payment
await sendPaymentApprovalWithInvoice("payment_id_here");
```

### Automatic Trigger

Email automatically dikirim ketika admin mengubah payment status ke "APPROVED" melalui admin panel.

## Error Handling

- PDF generation errors are logged and thrown
- Email sending errors are logged but don't fail payment status update
- Missing payment data throws descriptive errors
- Invalid email format validation

## Invoice Design Features

- TRANSPO branding dengan company colors
- Professional layout dengan header/footer
- Customer information section
- Detailed item breakdown
- Payment information
- Total pricing dengan currency formatting
- Invoice numbering system
- Date formatting dalam Bahasa Indonesia

## Security Considerations

- Payment data validation before processing
- Email format validation
- Sanitized content dalam PDF generation
- Proper error handling untuk prevent data leaks

## Testing

1. Create test payment in system
2. Change payment status to "APPROVED" via admin panel
3. Check customer email for approval notification dengan PDF attachment
4. Verify PDF content dan formatting
5. Check server logs untuk any errors

## Future Enhancements

1. Email template customization options
2. PDF template variations
3. Bulk approval processing
4. Email delivery status tracking
5. Invoice storage dalam file system/cloud
6. Multi-language support
7. Custom invoice numbering schemes
