# Email Configuration Examples

## Gmail Configuration

To use Gmail as an SMTP server:

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_FROM=your-email@gmail.com
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

**Notes for Gmail:**

1. Enable 2-Factor Authentication on your Gmail account
2. Generate App Password in Google Account Settings
3. Use App Password as SMTP_PASS (not your regular password)

## Outlook/Hotmail Configuration

```env
SMTP_HOST=smtp-mail.outlook.com
SMTP_PORT=587
SMTP_FROM=your-email@outlook.com
SMTP_SECURE=false
SMTP_USER=your-email@outlook.com
SMTP_PASS=your-password
```

## Mailtrap (Development/Testing)

For testing emails without sending to real email addresses:

```env
SMTP_HOST=smtp.mailtrap.io
SMTP_PORT=2525
SMTP_FROM=noreply@transpo.com
SMTP_SECURE=false
SMTP_USER=your-mailtrap-username
SMTP_PASS=your-mailtrap-password
```

## SendGrid Configuration

```env
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_FROM=noreply@yourdomain.com
SMTP_SECURE=false
SMTP_USER=apikey
SMTP_PASS=your-sendgrid-api-key
```

## Testing Email Configuration

1. Copy one of the configurations above to your `.env` file
2. Adjust it with your email credentials
3. Test by uploading a transfer receipt
4. Check the user's email inbox for confirmation

## Troubleshooting

### Error: "Invalid login"

- Make sure username and password are correct
- For Gmail, use App Password
- Check if 2FA is active

### Error: "Connection timeout"

- Check SMTP_HOST and SMTP_PORT
- Make sure firewall is not blocking the connection
- Try switching SMTP_SECURE to true/false

### Error: "Message rejected"

- Check the FROM email format
- Make sure the sender domain is verified (for paid services)
- Check recipient's spam folder
