# TRANSPO - Development Guide

## Development Environment Setup

### Prerequisites

**Required**:
- Node.js 20.x or later
- pnpm 8.x or later
- MySQL 8.0+ (or TiDB Cloud account)
- Git
- VS Code (recommended) or your preferred IDE

**Recommended VS Code Extensions**:
- ESLint
- Prettier
- Prisma
- Tailwind CSS IntelliSense
- ES7+ React/Redux/React-Native snippets

### Initial Setup

```bash
# Clone repository
git clone https://github.com/Transpoofficial/WebTranspo.git
cd WebTranspo

# Install dependencies
pnpm install

# Copy environment file
cp .env.example .env

# Configure .env file (see below)

# Generate Prisma Client
pnpm prisma generate

# Run migrations
pnpm prisma migrate dev

# Seed database
pnpm prisma db seed

# Start development server
pnpm dev
```

### Environment Configuration

Create `.env` file with development settings:

```bash
# Database (local MySQL)
DATABASE_URL="mysql://root:password@localhost:3306/transpo_dev"

# NextAuth
NEXTAUTH_SECRET="dev-secret-change-in-production"
NEXTAUTH_URL="http://localhost:3000"

# Supabase (create free account)
SUPABASE_HOST="your-project-id"
SUPABASE_URL="https://your-project-id.supabase.co"
SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"
SUPABASE_BUCKET="transpo-dev"

# Google OAuth (optional for development)
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""

# Google Maps API
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY="your-dev-api-key"
NEXT_PUBLIC_GOOGLE_MAPS_API_URL="https://maps.googleapis.com/maps/api/js?key=YOUR_KEY&callback=console.debug&libraries=maps,marker&v=beta"

# Email (Mailtrap for development)
SMTP_HOST="sandbox.smtp.mailtrap.io"
SMTP_PORT=2525
SMTP_FROM="noreply@transpo.local"
SMTP_SECURE=false
SMTP_USER="your-mailtrap-user"
SMTP_PASS="your-mailtrap-pass"

# Development
NEXT_PUBLIC_BASE_URL="http://localhost:3000"
ACCOUNT_DEFAULT_PASSWORD="admin123"
```

### Running the Application

```bash
# Development server with Turbopack (fast)
pnpm dev

# Production build
pnpm build

# Start production server
pnpm start

# Linting
pnpm lint
```

### Database Management

```bash
# Open Prisma Studio (database GUI)
pnpm prisma studio

# Create migration
pnpm prisma migrate dev --name add_new_feature

# Reset database (CAUTION: deletes all data)
pnpm prisma migrate reset

# Seed database
pnpm prisma db seed

# Pull schema from existing database
pnpm prisma db pull

# Generate Prisma Client
pnpm prisma generate
```

---

## Project Structure

```
transpo-v1/
├── prisma/
│   ├── schema.prisma          # Database schema
│   ├── seed.ts                # Database seed script
│   └── migrations/            # Migration history
│
├── public/
│   ├── images/               # Static images
│   ├── icons/                # Icons and logos
│   ├── manifest.json         # PWA manifest
│   ├── robots.txt            # SEO robots file
│   └── sitemap.xml           # Generated sitemap
│
├── src/
│   ├── app/                  # Next.js 15 App Router
│   │   ├── layout.tsx        # Root layout
│   │   ├── page.tsx          # Homepage
│   │   ├── globals.css       # Global styles
│   │   │
│   │   ├── admin/            # Admin panel
│   │   │   ├── layout.tsx    # Admin layout with sidebar
│   │   │   ├── page.tsx      # Admin dashboard
│   │   │   ├── order/        # Order management
│   │   │   ├── analytics/    # Analytics pages
│   │   │   └── ...
│   │   │
│   │   ├── api/              # API routes
│   │   │   ├── auth/         # Authentication endpoints
│   │   │   ├── orders/       # Order CRUD
│   │   │   ├── payments/     # Payment management
│   │   │   └── ...
│   │   │
│   │   ├── auth/             # Auth pages (signin, signup)
│   │   ├── dashboard/        # User dashboard
│   │   ├── order/            # Order pages
│   │   │   ├── transport/    # Transport booking
│   │   │   └── tour-package/ # Tour package booking
│   │   ├── settings/         # User settings
│   │   └── components/       # Page-specific components
│   │
│   ├── components/           # Reusable components
│   │   ├── ui/              # Base UI components (shadcn/ui)
│   │   ├── custom/          # Custom business components
│   │   ├── email/           # Email templates (React Email)
│   │   ├── header.tsx       # Site header
│   │   └── footer.tsx       # Site footer
│   │
│   ├── lib/                 # Utility libraries
│   │   ├── auth.ts          # Authentication helpers
│   │   ├── prisma.ts        # Prisma client instance
│   │   ├── utils.ts         # General utilities
│   │   ├── email-templates.ts  # Email sending logic
│   │   ├── nodemailer.ts    # SMTP configuration
│   │   ├── pdf-generator.ts # Invoice PDF generation
│   │   └── payment-approval.ts # Payment workflow
│   │
│   ├── utils/               # Helper functions
│   │   ├── calculation-monitoring.ts  # Price calculation
│   │   ├── google-maps.ts   # Google Maps integration
│   │   ├── validation.ts    # Form validation
│   │   └── schema/          # Zod schemas
│   │
│   ├── hooks/               # Custom React hooks
│   │   ├── use-debounce.ts
│   │   ├── use-media-query.ts
│   │   └── use-mobile.ts
│   │
│   ├── providers/           # Context providers
│   │   ├── NextAuthProviders.tsx  # NextAuth session provider
│   │   └── ReactQueryProvider.tsx # TanStack Query provider
│   │
│   └── middleware.ts        # Next.js middleware (auth)
│
├── types/                   # TypeScript type definitions
│   ├── next-auth.d.ts       # Extend NextAuth types
│   ├── supabase.d.ts        # Supabase types
│   └── ...
│
├── docs/                    # Documentation
├── .env                     # Environment variables (gitignored)
├── .env.example             # Environment template
├── .gitignore
├── components.json          # shadcn/ui configuration
├── docker-compose.yaml      # Docker composition
├── Dockerfile               # Docker image definition
├── eslint.config.mjs        # ESLint configuration
├── next.config.ts           # Next.js configuration
├── next-sitemap.config.js   # Sitemap generation config
├── nginx.conf               # Nginx configuration
├── package.json             # Dependencies
├── pnpm-lock.yaml           # Dependency lock file
├── postcss.config.mjs       # PostCSS configuration
├── README.md                # Project README
├── tailwind.config.ts       # Tailwind CSS configuration
└── tsconfig.json            # TypeScript configuration
```

---

## Development Workflow

### Git Workflow

We follow a **Git Flow** inspired workflow:

**Branches**:
- `main`: Production-ready code
- `develop`: Integration branch
- `feature/*`: New features
- `fix/*`: Bug fixes
- `chore/*`: Maintenance tasks

**Workflow**:
```bash
# Start new feature
git checkout develop
git pull origin develop
git checkout -b feature/add-new-feature

# Make changes, commit frequently
git add .
git commit -m "feat: add new feature description"

# Push to remote
git push origin feature/add-new-feature

# Create Pull Request on GitHub
# After review and approval, merge to develop

# Deploy to production
git checkout main
git merge develop
git push origin main
```

**Commit Message Convention**:
```
feat: Add new feature
fix: Fix bug in payment approval
docs: Update API documentation
style: Format code with prettier
refactor: Restructure order component
test: Add tests for price calculation
chore: Update dependencies
```

### Code Review Process

1. **Create Pull Request**
   - Clear title and description
   - Reference related issue
   - Add screenshots for UI changes
   
2. **Review Checklist**
   - Code follows style guide
   - No console.log statements
   - Error handling implemented
   - Types are properly defined
   - Comments for complex logic
   - Tests pass (when available)
   
3. **Approval**
   - At least one approval required
   - Address all comments
   - Squash commits if messy
   - Merge to target branch

---

## Coding Standards

### TypeScript Guidelines

**Type Safety**:
```typescript
// ✅ Good: Explicit types
interface OrderData {
  fullName: string;
  phoneNumber?: string;
  totalPrice: number;
}

const order: OrderData = {
  fullName: "John Doe",
  totalPrice: 255000
};

// ❌ Bad: Implicit any
const order = {
  fullName: "John Doe",
  totalPrice: 255000
};
```

**Null Handling**:
```typescript
// ✅ Good: Handle null explicitly
const user = await prisma.user.findUnique({
  where: { id: userId }
});

if (!user) {
  return NextResponse.json(
    { message: "User not found" },
    { status: 404 }
  );
}

// ❌ Bad: Assume non-null
const userName = user.fullName; // Potential error
```

**Type Inference**:
```typescript
// ✅ Good: Let TypeScript infer when obvious
const count = 10;
const isActive = true;

// ✅ Good: Explicit when helpful
const price: Decimal = new Decimal("255000");
```

### React Best Practices

**Component Structure**:
```typescript
// ✅ Good: Clear, documented component
import { useState } from 'react';
import { Button } from '@/components/ui/button';

interface OrderButtonProps {
  orderId: string;
  onSuccess: () => void;
}

export function OrderButton({ orderId, onSuccess }: OrderButtonProps) {
  const [loading, setLoading] = useState(false);
  
  const handleClick = async () => {
    setLoading(true);
    try {
      await confirmOrder(orderId);
      onSuccess();
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <Button onClick={handleClick} disabled={loading}>
      {loading ? 'Loading...' : 'Confirm Order'}
    </Button>
  );
}
```

**Hooks**:
```typescript
// ✅ Good: Custom hooks for reusable logic
function useOrder(orderId: string) {
  const { data, isLoading, error } = useQuery({
    queryKey: ['order', orderId],
    queryFn: () => fetchOrder(orderId)
  });
  
  return { order: data, isLoading, error };
}

// Usage
function OrderPage({ orderId }: { orderId: string }) {
  const { order, isLoading, error } = useOrder(orderId);
  
  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorMessage error={error} />;
  if (!order) return <NotFound />;
  
  return <OrderDetails order={order} />;
}
```

**Server vs Client Components**:
```typescript
// ✅ Server Component (default): No "use client"
// For data fetching, static content
async function OrderPage({ params }: { params: { id: string } }) {
  const order = await prisma.order.findUnique({
    where: { id: params.id }
  });
  
  return <OrderDetails order={order} />;
}

// ✅ Client Component: "use client" directive
// For interactivity, hooks, event handlers
'use client';

import { useState } from 'react';

export function InteractiveForm() {
  const [value, setValue] = useState('');
  
  return (
    <input
      value={value}
      onChange={(e) => setValue(e.target.value)}
    />
  );
}
```

### API Route Guidelines

**Structure**:
```typescript
// src/app/api/orders/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { checkAuth } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    // 1. Authentication
    const token = await checkAuth(req, ['CUSTOMER', 'ADMIN']);
    
    // 2. Validation
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    
    // 3. Authorization
    const where = token.role === 'CUSTOMER' 
      ? { userId: token.id }
      : {};
    
    // 4. Database query
    const orders = await prisma.order.findMany({
      where,
      skip: (page - 1) * 10,
      take: 10,
      orderBy: { createdAt: 'desc' }
    });
    
    // 5. Response
    return NextResponse.json({
      message: "Orders retrieved successfully",
      data: orders
    });
    
  } catch (error) {
    // 6. Error handling
    console.error('Error fetching orders:', error);
    return NextResponse.json(
      { message: "Failed to fetch orders" },
      { status: 500 }
    );
  }
}
```

**Error Handling**:
```typescript
// ✅ Good: Specific error messages
if (!orderId) {
  return NextResponse.json(
    { message: "Order ID is required" },
    { status: 400 }
  );
}

if (!order) {
  return NextResponse.json(
    { message: "Order not found" },
    { status: 404 }
  );
}

if (order.userId !== token.id) {
  return NextResponse.json(
    { message: "Unauthorized access to order" },
    { status: 403 }
  );
}
```

### Database Queries

**Efficient Queries**:
```typescript
// ✅ Good: Use select to fetch only needed fields
const user = await prisma.user.findUnique({
  where: { id: userId },
  select: {
    id: true,
    fullName: true,
    email: true
  }
});

// ❌ Bad: Fetch everything
const user = await prisma.user.findUnique({
  where: { id: userId }
});
```

**Relations**:
```typescript
// ✅ Good: Include relations explicitly
const order = await prisma.order.findUnique({
  where: { id: orderId },
  include: {
    payment: true,
    transportation: {
      include: {
        destinations: {
          orderBy: { sequence: 'asc' }
        }
      }
    }
  }
});
```

**Transactions**:
```typescript
// ✅ Good: Use transactions for multiple writes
const result = await prisma.$transaction(async (tx) => {
  const order = await tx.order.create({
    data: orderData
  });
  
  const payment = await tx.payment.create({
    data: {
      orderId: order.id,
      totalPrice: calculatedPrice
    }
  });
  
  return { order, payment };
});
```

---

## Testing

### Manual Testing

**Before Committing**:
1. Test your changes in browser
2. Check console for errors
3. Test on mobile viewport
4. Test different user roles
5. Verify database changes

**Test Cases for Features**:

*Example: Payment Approval*
```
1. Create test order as customer
2. Upload payment proof
3. Login as admin
4. Navigate to orders
5. Click on test order
6. View payment proof
7. Approve payment
8. Verify:
   - Payment status changed to APPROVED
   - Order status changed to CONFIRMED
   - Email sent (check Mailtrap)
   - PDF generated
   - Invoice number created
9. Login as customer
10. Check email inbox
11. Download and view invoice PDF
```

### Automated Testing

**Unit Tests** (to be implemented):
```typescript
// __tests__/utils/price-calculation.test.ts
import { calculatePrice } from '@/utils/calculation-monitoring';

describe('Price Calculation', () => {
  it('should calculate base price correctly', () => {
    const result = calculatePrice({
      pricePerKm: 1000,
      distance: 25.5,
      roundTrip: false,
      numberOfDays: 1
    });
    
    expect(result.totalPrice).toBe(25500);
  });
  
  it('should double price for round trips', () => {
    const result = calculatePrice({
      pricePerKm: 1000,
      distance: 25.5,
      roundTrip: true,
      numberOfDays: 1
    });
    
    expect(result.totalPrice).toBe(51000);
  });
});
```

**Integration Tests** (to be implemented):
```typescript
// __tests__/api/orders.test.ts
import { POST } from '@/app/api/orders/route';
import { NextRequest } from 'next/server';

describe('POST /api/orders', () => {
  it('should create order successfully', async () => {
    const request = new NextRequest('http://localhost:3000/api/orders', {
      method: 'POST',
      body: JSON.stringify({
        orderType: 'TRANSPORT',
        // ... other fields
      })
    });
    
    const response = await POST(request);
    const data = await response.json();
    
    expect(response.status).toBe(201);
    expect(data.message).toBe('Order created successfully');
    expect(data.data).toHaveProperty('id');
  });
});
```

---

## Debugging

### Development Tools

**React DevTools**:
- Install browser extension
- Inspect component tree
- View props and state
- Profile performance

**Prisma Studio**:
```bash
pnpm prisma studio
# Opens at http://localhost:5555
# Browse and edit database visually
```

**Browser DevTools**:
- Network tab: Check API requests
- Console tab: View logs and errors
- Application tab: Inspect cookies, localStorage
- Performance tab: Profile page load

### Common Issues

**Issue: Database connection error**

```bash
# Check if MySQL is running
sudo systemctl status mysql

# Test connection
mysql -u root -p

# Check DATABASE_URL in .env
# Verify credentials and database name
```

**Issue: Prisma Client not found**

```bash
# Regenerate Prisma Client
pnpm prisma generate

# If still fails, delete node_modules and reinstall
rm -rf node_modules
pnpm install
```

**Issue: Module not found**

```bash
# Clear Next.js cache
rm -rf .next

# Restart dev server
pnpm dev
```

**Issue: CORS error**

```typescript
// Add CORS headers in next.config.ts
module.exports = {
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET,POST,PUT,DELETE' },
        ],
      },
    ];
  },
};
```

### Logging

**Development Logging**:
```typescript
// Use console methods appropriately
console.log('Info message');
console.warn('Warning message');
console.error('Error message', error);

// Structured logging
console.log('[ORDER]', 'Order created:', orderId);
console.error('[PAYMENT]', 'Payment approval failed:', error);
```

**Production Logging**:
```typescript
// Use logging service (to be implemented)
// Options: Sentry, LogRocket, Datadog

import * as Sentry from '@sentry/nextjs';

try {
  // Code
} catch (error) {
  Sentry.captureException(error);
  console.error(error);
}
```

---

## Performance Optimization

### Frontend Optimization

**Image Optimization**:
```typescript
// ✅ Use Next.js Image component
import Image from 'next/image';

<Image
  src="/images/hero.jpg"
  alt="Hero"
  width={1200}
  height={600}
  priority // For above-the-fold images
  placeholder="blur"
  blurDataURL="..." // Low-res placeholder
/>
```

**Code Splitting**:
```typescript
// ✅ Dynamic imports for large components
import dynamic from 'next/dynamic';

const HeavyComponent = dynamic(
  () => import('@/components/HeavyComponent'),
  {
    loading: () => <Skeleton />,
    ssr: false // If not needed on server
  }
);
```

**React Query Caching**:
```typescript
// Configure cache times appropriately
const { data } = useQuery({
  queryKey: ['tourPackages'],
  queryFn: fetchTourPackages,
  staleTime: 5 * 60 * 1000, // 5 minutes
  cacheTime: 10 * 60 * 1000, // 10 minutes
});
```

### Backend Optimization

**Database Indexes**:
```sql
-- Add indexes for frequently queried fields
CREATE INDEX idx_order_status ON Order(orderStatus);
CREATE INDEX idx_payment_status ON Payment(paymentStatus);
CREATE INDEX idx_order_created_at ON Order(createdAt);
```

**Query Optimization**:
```typescript
// ✅ Good: Paginate large datasets
const orders = await prisma.order.findMany({
  skip: (page - 1) * limit,
  take: limit,
  orderBy: { createdAt: 'desc' }
});

// ✅ Good: Use select to reduce data transfer
const users = await prisma.user.findMany({
  select: {
    id: true,
    fullName: true,
    email: true
  }
});
```

---

## Security Considerations

### Input Validation

```typescript
// ✅ Always validate user input with Zod
import { z } from 'zod';

const orderSchema = z.object({
  fullName: z.string().min(1).max(100),
  phoneNumber: z.string().regex(/^\+?[0-9]{10,15}$/),
  email: z.string().email(),
  totalPassengers: z.number().int().min(1).max(50)
});

// In API route
const body = await req.json();
const validated = orderSchema.parse(body);
// Use validated data
```

### XSS Prevention

```typescript
// ✅ Sanitize HTML content
import DOMPurify from 'dompurify';

const sanitizedContent = DOMPurify.sanitize(userContent);
```

### SQL Injection Prevention

```typescript
// ✅ Always use Prisma (parameterized queries)
const user = await prisma.user.findUnique({
  where: { email: userEmail } // Safe, parameterized
});

// ❌ NEVER use raw SQL with user input
const result = await prisma.$queryRaw`
  SELECT * FROM User WHERE email = ${userEmail}
`; // Dangerous!
```

### Authentication Checks

```typescript
// ✅ Check auth in every protected route
import { checkAuth } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const token = await checkAuth(req, ['ADMIN']);
  // Now proceed with admin-only logic
}
```

---

## Deployment

### Pre-deployment Checklist

- [ ] All tests passing
- [ ] No console.log statements
- [ ] Environment variables configured
- [ ] Database migrations up to date
- [ ] Build succeeds locally (`pnpm build`)
- [ ] Production build tested locally (`pnpm start`)
- [ ] Dependencies updated
- [ ] Security audit passed (`pnpm audit`)

### Build Process

```bash
# Clean install
rm -rf node_modules .next
pnpm install --frozen-lockfile

# Generate Prisma Client
pnpm prisma generate

# Build for production
pnpm build

# Test production build
pnpm start

# Visit http://localhost:3000 and test
```

### Docker Build

```bash
# Build image
docker build -t transpo-web:latest .

# Run container
docker run -p 3000:3000 --env-file .env transpo-web:latest

# Or use docker-compose
docker-compose up -d
```

---

## Useful Commands

### Package Management

```bash
# Install package
pnpm add package-name

# Install dev dependency
pnpm add -D package-name

# Update all packages
pnpm update

# Check for outdated packages
pnpm outdated

# Remove package
pnpm remove package-name
```

### Database Commands

```bash
# View schema
pnpm prisma db push --preview-feature

# Generate migration
pnpm prisma migrate dev --name description

# Apply migrations (production)
pnpm prisma migrate deploy

# Reset database (dev only)
pnpm prisma migrate reset

# Seed database
pnpm prisma db seed

# Open Prisma Studio
pnpm prisma studio
```

### Git Commands

```bash
# View status
git status

# Add changes
git add .

# Commit
git commit -m "feat: description"

# Push
git push origin branch-name

# Pull latest
git pull origin main

# Create branch
git checkout -b feature/new-feature

# Merge branch
git merge feature/new-feature

# Delete branch
git branch -d feature/new-feature
```

---

## Resources

### Documentation Links

- [Next.js Docs](https://nextjs.org/docs)
- [React Docs](https://react.dev)
- [Prisma Docs](https://www.prisma.io/docs)
- [TanStack Query Docs](https://tanstack.com/query/latest)
- [shadcn/ui Docs](https://ui.shadcn.com)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [NextAuth.js Docs](https://next-auth.js.org)

### Learning Resources

- [Next.js Tutorial](https://nextjs.org/learn)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html)
- [React Patterns](https://reactpatterns.com)
- [Web.dev Performance](https://web.dev/performance)

---

## Getting Help

### Internal Support

- Technical Lead: [Name]
- Senior Developer: [Name]
- DevOps: [Name]

### Community

- GitHub Issues: Report bugs and request features
- Slack/Discord: Team communication (if available)
- Stack Overflow: Search for common issues

### Best Practices for Asking Questions

1. Describe what you're trying to achieve
2. Show what you've tried
3. Include error messages and screenshots
4. Provide relevant code snippets
5. Mention your environment (OS, Node version, etc.)

---

Happy coding! 🚀
