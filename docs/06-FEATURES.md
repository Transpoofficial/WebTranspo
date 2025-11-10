# TRANSPO - Features Documentation

## Core Features

## 1. Transportation Booking System

### Overview
Comprehensive vehicle rental system supporting multiple vehicle types with flexible destination management and transparent pricing.

### Supported Vehicle Types

#### Angkot
- **Capacity**: 12 passengers
- **Base Rate**: ~IDR 1,000/km
- **Minimum Booking**: 2 days advance
- **Ideal For**: Small groups, short distances
- **Service Area**: Malang City, Batu, surrounding areas

#### HIACE Commuter
- **Capacity**: 14 passengers
- **Base Rate**: ~IDR 2,000/km
- **Minimum Booking**: 3 days advance
- **Ideal For**: Medium groups, comfort-focused trips
- **Service Area**: Malang Raya region

#### HIACE Premio
- **Capacity**: 9 passengers
- **Base Rate**: ~IDR 2,500/km
- **Minimum Booking**: 3 days advance
- **Ideal For**: Premium small groups, VIP service
- **Service Area**: Malang Raya region

#### ELF
- **Capacity**: 19 passengers
- **Base Rate**: ~IDR 3,000/km
- **Minimum Booking**: 4 days advance
- **Ideal For**: Large groups, long-distance trips
- **Service Area**: All Java (with additional charges outside Malang)
- **Special**: 20% surcharge for destinations outside Malang region

### Booking Features

#### Multi-Destination Support
- Add unlimited destinations
- Set arrival times for each stop
- Automatic route optimization
- Real-time distance calculation using Google Maps

#### Flexible Scheduling
- Multi-day trip support
- Custom departure dates per destination
- Arrival time specification
- Inter-trip charges (30% per additional day beyond first day)

#### Round Trip Options
- Enable/disable round trip
- Automatic price doubling for round trips
- Same or different return date

#### Price Transparency
- Real-time price calculation before booking
- Breakdown of costs:
  - Base fare (distance × rate)
  - Round trip multiplier
  - Inter-trip charges
  - Out-of-region charges (ELF only)
- No hidden fees

#### Area Restrictions
- Angkot: Restricted to Malang City area
- HIACE: Malang Raya region
- ELF: All Java, special pricing outside Malang

### Booking Flow

```
1. Select Vehicle Type
   ↓
2. Add Destinations (with Google Maps autocomplete)
   ↓
3. Set Departure Dates & Times
   ↓
4. View Calculated Price
   ↓
5. Enter Passenger Details
   ↓
6. Confirm Booking
   ↓
7. Upload Payment Proof
   ↓
8. Wait for Admin Approval
   ↓
9. Receive Invoice & Confirmation
```

---

## 2. Tour Package System

### Overview
Pre-designed tour packages with fixed itineraries for popular destinations in Malang region.

### Package Types

#### Group Tours
- **Fixed price** regardless of group size
- Minimum participants required (typically 10-15)
- Join with other tourists
- More affordable
- Set departure dates

#### Private Tours
- **Per-person pricing** (price × number of people)
- Minimum capacity: Usually 2 people
- Maximum capacity: Vehicle-dependent
- Exclusive for your group
- Flexible departure dates

### Package Components

#### Included in Package
- Transportation (specified vehicle type)
- Professional driver/guide
- Entrance tickets (if specified)
- Meals (breakfast/lunch/dinner as specified)
- Travel insurance (if specified)
- Tour guide service
- Photo spots guidance

#### Not Included
- Personal expenses
- Additional meals not specified
- Optional activities
- Tips for guide/driver
- Travel insurance (if not specified)

### Package Details

Each package includes:
- **Description**: Full package overview
- **Itinerary**: Day-by-day schedule with activities
- **Meeting Point**: Pickup location in Malang
- **Duration**: Number of days
- **Capacity**: Min/max participants
- **Requirements**: What to bring (ID, clothing, etc.)
- **Photo Gallery**: Multiple package images
- **Pricing**: Transparent cost breakdown

### Popular Packages

Examples:
- Bromo Sunrise Tour (2D1N)
- Malang City Tour (1 Day)
- Tumpak Sewu Waterfall Tour (1 Day)
- Batu Malang Tour (1 Day)
- Semeru Trekking (3D2N)

---

## 3. User Management

### User Roles

#### Customer
- **Registration**: Email or Google OAuth
- **Permissions**:
  - Create bookings (transport & tour)
  - Upload payment proofs
  - View own orders
  - Submit reviews
  - Update profile
  - Track booking status

#### Admin
- **Creation**: By Super Admin only
- **Permissions**:
  - View all orders
  - Approve/reject payments
  - Update order status
  - Manage tour packages
  - Manage articles
  - View analytics
  - Manage reviews (show/hide)
  - Manage achievements & partnerships

#### Super Admin
- **Permissions**: All admin permissions plus:
  - Create admin accounts
  - Manage vehicle types
  - Delete tour packages
  - Full system access
  - User role management

### Authentication

#### Email/Password
- Secure password hashing (bcrypt)
- Email verification on signup
- Password strength requirements
- Password reset via email token

#### Google OAuth
- One-click registration/login
- Automatic account creation
- Email verification included
- No password required

#### Session Management
- JWT-based sessions
- HTTP-only cookies
- Secure flag in production
- Automatic session refresh
- 30-day session expiration

---

## 4. Payment Management

### Payment Flow

```
1. Order Created → Payment record created (PENDING)
   ↓
2. Customer uploads payment proof
   ↓
3. Admin receives notification
   ↓
4. Admin reviews proof
   ↓
5. Admin approves/rejects payment
   ↓
6. If approved:
   - Generate PDF invoice
   - Send email with invoice
   - Update order status to CONFIRMED
   ↓
7. Customer receives email with invoice PDF
```

### Payment Proof Upload

- **Accepted formats**: JPG, PNG, JPEG
- **Max file size**: 5 MB
- **Stored in**: Supabase Storage (CDN)
- **Includes**:
  - Sender name
  - Transfer date
  - Screenshot of transfer confirmation

### Payment Approval

#### Admin Actions
- View payment proof image
- Approve or reject payment
- Add admin notes
- Track approval timestamp
- See who approved (audit trail)

#### Approval Effects
- **Auto-generated invoice PDF**:
  - Company branding
  - Customer information
  - Order details (destinations/package)
  - Itemized pricing
  - Payment information
  - Unique invoice number (INV-YYYYMMDD-XXXXXXXX)

- **Email notification**:
  - Professional email template
  - PDF invoice attached
  - Payment confirmation
  - Next steps information
  - Contact information

#### Rejection Handling
- Customer notified via email
- Reason for rejection provided
- Can re-upload payment proof
- Order remains PENDING

### Refund System

#### Refund Request
- Customer can request refund
- Must provide reason
- Admin reviews request
- Approve or reject refund

#### Refund Process
```
1. Customer submits refund request
   ↓
2. Admin reviews request & reason
   ↓
3. Admin approves/rejects
   ↓
4. If approved:
   - Payment status → REFUNDED
   - Order status → REFUNDED
   - Customer notified
   ↓
5. Manual bank transfer by admin
```

---

## 5. Order Management

### Order Lifecycle

```
PENDING → CONFIRMED → COMPLETED
   ↓           ↓
CANCELED    REFUNDED
```

#### Status Definitions

**PENDING**
- Initial state after order creation
- Awaiting payment proof upload
- Can be canceled by customer

**CONFIRMED**
- Payment approved by admin
- Trip scheduled
- Cannot be canceled (must request refund)

**COMPLETED**
- Trip finished successfully
- Customer can leave review
- Eligible for future discounts

**CANCELED**
- Canceled before payment approval
- No charges
- Can create new order

**REFUNDED**
- Payment refunded to customer
- Trip canceled
- Refund request approved

### Order Details

Each order includes:
- **Customer Information**: Name, phone, email
- **Vehicle/Package Details**: Type, capacity, pricing
- **Destination Information**: Full address, coordinates, dates
- **Payment Status**: Current payment state
- **Order Notes**: Special requests from customer
- **Timestamps**: Created, updated dates
- **Admin Notes**: Internal notes (if any)

### Order Tracking

Customers can:
- View order status in dashboard
- See payment approval status
- Download invoice (after approval)
- Track order timeline
- Contact admin via WhatsApp

---

## 6. Analytics & Reporting

### Admin Analytics Dashboard

#### Overview Metrics
- Total orders (today/week/month/year)
- Total income
- Pending payments count
- Completed orders count
- Canceled orders count
- Average rating

#### Order Analytics
- Orders by vehicle type
- Orders by order type (transport vs tour)
- Orders over time (line chart)
- Peak booking periods
- Popular destinations
- Booking conversion rate

#### Income Analytics
- Revenue over time
- Revenue by vehicle type
- Revenue by order type
- Income trends (daily/weekly/monthly/yearly)
- Revenue comparison (period over period)

#### Geographic Analytics
- Most popular destinations
- Service area coverage
- Out-of-region bookings (ELF)

#### Customer Analytics
- New vs returning customers
- Customer lifetime value
- Most active customers
- Customer satisfaction ratings

### Automated Reports

#### Report Types
- **Daily**: Generated every midnight
- **Weekly**: Generated every Monday
- **Monthly**: Generated 1st of each month
- **Yearly**: Generated January 1st

#### Report Contents
- Period summary
- Total orders by type
- Income breakdown
- Top performing vehicles
- Popular destinations
- Average ratings
- Status distribution
- Comparative analysis

### Web Vitals Tracking

Real-time performance monitoring:
- **LCP** (Largest Contentful Paint)
- **FID** (First Input Delay)
- **CLS** (Cumulative Layout Shift)
- **FCP** (First Contentful Paint)
- **TTFB** (Time to First Byte)

Data used for:
- Performance optimization
- User experience improvement
- Technical issue detection

---

## 7. Review System

### Review Submission

**Eligibility**:
- Order must be COMPLETED
- One review per order
- Cannot edit after submission

**Review Data**:
- Rating (1-5 stars)
- Written feedback
- Reviewer name (from user profile)
- Date posted
- Associated order ID

### Review Moderation

#### Admin Controls
- **isShow flag**: Admin can hide/show reviews
- Hidden reviews not displayed on homepage
- Moderation for inappropriate content
- Quality control

#### Review Display
- Homepage carousel
- Latest reviews first
- Star rating visualization
- Customer name displayed
- Content limited to 3 lines (with ellipsis)

### Review Analytics
- Average rating calculation
- Rating distribution
- Review trends over time
- Most praised aspects
- Common complaints

---

## 8. Content Management

### Article System

**Purpose**: Content marketing, SEO, customer education

**Features**:
- Rich text content (Markdown/HTML)
- Featured image
- Author attribution
- Publication date
- Article categories (to be added)
- SEO optimization

**Use Cases**:
- Travel tips
- Destination guides
- Company news
- Customer testimonials
- Service updates
- Promotional content

### Achievement Management

**Purpose**: Display company achievements, certifications, awards

**Features**:
- Achievement name
- Logo/badge image
- Display order (for sorting)
- Active/inactive toggle
- Drag-and-drop reordering (to be added)

**Display**: Homepage "Prestasi" section

### Trusted By / Partner Management

**Purpose**: Showcase partnerships, client logos

**Features**:
- Partner name
- Logo image
- Display order
- Active/inactive toggle
- Drag-and-drop reordering (to be added)

**Display**: Homepage "Telah dipercaya oleh" section

---

## 9. Google Maps Integration

### Features

#### Autocomplete
- Real-time address suggestions
- Place details retrieval
- Coordinates extraction
- Formatted address

#### Route Calculation
- Multi-stop route planning
- Distance calculation
- Duration estimation
- Route visualization

#### Map Display
- Interactive map on order page
- Destination markers
- Route polylines
- Custom styling

#### Geocoding
- Address to coordinates
- Coordinates to address
- Place ID lookup

### Use Cases
- Destination selection during booking
- Distance calculation for pricing
- Route visualization for customer
- Admin view of trip routes

---

## 10. Email Notifications

### Email Types

#### Registration Verification
- **Trigger**: New user signup
- **Content**: Welcome message, account details
- **Purpose**: Confirm email address

#### Payment Proof Received
- **Trigger**: Customer uploads payment proof
- **Recipient**: Customer (confirmation)
- **Content**: Thank you message, next steps

#### Payment Approved
- **Trigger**: Admin approves payment
- **Recipient**: Customer
- **Content**: Confirmation, invoice PDF attachment, next steps
- **Attachments**: Invoice PDF

#### Password Reset
- **Trigger**: Forgot password request
- **Content**: Reset link with token
- **Expiration**: 1 hour

### Email Templates

Built with React Email:
- Professional design
- Mobile-responsive
- Company branding
- Clear call-to-action buttons
- Contact information footer

---

## 11. Invoice Generation

### PDF Invoice Features

#### Header
- TRANSPO logo and branding
- Invoice number (unique)
- Invoice date
- Due date (payment date)

#### Customer Information
- Full name
- Email address
- Phone number
- Address (if available)

#### Order Details

**For Transportation**:
- Service type: "Transportasi"
- Vehicle type
- Number of passengers
- List of destinations with dates
- Total distance
- Round trip indicator

**For Tour Packages**:
- Service type: "Paket Wisata"
- Package name
- Destination
- Duration
- Number of participants
- Package highlights

#### Itemized Billing
- Description of service
- Quantity
- Unit price
- Line total
- Subtotal
- Tax (if applicable)
- **Grand Total**

#### Payment Information
- Payment method: Bank Transfer
- Transfer date
- Status: "LUNAS" (PAID)
- Total amount in IDR

#### Company Information
- Company name: TRANSPO
- Contact information
- Website
- Terms & conditions (brief)

---

## 12. SEO & Performance

### SEO Features

#### Meta Tags
- Dynamic title tags
- Meta descriptions
- Open Graph tags (Facebook, LinkedIn)
- Twitter Cards
- Canonical URLs

#### Structured Data
- Organization schema
- Local Business schema
- Breadcrumb schema
- Service schema
- Review schema (to be added)

#### Sitemap & Robots
- Automatic XML sitemap generation
- Updated on build
- Robots.txt configuration
- Page priority settings

#### Performance
- Server-side rendering (SSR)
- Static page generation
- Image optimization
- Code splitting
- Lazy loading

### PWA Features (Basic)
- Web manifest
- App icons (multiple sizes)
- Theme color
- Offline page (to be fully implemented)

---

## 13. User Dashboard

### Customer Dashboard

**Overview**:
- Active orders count
- Pending payments count
- Completed trips count
- Quick actions

**Order Management**:
- View all orders
- Filter by status
- Search orders
- Order details view
- Download invoice (if available)

**Profile Management**:
- Update personal information
- Change password
- Email settings
- Notification preferences (to be added)

### Admin Dashboard

**Overview**:
- Key metrics cards
- Recent orders
- Pending payments alert
- Quick stats

**Order Management**:
- All orders table
- Advanced filtering
- Search functionality
- Bulk actions (to be added)
- Export to Excel (to be added)

**Payment Management**:
- Pending payments queue
- Payment history
- Refund requests
- Financial reports

**Content Management**:
- Tour packages CRUD
- Article management
- Vehicle type settings
- Achievement management
- Partner logo management

**Analytics**:
- Dashboard overview
- Income analytics
- Order analytics
- Performance reports

---

## 14. Animations & UX

### Framer Motion Animations

#### Page Animations
- Fade in on load
- Slide up for sections
- Slide left/right for alternating content
- Stagger children for lists

#### Component Animations
- Scale in for cards
- Hover effects on buttons
- Smooth tab transitions
- Carousel animations

#### Interaction Feedback
- Loading states
- Success/error toast notifications
- Skeleton loaders
- Progress indicators

### User Experience Features
- Responsive design (mobile-first)
- Touch-friendly interfaces
- Keyboard navigation
- Screen reader support (partial)
- Loading states
- Error boundaries

---

## 15. Security Features

### Authentication Security
- Password hashing with bcrypt (10 rounds)
- JWT tokens for sessions
- HTTP-only cookies
- Secure cookie flag in production
- CSRF protection

### Authorization
- Role-based access control (RBAC)
- API endpoint protection
- Frontend route guards
- Resource ownership validation

### Data Security
- Input sanitization (DOMPurify)
- SQL injection prevention (Prisma)
- XSS protection
- Secure file uploads
- Environment variable encryption

### API Security
- CORS configuration
- Request validation (Zod schemas)
- Rate limiting (to be implemented)
- Error message sanitization

---

## Future Features Roadmap

### Short-term (Q1-Q2 2025)
- [ ] Real-time chat with admin
- [ ] SMS notifications
- [ ] Push notifications (PWA)
- [ ] Driver mobile app
- [ ] Driver assignment system
- [ ] Real-time order tracking
- [ ] In-app payment (Midtrans/Xendit)

### Mid-term (Q3-Q4 2025)
- [ ] Customer loyalty program
- [ ] Promo codes & discounts
- [ ] Recurring bookings
- [ ] Corporate accounts
- [ ] Advanced analytics dashboard
- [ ] Export reports to PDF/Excel
- [ ] Multi-language support

### Long-term (2026+)
- [ ] Mobile apps (iOS & Android)
- [ ] AI-powered price optimization
- [ ] Smart route planning
- [ ] Vehicle fleet management
- [ ] Driver performance tracking
- [ ] API for third-party integrations
- [ ] Franchise management system
