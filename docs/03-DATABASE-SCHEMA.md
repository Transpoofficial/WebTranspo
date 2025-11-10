# TRANSPO - Database Schema Documentation

## Database Overview

TRANSPO uses **MySQL** as the primary database with **Prisma** as the ORM. The database schema is designed to support a comprehensive transportation booking system with support for both transport services and tour packages.

## Entity Relationship Diagram (ERD)

```
User (1) ─────────── (*) Order
  │                        │
  │ (1)              (1)   │ (1)
  │                        │
  │                        ├─── (1) Payment ─── (0..1) RefundRequest
  │                        │
  │                        ├─── (0..1) TransportationOrder ─── (*) DestinationTransportation
  │                        │
  │ (*)                    ├─── (0..1) PackageOrder
  │                        │            │
Article                    │            │ (1)
                          │            │
                          │       TourPackage
                          │
                          └─── (0..1) Review
                          
VehicleType (1) ─────────── (*) Order

Achievement (standalone)
TrustedBy (standalone)
Report (standalone)
```

## Core Entities

### User

Stores user account information for customers, admins, and super admins.

```prisma
model User {
  id                  String    @id @default(cuid())
  fullName            String
  email               String    @unique
  password            String?   // Nullable for OAuth users
  phoneNumber         String?
  address             String?
  role                Role      // CUSTOMER, ADMIN, SUPER_ADMIN
  
  // Relationships
  orders              Order[]
  approvedPayments    Payment[] @relation("ApprovedPayments")
  approvedRefunds     RefundRequest[] @relation("ApprovedRefunds")
  articles            Article[] @relation("AuthorArticles")
  
  // Password reset
  resetPasswordToken  String?
  resetPasswordExpiry DateTime?
  
  // Timestamps
  createdAt           DateTime  @default(now())
  updatedAt           DateTime  @default(now()) @updatedAt
}

enum Role {
  CUSTOMER      // Regular user who books services
  ADMIN         // Can manage orders, payments, content
  SUPER_ADMIN   // Full system access
}
```

**Key Features:**
- Unique email constraint for authentication
- Optional password for OAuth users (Google)
- Role-based access control
- Password reset token management
- Audit trail with timestamps

### Order

Central entity representing all bookings (transport or tour packages).

```prisma
model Order {
  id              String               @id @default(cuid())
  userId          String
  user            User                 @relation(fields: [userId], references: [id])
  
  orderType       OrderType            // TRANSPORT or TOUR
  orderStatus     OrderStatus          // PENDING, CONFIRMED, CANCELED, COMPLETED, REFUNDED
  
  // Customer details (denormalized for historical record)
  fullName        String
  phoneNumber     String?
  email           String?
  totalPassengers Int?
  note            String?
  
  // Vehicle info (for TRANSPORT orders)
  vehicleTypeId   String?
  vehicleType     VehicleType?         @relation(fields: [vehicleTypeId], references: [id])
  
  // Relationships (polymorphic via orderType)
  payment         Payment?
  transportation  TransportationOrder?
  packageOrder    PackageOrder?
  review          Review?
  
  // Timestamps
  createdAt       DateTime             @default(now())
  updatedAt       DateTime             @updatedAt
}

enum OrderType {
  TRANSPORT     // Transportation rental
  TOUR          // Tour package
}

enum OrderStatus {
  PENDING       // Order created, awaiting payment
  CONFIRMED     // Payment approved, trip scheduled
  CANCELED      // Canceled by customer or admin
  COMPLETED     // Trip finished successfully
  REFUNDED      // Payment refunded
}
```

**Design Decisions:**
- **Polymorphic relationship**: One order can have either `TransportationOrder` OR `PackageOrder`
- **Denormalized customer data**: Preserves historical record even if user updates profile
- **Soft delete pattern**: Status-based instead of physical deletion

### Payment

Tracks payment transactions for each order.

```prisma
model Payment {
  id                String         @id @default(cuid())
  orderId           String         @unique  // One-to-one with Order
  order             Order          @relation(fields: [orderId], references: [id])
  
  senderName        String          // Name on payment transfer
  transferDate      DateTime        // Date of payment
  proofUrl          String?         // Supabase URL for payment proof image
  paymentStatus     PaymentStatus   // PENDING, APPROVED, REJECTED, REFUNDED
  totalPrice        Decimal        @db.Decimal(12, 2)  // Up to 999,999,999,999.99
  
  // Admin approval tracking
  approvedByAdminId String?
  approvedByAdmin   User?          @relation("ApprovedPayments", fields: [approvedByAdminId], references: [id])
  
  note              String?         // Admin notes
  refundRequest     RefundRequest?
  
  // Timestamps
  createdAt         DateTime       @default(now())
  updatedAt         DateTime       @updatedAt
}

enum PaymentStatus {
  PENDING       // Awaiting admin approval
  APPROVED      // Payment verified and approved
  REJECTED      // Payment proof rejected
  REFUNDED      // Payment has been refunded
}
```

**Key Features:**
- Decimal type for precise monetary calculations
- Audit trail for admin approvals
- Support for refund workflow

### RefundRequest

Manages refund requests and approvals.

```prisma
model RefundRequest {
  id                String       @id @default(cuid())
  paymentId         String       @unique  // One-to-one with Payment
  payment           Payment      @relation(fields: [paymentId], references: [id])
  
  reason            String       // Customer's reason for refund
  requestDate       DateTime     // When refund was requested
  refundStatus      RefundStatus // PENDING, APPROVED, REJECTED
  
  // Admin approval tracking
  approvedByAdminId String?
  approvedByAdmin   User?        @relation("ApprovedRefunds", fields: [approvedByAdminId], references: [id])
  
  // Timestamps
  createdAt         DateTime     @default(now())
  updatedAt         DateTime     @updatedAt
}

enum RefundStatus {
  PENDING       // Awaiting admin review
  APPROVED      // Refund approved
  REJECTED      // Refund rejected
}
```

### TransportationOrder

Details for transportation rental orders.

```prisma
model TransportationOrder {
  id            String                      @id @default(cuid())
  orderId       String                      @unique  // One-to-one with Order
  order         Order                       @relation(fields: [orderId], references: [id])
  
  vehicleCount  Int                         // Number of vehicles rented
  roundTrip     Boolean                     // Is this a round trip?
  totalDistance Float                       // Total distance in kilometers
  
  // Multiple destinations
  destinations  DestinationTransportation[]
  
  // Timestamps
  createdAt     DateTime                    @default(now())
  updatedAt     DateTime                    @updatedAt
}
```

**Design Changes:**
- Removed single `pickupLocation` and `destination` in favor of multiple destinations
- Supports complex multi-stop trips

### DestinationTransportation

Individual destinations for a transportation order.

```prisma
model DestinationTransportation {
  id                    String              @id @default(cuid())
  transportationOrderId String
  transportationOrder   TransportationOrder @relation(fields: [transportationOrderId], references: [id])
  
  // Location data
  lat                   Float?              // Latitude
  lng                   Float?              // Longitude
  address               String              // Full address
  arrivalTime           String?             // Expected arrival time
  
  // Metadata
  isPickupLocation      Boolean             @default(false)  // Is this the pickup point?
  sequence              Int                 @default(0)      // Order of destinations
  departureDate         DateTime?           // Date for this leg of trip
  
  // Timestamps
  createdAt             DateTime            @default(now())
  updatedAt             DateTime            @updatedAt
}
```

**Key Features:**
- Supports multi-day trips with different dates per destination
- Sequence field maintains order of stops
- `isPickupLocation` flag identifies starting point

### PackageOrder

Details for tour package bookings.

```prisma
model PackageOrder {
  id            String      @id @default(cuid())
  orderId       String      @unique  // One-to-one with Order
  order         Order       @relation(fields: [orderId], references: [id])
  
  packageId     String
  package       TourPackage @relation(fields: [packageId], references: [id])
  
  departureDate DateTime    // When the tour starts
  people        Int?        // Number of people (for private trips)
  
  // Timestamps
  createdAt     DateTime    @default(now())
  updatedAt     DateTime    @updatedAt
}
```

### TourPackage

Tour package definitions and pricing.

```prisma
model TourPackage {
  id                String         @id @default(cuid())
  
  // Content
  photoUrl          Json           // Array of image URLs
  name              String
  price             Decimal        @db.Decimal(10, 2)
  description       String         @db.Text
  meetingPoint      String
  
  // Capacity
  minPersonCapacity Int
  maxPersonCapacity Int
  
  // Package details (stored as JSON)
  includes          Json           // Array of included items
  excludes          Json           // Array of excluded items
  itineraries       Json           // Array of daily itinerary
  requirements      Json           // Array of requirements
  tickets           Json?          // Optional ticketing info
  
  is_private        Boolean        // Is this a private tour?
  
  // Relationships
  packageOrders     PackageOrder[]
  
  // Timestamps
  createdAt         DateTime       @default(now())
  updatedAt         DateTime       @updatedAt
}
```

**Design Decisions:**
- JSON fields for flexible nested data structures
- `is_private` determines pricing model:
  - Private: `price × people`
  - Group: fixed `price`

### VehicleType

Vehicle type definitions and pricing.

```prisma
model VehicleType {
  id         String   @id @default(cuid())
  capacity   Int      // Maximum passengers
  pricePerKm Decimal  @db.Decimal(10, 2)  // Rate per kilometer
  name       String   @unique  // e.g., "Angkot", "HIACE Commuter", "ELF"
  
  // Relationships
  orders     Order[]
  
  // Timestamps
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt
}
```

**Current Vehicle Types:**
- Angkot (capacity: 12, rate: ~1000/km)
- HIACE Commuter (capacity: 14, rate: ~2000/km)
- HIACE Premio (capacity: 9, rate: ~2500/km)
- ELF (capacity: 19, rate: ~3000/km)

### Review

Customer reviews for completed orders.

```prisma
model Review {
  id        String   @id @default(cuid())
  orderId   String   @unique  // One-to-one with Order
  order     Order    @relation(fields: [orderId], references: [id])
  
  rating    Int      // 1-5 stars
  content   String   // Review text
  isShow    Boolean  @default(false)  // Admin control for display
  
  // Timestamps
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

**Key Features:**
- `isShow` flag allows admin moderation
- Only for completed orders

## Supporting Entities

### Article

Blog posts and articles (content marketing).

```prisma
model Article {
  id         String   @id @default(cuid())
  title      String
  content    String   @db.Text
  authorId   String
  author     User     @relation("AuthorArticles", fields: [authorId], references: [id])
  mainImgUrl String   // Featured image
  
  // Timestamps
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt
}
```

### Achievement

Company achievements and certifications.

```prisma
model Achievement {
  id           String   @id @default(cuid())
  name         String
  logoUrl      String   // Achievement badge/logo
  displayOrder Int      @default(0)  // For sorting
  isActive     Boolean  @default(true)
  
  // Timestamps
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
}
```

### TrustedBy

Partner and client logos.

```prisma
model TrustedBy {
  id           String   @id @default(cuid())
  name         String
  logoUrl      String   // Partner logo
  displayOrder Int      @default(0)  // For sorting
  isActive     Boolean  @default(true)
  
  // Timestamps
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
}
```

### Report

Automated analytics reports.

```prisma
model Report {
  id                  String       @id @default(cuid())
  reportPeriod        ReportPeriod // DAILY, WEEKLY, MONTHLY, YEARLY
  
  // Date range
  startDate           DateTime
  endDate             DateTime
  
  // Metrics
  totalIncome         Decimal      @db.Decimal(15, 2)
  totalOrders         Int
  completedOrders     Int          @default(0)
  canceledOrders      Int          @default(0)
  pendingOrders       Int          @default(0)
  transportOrders     Int          @default(0)
  tourOrders          Int          @default(0)
  averageRating       Decimal?     @db.Decimal(3, 2)
  
  // JSON aggregated data
  popularDestinations Json?
  topVehicleTypes     Json?
  
  isAutoGenerated     Boolean      @default(true)
  
  // Timestamps
  createdAt           DateTime     @default(now())
  updatedAt           DateTime     @updatedAt
}

enum ReportPeriod {
  DAILY
  WEEKLY
  MONTHLY
  YEARLY
}
```

## Database Indexes

**Recommended indexes for performance:**

```sql
-- User lookups
CREATE INDEX idx_user_email ON User(email);
CREATE INDEX idx_user_role ON User(role);

-- Order queries
CREATE INDEX idx_order_user_id ON Order(userId);
CREATE INDEX idx_order_status ON Order(orderStatus);
CREATE INDEX idx_order_type ON Order(orderType);
CREATE INDEX idx_order_created_at ON Order(createdAt);

-- Payment queries
CREATE INDEX idx_payment_order_id ON Payment(orderId);
CREATE INDEX idx_payment_status ON Payment(paymentStatus);
CREATE INDEX idx_payment_transfer_date ON Payment(transferDate);

-- Destination queries
CREATE INDEX idx_destination_transport_order_id ON DestinationTransportation(transportationOrderId);
CREATE INDEX idx_destination_sequence ON DestinationTransportation(sequence);
CREATE INDEX idx_destination_departure_date ON DestinationTransportation(departureDate);

-- Package queries
CREATE INDEX idx_package_order_package_id ON PackageOrder(packageId);
CREATE INDEX idx_package_order_departure_date ON PackageOrder(departureDate);

-- Review queries
CREATE INDEX idx_review_is_show ON Review(isShow);
```

## Common Queries

### Get Order with All Relations

```typescript
const order = await prisma.order.findUnique({
  where: { id: orderId },
  include: {
    user: true,
    payment: true,
    vehicleType: true,
    transportation: {
      include: {
        destinations: {
          orderBy: { sequence: 'asc' }
        }
      }
    },
    packageOrder: {
      include: {
        package: true
      }
    },
    review: true
  }
});
```

### Get User's Order History

```typescript
const orders = await prisma.order.findMany({
  where: { userId: userId },
  include: {
    payment: true,
    vehicleType: true,
    transportation: {
      include: {
        destinations: {
          orderBy: { sequence: 'asc' }
        }
      }
    },
    packageOrder: {
      include: {
        package: true
      }
    }
  },
  orderBy: { createdAt: 'desc' }
});
```

### Get Pending Payments

```typescript
const pendingPayments = await prisma.payment.findMany({
  where: { paymentStatus: 'PENDING' },
  include: {
    order: {
      include: {
        user: true,
        vehicleType: true,
        transportation: {
          include: {
            destinations: true
          }
        },
        packageOrder: {
          include: {
            package: true
          }
        }
      }
    }
  },
  orderBy: { createdAt: 'asc' }
});
```

### Analytics Query (Income by Period)

```typescript
const analytics = await prisma.order.findMany({
  where: {
    orderStatus: 'COMPLETED',
    createdAt: {
      gte: startDate,
      lte: endDate
    }
  },
  include: {
    payment: true,
    vehicleType: true
  }
});

const totalIncome = analytics.reduce((sum, order) => {
  return sum + Number(order.payment?.totalPrice || 0);
}, 0);
```

## Migration Strategy

### Creating Migrations

```bash
# Create a new migration
pnpm prisma migrate dev --name add_new_feature

# Apply migrations in production
pnpm prisma migrate deploy

# Reset database (development only!)
pnpm prisma migrate reset
```

### Seeding Data

```typescript
// prisma/seed.ts
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Create super admin
  const hashedPassword = await bcrypt.hash('admin123', 10);
  
  await prisma.user.upsert({
    where: { email: 'admin@transpo.id' },
    update: {},
    create: {
      email: 'admin@transpo.id',
      fullName: 'Super Admin',
      password: hashedPassword,
      role: 'SUPER_ADMIN'
    }
  });

  // Seed vehicle types
  await prisma.vehicleType.createMany({
    data: [
      { name: 'Angkot', capacity: 12, pricePerKm: 1000 },
      { name: 'HIACE Commuter', capacity: 14, pricePerKm: 2000 },
      { name: 'HIACE Premio', capacity: 9, pricePerKm: 2500 },
      { name: 'ELF', capacity: 19, pricePerKm: 3000 }
    ],
    skipDuplicates: true
  });
}

main()
  .catch((e) => console.error(e))
  .finally(async () => await prisma.disconnect());
```

## Data Integrity Rules

### Constraints
- **Unique email**: Prevents duplicate user accounts
- **Foreign key cascades**: Proper relationship management
- **Required fields**: Critical data must be present
- **Decimal precision**: Prevents rounding errors in prices

### Validation Rules
- Email format validation (application layer)
- Phone number format validation
- Date range validation (departure date must be in future)
- Price calculations must match database records
- Order status transitions must follow valid workflow

### Audit Trail
- All entities have `createdAt` and `updatedAt` timestamps
- Payment approvals track `approvedByAdminId`
- Refund approvals track `approvedByAdminId`
- Order status changes are tracked

## Backup & Recovery

### Recommended Backup Strategy
- **Daily automated backups** of entire database
- **Point-in-time recovery** capability
- **Backup retention**: 30 days minimum
- **Test restores** quarterly

### Critical Data Priority
1. User accounts and authentication data
2. Order and payment records
3. Tour package configurations
4. Vehicle type configurations
5. Articles and reviews (less critical)

## Performance Considerations

### Query Optimization
- Use `select` to fetch only needed fields
- Use `include` judiciously to avoid over-fetching
- Implement pagination for large result sets
- Add database indexes on frequently queried fields

### Connection Pooling
```typescript
// lib/prisma.ts
import { PrismaClient } from '@prisma/client';

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma = globalForPrisma.prisma || new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
});

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
```

## Future Schema Enhancements

### Planned Additions
- **Driver entity**: Separate driver profiles and assignments
- **Vehicle entity**: Individual vehicle tracking (not just types)
- **Message entity**: In-app messaging between customers and admins
- **Notification entity**: Push notification management
- **Coupon entity**: Discount codes and promotions
- **Rating aggregation**: Cached rating averages for performance
- **Booking calendar**: Availability management

### Potential Optimizations
- Materialized views for analytics
- Full-text search indexes for articles
- Geographic indexes for location-based queries (PostGIS if switching to PostgreSQL)
- Partitioning large tables by date
