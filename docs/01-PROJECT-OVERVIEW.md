# TRANSPO - Project Overview

## Introduction

**TRANSPO** is an innovative web-based transportation booking platform built specifically for the Malang Raya region in Indonesia. The platform provides technology-driven solutions for public transportation services, making it easier for tourists and locals to book vehicles and tour packages with transparency, affordability, safety, and comfort.

## Project Vision

"From Malang Raya for Indonesia" - TRANSPO aims to revolutionize public transportation in Indonesia by starting with the Malang region and expanding nationwide.

## Core Mission

1. **Easy Accessibility**: Technology-based service with price transparency, strategic pickup points, and easy booking
2. **Local Empowerment**: Engaging local drivers and tourist destinations for economic development
3. **Service Flexibility**: Providing rental options for groups and special events

## Key Features

### Customer Features
- **Transportation Booking**: Book various vehicle types (Angkot, HIACE Commuter, HIACE Premio, ELF)
- **Tour Package Booking**: Pre-designed tour packages with flexible options
- **Real-time Price Calculator**: Transparent pricing based on distance and vehicle type
- **Multi-destination Support**: Add multiple destinations with custom arrival times
- **Google Maps Integration**: Route planning and distance calculation
- **Payment Proof Upload**: Simple payment verification process
- **Order History**: Track all bookings and their status
- **Review System**: Rate and review completed trips

### Admin Features
- **Order Management**: Comprehensive order tracking and management
- **Payment Approval**: Automated invoice generation and email notifications
- **Analytics Dashboard**: Income, order, and performance analytics
- **Vehicle Type Management**: Configure vehicle types and pricing
- **Tour Package Management**: Create and manage tour packages
- **User Management**: Admin and customer account management
- **Report Generation**: Automated periodic reports (daily, weekly, monthly, yearly)
- **Achievement & Trusted By Management**: Showcase partnerships and achievements

### Authentication & Authorization
- **Email/Password Authentication**: Traditional login system
- **Google OAuth**: Social login integration
- **Role-based Access Control**: CUSTOMER, ADMIN, SUPER_ADMIN roles
- **Password Reset**: Email-based password recovery

## Technology Stack

### Frontend
- **Next.js 15.3.0**: React framework with App Router
- **React 19.0.0**: UI library
- **TypeScript 5**: Type-safe development
- **Tailwind CSS 4**: Utility-first styling
- **shadcn/ui**: Component library
- **Framer Motion**: Animations
- **React Hook Form**: Form handling
- **Zod**: Schema validation
- **TanStack React Query**: Data fetching and caching

### Backend
- **Next.js API Routes**: Serverless API endpoints
- **Prisma 6.6.0**: ORM for database operations
- **MySQL**: Relational database
- **NextAuth.js 4.24.11**: Authentication
- **bcryptjs**: Password hashing

### External Services
- **Supabase**: File storage (images, payment proofs)
- **Google Maps API**: Geocoding, directions, distance calculation
- **Nodemailer**: Email notifications
- **jsPDF**: PDF invoice generation

### Development Tools
- **pnpm**: Package manager
- **ESLint**: Code linting
- **Prettier**: Code formatting
- **Docker**: Containerization
- **Nginx**: Reverse proxy

## Project Structure

```
transpo-v1/
├── docs/                     # Documentation
├── prisma/                   # Database schema and migrations
├── public/                   # Static assets
├── src/
│   ├── app/                 # Next.js App Router pages
│   │   ├── admin/          # Admin panel
│   │   ├── api/            # API routes
│   │   ├── auth/           # Authentication pages
│   │   ├── dashboard/      # User dashboard
│   │   ├── order/          # Order pages
│   │   ├── settings/       # User settings
│   │   └── tour-package/   # Tour package pages
│   ├── components/          # Reusable components
│   ├── lib/                 # Utility libraries
│   ├── utils/               # Helper functions
│   ├── hooks/               # Custom React hooks
│   └── providers/           # Context providers
├── docker-compose.yaml      # Docker configuration
├── Dockerfile              # Docker image definition
└── nginx.conf              # Nginx configuration
```

## Deployment Architecture

The application is containerized using Docker with the following services:
- **web**: Next.js application
- **nginx**: Reverse proxy with SSL/TLS support
- **certbot**: Automatic SSL certificate renewal

## Target Market

### Primary Users
- Tourists visiting Malang region
- Local residents needing group transportation
- Schools and organizations requiring transportation services
- Event organizers

### Service Areas
- Malang City
- Batu City
- Malang Regency (with special pricing for ELF)

## Business Model

### Revenue Streams
1. **Transportation Rentals**: Per-kilometer pricing + base fare
2. **Tour Packages**: Fixed-price tour packages
3. **Round Trip Charges**: Additional fees for return trips
4. **Inter-trip Charges**: Additional fees for multi-day trips
5. **Out-of-region Charges**: Special pricing for areas outside Malang

### Pricing Structure
- **Angkot**: Starting from IDR 100,000
- **HIACE**: Starting from IDR 999,000
- **ELF**: Custom pricing based on distance and duration
- **Tour Packages**: Fixed prices per package

## Competitive Advantages

1. **Technology-First Approach**: Modern web platform vs traditional phone booking
2. **Price Transparency**: Automated price calculation before booking
3. **Local Focus**: Deep understanding of Malang region
4. **Flexible Options**: Both transportation and tour packages
5. **Quality Assurance**: Driver verification and vehicle standards
6. **Customer Support**: Dedicated admin team for order management

## Future Roadmap

### Short-term (3-6 months)
- Mobile application (iOS & Android)
- Real-time driver tracking
- In-app payment integration
- Multi-language support

### Mid-term (6-12 months)
- Expansion to other cities in East Java
- Driver mobile app
- Advanced analytics and reporting
- Customer loyalty program

### Long-term (1-2 years)
- Nationwide expansion
- AI-powered route optimization
- Electric vehicle fleet
- Corporate partnership program

## Success Metrics

### Key Performance Indicators (KPIs)
- Number of bookings per month
- Customer satisfaction rating
- Revenue growth rate
- Customer retention rate
- Average order value
- Booking conversion rate

### Current Achievements
The platform showcases partnerships with various organizations and achievement highlights through the Achievement and Trusted By sections on the homepage.

## Contact & Support

For inquiries:
- WhatsApp: +62 822-3137-8326
- Email: noreply@transpo.id
- Website: https://transpo.id

## License

This is a proprietary project owned by TRANSPO. All rights reserved.
