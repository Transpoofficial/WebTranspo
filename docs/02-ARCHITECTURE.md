# TRANSPO - System Architecture

## Architecture Overview

TRANSPO follows a modern **monolithic architecture** built on Next.js 15 with the App Router pattern, combining both frontend and backend in a single application. The architecture is designed for scalability, maintainability, and optimal performance.

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Client Layer                         │
│  (Browser - React Components + Framer Motion Animations)   │
└────────────────────┬───────────────────────────────────────┘
                     │ HTTPS
┌────────────────────▼───────────────────────────────────────┐
│                      Nginx Reverse Proxy                    │
│              (SSL/TLS + Static Asset Serving)              │
└────────────────────┬───────────────────────────────────────┘
                     │
┌────────────────────▼───────────────────────────────────────┐
│                    Next.js Application                      │
│  ┌──────────────────────────────────────────────────────┐  │
│  │           Frontend (React Components)                │  │
│  │  - Server Components (SSR)                          │  │
│  │  - Client Components (CSR + Hydration)             │  │
│  │  - TanStack Query (Data Fetching & Caching)        │  │
│  └──────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │         Backend (API Routes)                         │  │
│  │  - RESTful API Endpoints                            │  │
│  │  - NextAuth.js (Authentication)                     │  │
│  │  - Business Logic                                   │  │
│  └──────────────────────────────────────────────────────┘  │
└────────────┬──────────────────┬────────────────────────────┘
             │                  │
   ┌─────────▼────────┐  ┌─────▼──────────────┐
   │  MySQL Database  │  │  External Services │
   │  (via Prisma)    │  │  - Google Maps API │
   │                  │  │  - Supabase (S3)   │
   │  - User Data     │  │  - SMTP (Email)    │
   │  - Orders        │  │  - OAuth Providers │
   │  - Payments      │  └────────────────────┘
   │  - Tour Packages │
   └──────────────────┘
```

## Application Layers

### 1. Presentation Layer (Frontend)

**Location**: `src/app/`, `src/components/`

#### Responsibilities:
- Rendering UI components
- Handling user interactions
- Form validation and submission
- Client-side routing
- State management
- Animation and transitions

#### Key Technologies:
- **React Server Components (RSC)**: Default rendering for optimal performance
- **React Client Components**: Interactive components with state
- **shadcn/ui + Radix UI**: Accessible component primitives
- **Tailwind CSS**: Utility-first styling
- **Framer Motion**: Page and component animations
- **React Hook Form + Zod**: Form handling and validation

#### Component Structure:
```
components/
├── ui/              # Base UI components (Button, Input, Dialog, etc.)
├── custom/          # Custom business components
├── email/           # Email templates (React Email)
├── header.tsx       # Site header
├── footer.tsx       # Site footer
├── app-sidebar.tsx  # Admin sidebar
└── SEO.tsx          # SEO meta tags
```

### 2. API Layer (Backend)

**Location**: `src/app/api/`

#### Responsibilities:
- HTTP request handling
- Authentication & authorization
- Business logic execution
- Data validation
- Database operations via Prisma
- External service integration

#### API Structure:
```
api/
├── auth/                    # Authentication endpoints
│   ├── [...nextauth]/      # NextAuth.js configuration
│   ├── signin/             # Sign in
│   ├── signup/             # Sign up
│   ├── forgot-password/    # Password reset request
│   └── reset-password/     # Password reset confirmation
├── orders/                 # Order management
│   └── [id]/              # Order by ID operations
├── payments/               # Payment management
│   └── [id]/              # Payment operations
│       ├── status/        # Update payment status
│       └── proof/         # Upload payment proof
├── tour-packages/          # Tour package CRUD
├── vehicle-types/          # Vehicle type CRUD
├── articles/               # Article management
├── reviews/                # Review management
├── analytics/              # Analytics data
│   └── web-vitals/        # Performance monitoring
├── calculate-price/        # Price calculation
├── google-maps/            # Google Maps integration
│   └── route-map/         # Route calculation
├── achievements/           # Achievement management
├── trusted-by/             # Trusted by management
├── users/                  # User management
├── dashboard/              # Dashboard data
└── email/                  # Email sending
    └── send/              # Send email endpoint
```

#### API Design Patterns:
- **RESTful conventions**: Resource-based URLs
- **HTTP methods**: GET, POST, PUT, PATCH, DELETE
- **Status codes**: Proper HTTP status codes (200, 201, 400, 401, 403, 404, 500)
- **Error handling**: Consistent error response format
- **Pagination**: Query parameter-based pagination
- **Filtering**: Query parameter-based filtering

### 3. Data Access Layer

**Location**: `src/lib/prisma.ts`, `prisma/schema.prisma`

#### Responsibilities:
- Database connection management
- Query execution
- Transaction handling
- Data validation
- Schema migrations

#### Key Features:
- **Prisma Client**: Type-safe database queries
- **Connection pooling**: Optimized for serverless
- **Transaction support**: ACID compliance
- **Eager/lazy loading**: Relationship management
- **Middleware**: Query logging and performance monitoring

#### Database Models:
```
- User (Authentication & Profile)
- Order (Bookings)
- Payment (Transaction records)
- RefundRequest (Refund management)
- TransportationOrder (Transport bookings)
- DestinationTransportation (Multi-destination)
- PackageOrder (Tour package bookings)
- Review (Customer reviews)
- VehicleType (Vehicle configuration)
- TourPackage (Tour package details)
- Report (Analytics reports)
- Article (Blog/articles)
- Achievement (Company achievements)
- TrustedBy (Partner logos)
```

### 4. Business Logic Layer

**Location**: `src/lib/`, `src/utils/`

#### Key Services:

**Authentication & Authorization** (`src/lib/auth.ts`):
- NextAuth.js configuration
- JWT token management
- Role-based access control (RBAC)
- OAuth provider integration (Google)
- Session management

**Email Service** (`src/lib/email-templates.ts`, `src/lib/nodemailer.ts`):
- Transactional email sending
- Template rendering with React Email
- SMTP configuration
- Email types:
  - Registration verification
  - Password reset
  - Payment approval with invoice
  - Payment proof received

**Payment Processing** (`src/lib/payment-approval.ts`):
- Payment status management
- Invoice generation
- Email notification triggering
- Refund request handling

**PDF Generation** (`src/lib/pdf-generator.ts`):
- Invoice PDF creation
- Company branding
- Itemized billing
- Customer information display

**Price Calculation** (`src/utils/calculation-monitoring.ts`):
- Distance-based pricing
- Vehicle type pricing
- Round trip charges
- Multi-day trip charges
- Out-of-region charges (ELF only)
- Tour package pricing

**Google Maps Integration** (`src/utils/google-maps.ts`):
- Geocoding (address to coordinates)
- Directions API (route calculation)
- Distance Matrix API
- Polyline decoding
- Map rendering

**SEO & Metadata** (`src/lib/metadata.ts`):
- Dynamic meta tag generation
- Open Graph tags
- Twitter Cards
- Structured data (JSON-LD)

## Authentication Flow

```
┌──────────┐
│  Client  │
└────┬─────┘
     │ 1. Login request (email/password or OAuth)
     ▼
┌────────────────────────────────────┐
│  API: /api/auth/signin             │
│  - Validate credentials            │
│  - Check user in database          │
│  - Compare password hash (bcrypt)  │
└────┬───────────────────────────────┘
     │ 2. Generate JWT token
     ▼
┌────────────────────────────────────┐
│  NextAuth.js                       │
│  - Create session                  │
│  - Set session cookie              │
│  - Add user data to token          │
└────┬───────────────────────────────┘
     │ 3. Return session
     ▼
┌────────────────────────────────────┐
│  Client                            │
│  - Store session in cookie         │
│  - Redirect to dashboard           │
└────────────────────────────────────┘

For subsequent requests:
┌──────────┐
│  Client  │ ---> Header: Cookie: next-auth.session-token=...
└────┬─────┘
     │
     ▼
┌────────────────────────────────────┐
│  Middleware/API Route              │
│  - Verify JWT token                │
│  - Extract user data               │
│  - Check permissions               │
└────────────────────────────────────┘
```

## Order Booking Flow

### Transportation Order:
```
1. User selects vehicle type (Angkot/HIACE/ELF)
2. User adds destinations with Google Maps autocomplete
3. System calculates route distance using Google Directions API
4. System calculates price based on:
   - Vehicle type rate per km
   - Total distance
   - Round trip multiplier (x2 if enabled)
   - Inter-trip charges (multi-day)
   - Out-of-region charges (ELF only)
5. User confirms order details
6. System creates Order + TransportationOrder + Payment records
7. User uploads payment proof
8. Admin approves payment
9. System generates invoice PDF
10. System sends email with invoice attachment
```

### Tour Package Order:
```
1. User selects tour package
2. User selects departure date and number of people (for private trips)
3. System calculates total price:
   - Fixed price for group tours
   - Base price × number of people for private tours
4. User confirms order details
5. System creates Order + PackageOrder + Payment records
6. User uploads payment proof
7. Admin approves payment
8. System generates invoice PDF
9. System sends email with invoice attachment
```

## Data Flow Patterns

### Server-Side Rendering (SSR) Flow:
```
Request → Next.js Server → Database Query → Render React → HTML Response
```

### Client-Side Data Fetching Flow:
```
Component Mount → TanStack Query → API Request → Cache Update → UI Update
```

### Form Submission Flow:
```
User Input → React Hook Form → Zod Validation → API Call → Database Update → UI Feedback
```

## Security Architecture

### Authentication Security:
- JWT-based session management
- HTTP-only cookies
- Secure flag in production
- CSRF protection
- Password hashing with bcrypt (10 rounds)

### Authorization:
- Role-based access control (RBAC)
- Middleware authentication checks
- API route protection
- Frontend route guards

### Data Security:
- Input sanitization (DOMPurify)
- SQL injection prevention (Prisma parameterization)
- XSS protection
- Rate limiting (to be implemented)
- HTTPS enforcement

### API Security:
- CORS configuration
- Request validation with Zod
- Error message sanitization
- Sensitive data masking

## Performance Optimization

### Frontend:
- Server-side rendering (SSR)
- Static generation for public pages
- Image optimization (Next.js Image)
- Code splitting
- Lazy loading
- Framer Motion optimized animations
- React Query caching

### Backend:
- Database connection pooling
- Query optimization
- Transaction batching
- Efficient Prisma queries with select/include

### Caching Strategy:
- React Query client-side cache
- Browser cache for static assets
- CDN for images (Supabase)

### Monitoring:
- Web Vitals tracking
- Performance metrics (LCP, FID, CLS)
- Error logging
- Analytics integration

## Deployment Architecture

### Production Environment:

```
┌──────────────────────────────────────┐
│  Docker Container: web_app           │
│  - Next.js Production Build          │
│  - Node.js 20 Alpine                 │
│  - Port: 3000 (internal)             │
└──────────────┬───────────────────────┘
               │
┌──────────────▼───────────────────────┐
│  Docker Container: nginx_proxy       │
│  - Nginx Reverse Proxy               │
│  - SSL/TLS Certificates (Let's Encrypt)│
│  - Port: 80, 443 (external)          │
└──────────────┬───────────────────────┘
               │
┌──────────────▼───────────────────────┐
│  Docker Container: certbot           │
│  - Automatic SSL Renewal             │
│  - Runs every 12 hours               │
└──────────────────────────────────────┘
```

### Environment Variables:
- Database connection strings
- API keys (Google Maps, Supabase)
- SMTP credentials
- OAuth client secrets
- NextAuth secret
- Analytics IDs

### Build Process:
```bash
1. pnpm install          # Install dependencies
2. pnpm prisma generate  # Generate Prisma Client
3. pnpm build            # Build Next.js application
4. pnpm start            # Start production server
```

### Docker Build Stages:
1. **Builder stage**: Install dependencies, generate Prisma Client, build app
2. **Runner stage**: Copy built artifacts, install production dependencies only

## Scalability Considerations

### Current Architecture:
- Single server deployment
- Vertical scaling capability
- Database on separate server (optional)

### Future Scaling Strategy:
- Horizontal scaling with load balancer
- Database read replicas
- Redis for session storage
- CDN for static assets
- Microservices separation (optional)

## Error Handling

### Frontend:
- React Error Boundaries
- Toast notifications (Sonner)
- Form validation errors
- Network error handling

### Backend:
- Try-catch blocks
- Database transaction rollbacks
- Structured error responses
- Error logging
- Graceful degradation

## Logging & Monitoring

### Application Logs:
- API request/response logs
- Database query logs
- Error logs with stack traces
- Payment transaction logs

### Performance Monitoring:
- Web Vitals (Core Web Vitals)
- Long task detection
- API response times
- Database query performance

### Analytics:
- Google Analytics 4 (optional)
- Custom event tracking
- User behavior analytics
- Conversion tracking

## Technology Decisions & Rationale

### Why Next.js?
- Full-stack framework (frontend + backend)
- Excellent developer experience
- SEO-friendly with SSR
- API routes for backend
- File-based routing
- Built-in image optimization

### Why Prisma?
- Type-safe database access
- Excellent TypeScript support
- Automated migrations
- Query optimization
- Development productivity

### Why MySQL?
- Proven reliability
- Strong ACID compliance
- Good performance for relational data
- Wide hosting support
- Cost-effective

### Why Supabase for Storage?
- S3-compatible API
- Generous free tier
- Fast CDN
- Simple integration
- No vendor lock-in

### Why Framer Motion?
- Declarative animations
- Performance optimized
- React-first approach
- Gesture support
- Layout animations

## Development Workflow

```
Developer → Feature Branch → Code → Test Locally → PR → Review → Merge → Deploy
```

### Local Development:
```bash
pnpm dev                    # Start dev server (Turbopack)
pnpm prisma studio          # Open Prisma Studio (database GUI)
pnpm lint                   # Run ESLint
pnpm build                  # Test production build
```

### Database Workflow:
```bash
pnpm prisma migrate dev     # Create and apply migration
pnpm prisma db push         # Push schema changes (dev only)
pnpm prisma db seed         # Seed database
pnpm prisma generate        # Regenerate Prisma Client
```

## Conclusion

TRANSPO's architecture is designed to be:
- **Maintainable**: Clear separation of concerns
- **Scalable**: Ability to grow with demand
- **Secure**: Multiple layers of security
- **Performant**: Optimized for speed
- **Developer-friendly**: Modern tooling and best practices

The monolithic architecture provides simplicity and speed for the current scale while maintaining the ability to extract microservices if needed in the future.
