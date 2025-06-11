# Email Configuration Examples

## Gmail Configuration

Untuk menggunakan Gmail sebagai SMTP server:

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_FROM=your-email@gmail.com
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

**Catatan untuk Gmail:**

1. Aktifkan 2-Factor Authentication di akun Gmail
2. Generate App Password di Google Account Settings
3. Gunakan App Password sebagai SMTP_PASS (bukan password biasa)

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

Untuk testing email tanpa mengirim ke email asli:

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

1. Copy salah satu konfigurasi di atas ke file `.env` Anda
2. Sesuaikan dengan kredensial email Anda
3. Test dengan upload bukti transfer
4. Periksa inbox email user untuk konfirmasi

## Troubleshooting

### Error: "Invalid login"

- Pastikan username dan password benar
- Untuk Gmail, gunakan App Password
- Periksa apakah 2FA aktif

### Error: "Connection timeout"

- Periksa SMTP_HOST dan SMTP_PORT
- Pastikan firewall tidak memblokir koneksi
- Coba ganti SMTP_SECURE ke true/false

### Error: "Message rejected"

- Periksa format email FROM
- Pastikan domain sender terverifikasi (untuk service berbayar)
- Periksa spam folder penerima
