# TRANSPO - Admin Guide

## Admin Panel Overview

The admin panel provides comprehensive tools for managing orders, payments, content, and analytics. Access requires ADMIN or SUPER_ADMIN role.

**Access URL**: `https://yourdomain.com/admin`

---

## Getting Started

### Login

1. Navigate to `https://yourdomain.com/auth/signin`
2. Enter admin email and password
3. Click "Sign In"
4. Redirected to admin dashboard

### Admin Dashboard Layout

**Sidebar Navigation**:
- Dashboard (Overview)
- Orders
- Payments (Pending badge)
- Tour Packages
- Vehicle Types
- Articles
- Reviews
- Analytics
- Reports
- Achievements
- Trusted By
- Users
- Settings

---

## Order Management

### Viewing Orders

**Path**: Admin → Orders

**Features**:
- Paginated table view
- Search by customer name, order ID
- Filter by:
  - Order status (All, Pending, Confirmed, Completed, Canceled, Refunded)
  - Order type (All, Transport, Tour)
  - Date range
- Sort by date, status, amount
- Export to CSV (upcoming)

**Order Table Columns**:
- Order ID
- Customer Name
- Order Type (Transport/Tour)
- Vehicle Type / Package Name
- Departure Date
- Total Amount
- Payment Status
- Order Status
- Actions

### Order Details

Click on any order to view:

**Customer Information**:
- Full name
- Phone number
- Email address
- Special requests/notes

**Order Information**:
- Order type
- Order status
- Created date
- Updated date

**For Transportation Orders**:
- Vehicle type
- Number of vehicles
- Total passengers
- Round trip (Yes/No)
- Total distance
- Destination list with:
  - Full address
  - Departure date & time
  - Arrival time
  - Sequence order

**For Tour Package Orders**:
- Package name
- Departure date
- Number of people (for private trips)
- Package inclusions
- Package exclusions
- Itinerary

**Payment Information**:
- Payment ID
- Total price
- Payment status
- Sender name
- Transfer date
- Payment proof (view image)
- Approved by (if approved)
- Admin notes

### Updating Order Status

**Available Actions**:

1. **Confirm Order** (PENDING → CONFIRMED)
   - After payment is approved
   - Trip is scheduled
   
2. **Mark as Completed** (CONFIRMED → COMPLETED)
   - After trip is finished
   - Customer can now leave review
   
3. **Cancel Order** (PENDING/CONFIRMED → CANCELED)
   - Provide cancellation reason
   - Customer is notified
   
4. **Process Refund** (COMPLETED → REFUNDED)
   - After refund request approved
   - Manual bank transfer required

**How to Update**:
1. Open order details
2. Click "Update Status" button
3. Select new status from dropdown
4. Add note (optional but recommended)
5. Click "Save"
6. Confirmation message appears

---

## Payment Management

### Payment Approval Workflow

This is the **most critical admin task**. Proper payment approval ensures customer satisfaction and operational efficiency.

#### Step 1: View Pending Payments

**Path**: Admin → Orders (filter by Payment Status: Pending)

**Indicators**:
- Badge on "Orders" sidebar item showing count
- Orders with "Pending" payment status
- Orange/yellow status badge

#### Step 2: Review Payment Proof

For each pending payment:

1. **Open order details**
2. **View payment proof image**:
   - Click on proof URL to open full image
   - Verify transfer amount matches order total
   - Check sender name matches customer name (approximately)
   - Verify transfer date is recent
   
3. **Check for red flags**:
   - ❌ Amount mismatch
   - ❌ Transfer to wrong account
   - ❌ Suspicious/edited image
   - ❌ Very old transfer date
   - ❌ Different sender without explanation

#### Step 3: Approve or Reject Payment

**To Approve**:
1. Click "Update Payment Status" button
2. Select "APPROVED" from dropdown
3. Add admin note (optional): "Payment verified, amount correct"
4. Click "Save"

**What Happens Automatically**:
- ✅ Payment status → APPROVED
- ✅ Order status → CONFIRMED
- ✅ PDF invoice is generated
- ✅ Email sent to customer with invoice attachment
- ✅ Approval timestamp recorded
- ✅ Your admin ID recorded as approver

**Customer Receives**:
- Email with subject: "Pembayaran Disetujui - Invoice Terlampir - TRANSPO"
- PDF invoice attached (filename: Invoice-INV-YYYYMMDD-XXXXXXXX.pdf)
- Next steps and contact information

**To Reject**:
1. Click "Update Payment Status" button
2. Select "REJECTED" from dropdown
3. **Add admin note** (REQUIRED): Explain reason clearly
   - Example: "Transfer amount incorrect. Please re-upload with correct amount."
   - Example: "Payment proof image unclear. Please upload clearer photo."
4. Click "Save"

**What Happens**:
- Payment status → REJECTED
- Order status → remains PENDING
- Customer can upload new payment proof
- Customer receives email explaining rejection

### Invoice Details

When payment is approved, the system generates a professional PDF invoice containing:

**Header**:
- TRANSPO logo and branding
- Invoice number: `INV-YYYYMMDD-XXXXXXXX`
- Invoice date (payment approval date)
- Due date (same as payment date)

**Customer Section**:
- Customer full name
- Email address
- Phone number
- Address (if provided)

**Order Details**:

*For Transportation*:
```
Service: Transportasi
Vehicle: Angkot / HIACE Commuter / HIACE Premio / ELF
Passengers: [number]
Round Trip: Yes/No

Destinations:
1. [Address] - [Date & Time]
2. [Address] - [Date & Time]
...

Total Distance: [X] km
```

*For Tour Packages*:
```
Service: Paket Wisata
Package: [Package Name]
Destination: [Destination]
Duration: [X] days
Participants: [number]
```

**Itemized Bill**:
| Description | Qty | Unit Price | Total |
|-------------|-----|------------|-------|
| [Service] | 1 | IDR XXX | IDR XXX |

**Payment Info**:
- Payment Method: Bank Transfer
- Transfer Date: [Date]
- Status: LUNAS (PAID)
- Total: IDR XXX,XXX

**Footer**:
- TRANSPO contact information
- Thank you message

### Payment Issues & Troubleshooting

#### Issue: Email Not Sent After Approval

**Cause**: SMTP configuration error or email server down

**Solution**:
1. Check application logs for error details
2. Verify SMTP settings in `.env` file
3. Payment is still approved (data saved)
4. Manually send invoice to customer via regular email
5. Contact developer if issue persists

#### Issue: PDF Not Generated

**Cause**: Missing order data or server error

**Solution**:
1. Status update will fail with error message
2. Check that order has complete data (vehicle type, destinations, etc.)
3. Try again or contact developer
4. Do not approve payment if PDF generation fails

#### Issue: Customer Says They Didn't Receive Email

**Checklist**:
1. ✅ Ask customer to check spam/junk folder
2. ✅ Verify email address in order is correct
3. ✅ Check server logs to confirm email was sent
4. ✅ Resend manually if needed
5. ✅ Consider sending via WhatsApp as backup

#### Issue: Wrong Amount Approved

**Action**:
1. If amount is significantly different, contact customer
2. Can reject payment and ask for correction
3. Or create adjustment order for difference
4. Document in admin notes

---

## Tour Package Management

### Creating Tour Package

**Path**: Admin → Tour Packages → Create New

**Required Fields**:
- Package name
- Description (rich text)
- Meeting point
- Price (base price)
- Minimum capacity
- Maximum capacity
- Package type: Group (fixed price) or Private (per person)

**Optional Fields**:
- Package photos (multiple)
- Ticket information

**Dynamic Fields**:
- Inclusions (add/remove items)
- Exclusions (add/remove items)
- Requirements (add/remove items)
- Itinerary (add days with activities)

**Steps**:
1. Fill in basic information
2. Upload photos (recommended: 3-5 high-quality photos)
3. Add inclusions: Transportation, meals, tickets, guide, insurance, etc.
4. Add exclusions: Personal expenses, optional activities, tips, etc.
5. Add requirements: ID card, clothing, health certificate, etc.
6. Build itinerary:
   - Add Day 1, Day 2, etc.
   - For each day, add activities with times
   - Example: "02:00 - Pickup from meeting point"
7. Click "Create Package"

**Tips**:
- Use clear, descriptive names
- Include high-quality photos showing destinations
- Be specific about what's included/excluded
- Set realistic capacity limits
- Price competitively

### Editing Tour Package

1. Go to Tour Packages list
2. Click "Edit" on package
3. Modify any fields
4. Click "Update Package"
5. Changes are live immediately

**Note**: Editing package doesn't affect existing orders, only new bookings.

### Deleting Tour Package

**Access**: SUPER_ADMIN only

**Warning**: This action cannot be undone!

**Before Deleting**:
- Check if there are active orders for this package
- Consider deactivating instead of deleting
- Export package data for records

**To Delete**:
1. Open package details
2. Click "Delete Package" button
3. Confirm deletion
4. Package is permanently removed

---

## Vehicle Type Management

### Viewing Vehicle Types

**Path**: Admin → Vehicle Types

**Default Vehicle Types**:
- Angkot (12 passengers, ~IDR 1,000/km)
- HIACE Commuter (14 passengers, ~IDR 2,000/km)
- HIACE Premio (9 passengers, ~IDR 2,500/km)
- ELF (19 passengers, ~IDR 3,000/km)

### Creating Vehicle Type

**Access**: SUPER_ADMIN only

**Use Case**: Adding new vehicle type (e.g., Mini Bus, Luxury Van)

**Fields**:
- Name: Vehicle type name (must be unique)
- Capacity: Maximum number of passengers
- Price per km: Rate in IDR

**Steps**:
1. Click "Create Vehicle Type"
2. Enter name, capacity, and rate
3. Click "Save"
4. New vehicle type available for booking immediately

### Updating Vehicle Type

**Access**: SUPER_ADMIN only

**Common Use Cases**:
- Price adjustment
- Capacity correction
- Name standardization

**Steps**:
1. Click "Edit" on vehicle type
2. Modify fields
3. Click "Update"

**Note**: Price changes only affect new orders, not existing ones.

### Deleting Vehicle Type

**Access**: SUPER_ADMIN only

**⚠️ Warning**: Cannot delete if there are orders using this vehicle type.

**Recommended**: Instead of deleting, create new vehicle type and stop promoting the old one.

---

## Article Management

### Creating Article

**Path**: Admin → Articles → Create New

**Purpose**: Content marketing, SEO, customer education

**Fields**:
- Title: Article headline
- Content: Full article text (rich text editor)
- Featured image: Main article image (URL)
- Author: Auto-filled with your name

**Steps**:
1. Enter compelling title
2. Write article content
   - Use headings (H2, H3) for structure
   - Add images for engagement
   - Keep paragraphs short
3. Upload or provide URL for featured image
4. Click "Publish"

**Best Practices**:
- Focus on topics related to Malang tourism
- Include practical tips and advice
- Optimize for SEO (keywords in title and content)
- Add internal links to tour packages
- Publish regularly (weekly recommended)

### Editing Article

1. Go to Articles list
2. Click "Edit" on article
3. Modify content
4. Click "Update"

### Deleting Article

1. Open article
2. Click "Delete"
3. Confirm deletion
4. Article removed (update sitemap after)

---

## Review Management

### Viewing Reviews

**Path**: Admin → Reviews

**Table Shows**:
- Customer name
- Order ID
- Rating (1-5 stars)
- Review text
- Date submitted
- Visibility status (Shown/Hidden)
- Actions

### Review Moderation

**Purpose**: Quality control, hide inappropriate content

**To Show Review** (make visible on homepage):
1. Find review in list
2. Click "Show" toggle
3. Review now appears on homepage

**To Hide Review**:
1. Click "Hide" toggle
2. Review hidden from public view
3. Still visible in admin panel

**Reasons to Hide**:
- Inappropriate language
- Spam content
- False claims
- Competitor manipulation
- Off-topic content

### Responding to Reviews

**Not yet implemented**. Future feature:
- Admin can reply to reviews
- Reply shows below review on homepage
- Professional response templates

---

## Analytics Dashboard

### Overview Page

**Path**: Admin → Dashboard

**Key Metrics Cards**:
- Total Orders (today/week/month/year)
- Completed Orders
- Pending Orders
- Canceled Orders
- Total Income
- Average Rating

**Charts**:
- Order trends over time
- Income trends
- Orders by vehicle type (pie chart)
- Orders by status (bar chart)

**Recent Activity**:
- Latest orders
- Pending payments
- Recent reviews

### Income Analytics

**Path**: Admin → Analytics → Income

**Features**:
- Date filter: Today, Week, Month, Year, Custom range
- Filter by:
  - Order type (Transport, Tour)
  - Vehicle type
  - Tour type (for tour orders)

**Visualizations**:
- Line chart: Income over time
- Bar chart: Income by period (day/week/month)
- Comparison: Period over period growth

**Insights**:
- Total income for period
- Average order value
- Highest revenue day/vehicle
- Growth percentage

### Order Analytics

**Path**: Admin → Analytics → Order

**Metrics**:
- Total orders
- Orders by type (Transport vs Tour)
- Orders by status
- Orders by vehicle type
- Peak booking times
- Booking conversion rate (upcoming)

**Charts**:
- Order volume trends
- Status distribution (pie chart)
- Vehicle type distribution
- Day-of-week patterns

---

## User Management

### Viewing Users

**Path**: Admin → Users

**Access**: ADMIN, SUPER_ADMIN

**User List Shows**:
- Full name
- Email
- Role (Customer, Admin, Super Admin)
- Phone number
- Registration date
- Total orders

**Filters**:
- By role
- By registration date
- Search by name/email

### Creating Admin Account

**Access**: SUPER_ADMIN only

**Steps**:
1. Click "Create Admin"
2. Enter details:
   - Full name
   - Email
   - Password (secure)
   - Role (ADMIN or SUPER_ADMIN)
3. Click "Create"
4. New admin can now login

**Default Password**: Set in `ACCOUNT_DEFAULT_PASSWORD` env variable, must be changed on first login.

### User Roles

**CUSTOMER**:
- Created via signup or Google OAuth
- Can book and pay
- Cannot access admin panel

**ADMIN**:
- Created by Super Admin
- Can manage orders, payments, content
- Cannot create other admins
- Cannot delete vehicle types/tour packages

**SUPER_ADMIN**:
- Full system access
- Can create admin accounts
- Can modify system settings
- Should be limited to 1-2 people

### Editing User

**Use Cases**:
- Correct typos in name
- Update phone number
- Reset password (via forgot password flow)

**To Edit**:
1. Find user in list
2. Click "Edit"
3. Modify allowed fields
4. Click "Update"

**Note**: Cannot change user's email or role (must create new account).

---

## Achievement & Partnership Management

### Managing Achievements

**Path**: Admin → Achievements

**Purpose**: Display company achievements on homepage

**Fields**:
- Achievement name
- Logo/badge image URL
- Display order (lower number = higher position)
- Active status (show/hide)

**To Add Achievement**:
1. Click "Create Achievement"
2. Enter name (e.g., "PTNBH Award 2024")
3. Upload or provide logo image URL
4. Set display order
5. Enable "Active" toggle
6. Click "Save"

**To Reorder**:
1. Edit achievement
2. Change display order number
3. Save

**Best Practices**:
- Use high-quality, transparent PNG logos
- Keep achievement names concise
- Update regularly with new achievements

### Managing Partners (Trusted By)

**Path**: Admin → Trusted By

**Purpose**: Show partnership logos on homepage

**Process**: Same as achievements

**Tips**:
- Get partner permission before displaying logo
- Use official logos
- Arrange by importance/size of partnership

---

## Best Practices

### Daily Admin Tasks

**Morning (9 AM)**:
1. Check pending payments
2. Review and approve valid payments
3. Respond to customer inquiries
4. Check for new orders

**Afternoon (2 PM)**:
5. Review any new pending payments
6. Update order statuses (completed trips)
7. Check for refund requests

**Evening (6 PM)**:
8. Final check for pending payments
9. Review analytics for the day
10. Plan for next day

### Weekly Admin Tasks

**Monday**:
- Review weekly analytics
- Plan content (articles)
- Check inventory (vehicle availability - manual for now)

**Wednesday**:
- Publish new article
- Review and moderate reviews

**Friday**:
- Prepare weekend orders
- Send reminders to customers with weekend trips

**Sunday**:
- Review week's performance
- Generate weekly report

### Monthly Admin Tasks

- Review monthly analytics
- Update tour packages (seasonal)
- Check and update vehicle pricing if needed
- Review and hide old articles
- Backup database
- Check system performance

---

## Troubleshooting

### Cannot Login to Admin

**Solutions**:
1. Verify you're using admin email (not customer)
2. Check password is correct
3. Try password reset
4. Verify account role is ADMIN or SUPER_ADMIN
5. Contact Super Admin

### Payment Approval Failed

**Check**:
1. Order has complete data?
2. Internet connection stable?
3. SMTP settings correct?
4. Try again or contact developer

### Cannot Upload Images

**Check**:
1. File size under 5MB?
2. File format is JPG/PNG?
3. Supabase storage configured?
4. Internet connection stable?

### Analytics Not Loading

**Solutions**:
1. Refresh page
2. Clear browser cache
3. Check date filter is valid
4. Contact developer if persists

---

## Security Guidelines

### Password Security

- Use strong, unique password
- Minimum 12 characters
- Mix of uppercase, lowercase, numbers, symbols
- Change password every 90 days
- Never share with others

### Account Security

- Log out after each session
- Don't use public computers
- Enable 2FA (when available)
- Report suspicious activity

### Data Privacy

- Don't share customer data externally
- Follow GDPR/privacy regulations
- Secure payment proof images
- Delete outdated data regularly

### Access Control

- Only grant admin access to trusted staff
- Review user permissions regularly
- Remove access when staff leaves
- Audit admin actions periodically

---

## Getting Help

### Support Channels

**Technical Issues**:
- Email: admin@transpo.id
- Developer contact: [developer email]

**Business Questions**:
- Management team
- WhatsApp: +62 822-3137-8326

### Documentation

- API Documentation: `/docs/04-API-DOCUMENTATION.md`
- Database Schema: `/docs/03-DATABASE-SCHEMA.md`
- Deployment Guide: `/docs/05-DEPLOYMENT-GUIDE.md`

### Training

New admins should:
1. Read this guide thoroughly
2. Shadow experienced admin for 1 week
3. Practice in staging environment
4. Review recorded training sessions (if available)
5. Ask questions frequently

---

## Keyboard Shortcuts

**Navigation**:
- `Ctrl/Cmd + K`: Global search (upcoming)

**Actions**:
- `Ctrl/Cmd + S`: Save form
- `Esc`: Close modal/dialog
- `Enter`: Submit form

---

## Admin Checklist

### New Admin Onboarding

- [ ] Account created by Super Admin
- [ ] Login credentials received
- [ ] Changed default password
- [ ] Reviewed admin guide
- [ ] Shadowed experienced admin
- [ ] Practiced payment approval
- [ ] Understands order lifecycle
- [ ] Knows emergency contacts

### Before Going On Leave

- [ ] Notify other admins
- [ ] Clear pending payments
- [ ] Update order statuses
- [ ] Set out-of-office message
- [ ] Delegate urgent tasks

### Monthly Security Review

- [ ] Review admin accounts
- [ ] Check for suspicious activity
- [ ] Update passwords
- [ ] Review access logs
- [ ] Test backup restoration

---

This admin guide should be printed or bookmarked for easy reference. Keep it updated as new features are added!
