# 📧 Admin Guide: Payment Approval dengan PDF Invoice

## Overview

Fitur ini secara otomatis mengirimkan email konfirmasi pembayaran beserta PDF invoice ketika admin menyetujui pembayaran customer.

## 🔄 Workflow untuk Admin

### 1. Melihat Payment yang Perlu Diproses

1. Login ke admin panel
2. Navigasi ke menu **Payments** atau **Orders**
3. Filter payments dengan status **PENDING**
4. Klik payment yang ingin diproses

### 2. Menyetujui Pembayaran

1. Buka detail payment
2. Klik tombol **Update Status**
3. Pilih **APPROVED** dari dropdown
4. Klik **Save** atau **Update**

### 3. Apa yang Terjadi Secara Otomatis

✅ **Status payment berubah ke APPROVED**  
✅ **PDF invoice dibuat secara otomatis**  
✅ **Email dikirim ke customer dengan attachment PDF**  
✅ **Log aktivitas tercatat di sistem**

## 📄 Detail PDF Invoice yang Digenerate

### Header

- Logo dan nama perusahaan TRANSPO
- Nomor invoice (format: INV-YYYYMMDD-XXXXXXXX)
- Tanggal invoice
- Due date

### Customer Information

- Nama lengkap customer
- Email
- No. telepon
- Alamat

### Order Details

**Untuk Transport Orders:**

- Jenis layanan: Transportasi
- Jenis kendaraan
- Jumlah penumpang
- Daftar destinasi dengan jadwal
- Total jarak perjalanan

**Untuk Tour Packages:**

- Jenis layanan: Paket Wisata
- Nama paket wisata
- Destinasi wisata
- Durasi paket
- Jumlah peserta

### Payment Information

- Metode pembayaran
- Tanggal pembayaran
- Status: LUNAS
- Total amount dalam Rupiah

## 📧 Email Template yang Dikirim

### Subject

"Pembayaran Disetujui - Invoice Terlampir - TRANSPO"

### Konten Email

- Ucapan selamat atas persetujuan pembayaran
- Detail pembayaran (layanan, total, nomor invoice, tanggal)
- Informasi bahwa invoice terlampir
- Informasi koordinasi selanjutnya
- Button CTA ke dashboard customer

### Attachment

- File PDF invoice dengan nama: `Invoice-[NOMOR_INVOICE].pdf`

## 🚨 Error Handling

### Jika Email Gagal Dikirim

- ✅ Status payment tetap ter-update ke APPROVED
- ❌ Email tidak terkirim (logged sebagai error)
- 📝 Admin bisa mengirim email manual jika diperlukan

### Jika PDF Gagal Generate

- ❌ Status payment tidak ter-update
- ❌ Email tidak terkirim
- 📝 Error message ditampilkan ke admin

## 🔧 Troubleshooting

### Problem: Email tidak terkirim

**Possible Causes:**

- SMTP configuration error
- Invalid customer email
- Email server down

**Solutions:**

1. Check environment variables (SMTP\_\*)
2. Verify customer email format
3. Check server logs
4. Try sending manual email

### Problem: PDF tidak terbentuk

**Possible Causes:**

- Missing payment data
- Corrupted order information
- jsPDF library error

**Solutions:**

1. Check payment has complete order data
2. Verify all required fields exist
3. Check console logs for detailed error
4. Restart application if needed

### Problem: Customer tidak terima email

**Check List:**

- ✅ Spam folder customer
- ✅ Email address correct
- ✅ SMTP logs untuk delivery status
- ✅ Server logs untuk sending attempts

## 📊 Monitoring dan Logs

### Server Logs

Fitur ini akan log aktivitas berikut:

```
✅ Payment approval email sent for payment ID: [ID]
❌ Failed to send approval email for payment [ID]: [ERROR]
📄 Invoice PDF generated for payment: [ID]
```

### Database Changes

- Payment status updated dari PENDING → APPROVED
- Timestamp updated pada payment record
- No additional tables/fields required

## 🧪 Testing

### Manual Testing

1. Buat test order sebagai customer
2. Upload bukti pembayaran
3. Login sebagai admin
4. Approve payment tersebut
5. Check email customer untuk invoice

### Script Testing

```bash
# List pending payments
npm run test:payment-approval list

# Test email sending (tanpa update status)
npm run test:payment-approval test

# Test email sending + update status
npm run test:payment-approval test --update-status
```

## ⚙️ Configuration

### Required Environment Variables

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM="TRANSPO <noreply@transpo.com>"
SMTP_SECURE=false
```

### Optional Customizations

- Company address di PDF (edit `src/lib/pdf-generator.ts`)
- Email template design (edit `src/components/email/payment-approval.tsx`)
- Invoice number format (edit `generateInvoiceNumber` function)

## 💡 Tips untuk Admin

1. **Batch Processing**: Anda bisa approve multiple payments sekaligus. Email akan dikirim untuk setiap approval.

2. **Invoice Numbers**: System otomatis generate unique invoice numbers. Format: INV-YYYYMMDD-XXXXXXXX

3. **Customer Follow-up**: Setelah email dikirim, tim bisa follow-up dengan customer untuk koordinasi jadwal.

4. **Record Keeping**: PDF invoice juga tersimpan di email records untuk keperluan dokumentasi.

5. **Double Check**: Selalu verify data order sebelum approve, karena invoice akan reflect data yang ada di sistem.

## 📞 Support

Jika ada masalah dengan fitur ini:

1. Check logs di console browser dan server
2. Verify SMTP configuration
3. Contact developer dengan error message lengkap
4. Sertakan payment ID yang bermasalah
