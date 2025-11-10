# TRANSPO - API Documentation

## API Overview

TRANSPO provides a RESTful API built with Next.js API Routes. All endpoints are located under `/api/` and return JSON responses.

## Base URL

- **Development**: `http://localhost:3000/api`
- **Production**: `https://transpo.id/api`

## Authentication

### Authentication Methods

1. **Session-based (NextAuth.js)**
   - Automatically handled via HTTP-only cookies
   - Session cookie: `next-auth.session-token`

2. **JWT Token**
   - Stored in session cookie
   - Contains: `id`, `email`, `fullName`, `role`, `phoneNumber`

### Protected Endpoints

Protected endpoints require authentication. Include the session cookie in requests.

**Example**:
```typescript
// Client-side with axios
axios.get('/api/orders', { withCredentials: true });

// Fetch API
fetch('/api/orders', {
  credentials: 'include'
});
```

### Role-Based Access

- **CUSTOMER**: Can view own orders, create bookings
- **ADMIN**: Can manage orders, payments, content
- **SUPER_ADMIN**: Full system access, can create admin accounts

## Response Format

### Success Response

```json
{
  "message": "Success message",
  "data": {
    // Response data
  }
}
```

### Error Response

```json
{
  "message": "Error message",
  "error": "Detailed error description" // Optional, in development
}
```

## HTTP Status Codes

- **200 OK**: Request succeeded
- **201 Created**: Resource created successfully
- **400 Bad Request**: Invalid request data
- **401 Unauthorized**: Authentication required
- **403 Forbidden**: Insufficient permissions
- **404 Not Found**: Resource not found
- **500 Internal Server Error**: Server error

---

## API Endpoints

## Authentication Endpoints

### 1. Sign Up

Create a new user account.

**Endpoint**: `POST /api/auth/signup`

**Access**: Public

**Request Body**:
```json
{
  "fullName": "John Doe",
  "email": "john@example.com",
  "password": "SecurePass123!",
  "phoneNumber": "+6281234567890" // Optional
}
```

**Response**: `201 Created`
```json
{
  "message": "User registered successfully. Please check your email for verification.",
  "data": {
    "id": "clx123456",
    "email": "john@example.com",
    "fullName": "John Doe",
    "role": "CUSTOMER"
  }
}
```

**Validation**:
- Email must be unique and valid format
- Password minimum 8 characters
- Full name required

---

### 2. Sign In

Authenticate user and create session.

**Endpoint**: `POST /api/auth/signin`

**Access**: Public

**Request Body**:
```json
{
  "email": "john@example.com",
  "password": "SecurePass123!"
}
```

**Response**: `200 OK`
```json
{
  "message": "Sign in successful",
  "data": {
    "user": {
      "id": "clx123456",
      "email": "john@example.com",
      "fullName": "John Doe",
      "role": "CUSTOMER"
    }
  }
}
```

**Note**: Session cookie is automatically set

---

### 3. Sign Out

End user session.

**Endpoint**: `POST /api/auth/signout`

**Access**: Authenticated

**Response**: `200 OK`
```json
{
  "message": "Signed out successfully"
}
```

---

### 4. Forgot Password

Request password reset email.

**Endpoint**: `POST /api/auth/forgot-password`

**Access**: Public

**Request Body**:
```json
{
  "email": "john@example.com"
}
```

**Response**: `200 OK`
```json
{
  "message": "Password reset email sent"
}
```

---

### 5. Reset Password

Reset password using token from email.

**Endpoint**: `POST /api/auth/reset-password`

**Access**: Public

**Request Body**:
```json
{
  "token": "reset-token-from-email",
  "newPassword": "NewSecurePass123!"
}
```

**Response**: `200 OK`
```json
{
  "message": "Password reset successful"
}
```

---

## Order Endpoints

### 1. Create Order

Create a new transportation or tour package order.

**Endpoint**: `POST /api/orders`

**Access**: Authenticated (CUSTOMER)

**Request Body (Transportation)**:
```json
{
  "orderType": "TRANSPORT",
  "vehicleTypeId": "clx123456",
  "vehicleCount": 1,
  "roundTrip": false,
  "totalDistance": "25.5",
  "totalPrice": "255000",
  "fullName": "John Doe",
  "phoneNumber": "+6281234567890",
  "email": "john@example.com",
  "totalPassengers": 10,
  "note": "Please arrive at 8 AM",
  "timezone": "Asia/Jakarta",
  "destinations": [
    {
      "address": "Jl. Veteran No. 123, Malang",
      "lat": -7.966620,
      "lng": 112.632630,
      "isPickupLocation": true,
      "sequence": 0,
      "departureDate": "2025-12-25",
      "departureTime": "08:00",
      "arrivalTime": ""
    },
    {
      "address": "Coban Rondo, Batu",
      "lat": -7.870000,
      "lng": 112.450000,
      "isPickupLocation": false,
      "sequence": 1,
      "departureDate": "2025-12-25",
      "departureTime": "",
      "arrivalTime": "10:00"
    }
  ]
}
```

**Request Body (Tour Package)**:
```json
{
  "orderType": "TOUR",
  "packageId": "clx789012",
  "departureDate": "2025-12-25",
  "totalPassengers": "5", // For private trips
  "fullName": "John Doe",
  "phoneNumber": "+6281234567890",
  "email": "john@example.com",
  "totalPrice": "2500000",
  "note": "5 people, prefer vegetarian meals"
}
```

**Response**: `201 Created`
```json
{
  "message": "Order created successfully",
  "data": {
    "id": "clx345678",
    "orderType": "TRANSPORT",
    "orderStatus": "PENDING",
    "fullName": "John Doe",
    "payment": {
      "id": "clx901234",
      "totalPrice": "255000",
      "paymentStatus": "PENDING"
    }
  }
}
```

**Validation**:
- Vehicle type must exist (for TRANSPORT)
- Package must exist and have available capacity (for TOUR)
- Destinations must be in correct sequence
- Price is validated on server-side
- Pickup location must be within service area

---

### 2. Get Orders

Retrieve user's orders or all orders (admin).

**Endpoint**: `GET /api/orders`

**Access**: Authenticated

**Query Parameters**:
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10)
- `status`: Filter by order status
- `type`: Filter by order type (TRANSPORT/TOUR)

**Response**: `200 OK`
```json
{
  "message": "Orders retrieved successfully",
  "data": [
    {
      "id": "clx345678",
      "orderType": "TRANSPORT",
      "orderStatus": "CONFIRMED",
      "fullName": "John Doe",
      "totalPassengers": 10,
      "createdAt": "2025-11-10T10:00:00Z",
      "vehicleType": {
        "name": "Angkot",
        "capacity": 12
      },
      "payment": {
        "totalPrice": "255000",
        "paymentStatus": "APPROVED"
      },
      "transportation": {
        "destinations": [
          {
            "address": "Jl. Veteran No. 123, Malang",
            "departureDate": "2025-12-25T08:00:00Z"
          }
        ]
      }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 50
  }
}
```

---

### 3. Get Order by ID

Retrieve single order details.

**Endpoint**: `GET /api/orders/[id]`

**Access**: Authenticated (Own order or Admin)

**Response**: `200 OK`
```json
{
  "message": "Order retrieved successfully",
  "data": {
    "id": "clx345678",
    "orderType": "TRANSPORT",
    "orderStatus": "CONFIRMED",
    "fullName": "John Doe",
    "phoneNumber": "+6281234567890",
    "email": "john@example.com",
    "totalPassengers": 10,
    "note": "Please arrive at 8 AM",
    "createdAt": "2025-11-10T10:00:00Z",
    "vehicleType": {
      "id": "clx123456",
      "name": "Angkot",
      "capacity": 12,
      "pricePerKm": "1000"
    },
    "payment": {
      "id": "clx901234",
      "totalPrice": "255000",
      "paymentStatus": "APPROVED",
      "senderName": "John Doe",
      "transferDate": "2025-11-11T10:00:00Z"
    },
    "transportation": {
      "vehicleCount": 1,
      "roundTrip": false,
      "totalDistance": 25.5,
      "destinations": [
        {
          "address": "Jl. Veteran No. 123, Malang",
          "lat": -7.966620,
          "lng": 112.632630,
          "isPickupLocation": true,
          "sequence": 0,
          "departureDate": "2025-12-25T08:00:00Z"
        }
      ]
    }
  }
}
```

---

### 4. Update Order Status

Update order status (Admin only).

**Endpoint**: `PATCH /api/orders/[id]/status`

**Access**: Authenticated (ADMIN, SUPER_ADMIN)

**Request Body**:
```json
{
  "orderStatus": "CONFIRMED"
}
```

**Response**: `200 OK`
```json
{
  "message": "Order status updated successfully",
  "data": {
    "id": "clx345678",
    "orderStatus": "CONFIRMED"
  }
}
```

**Valid Status Transitions**:
- PENDING → CONFIRMED, CANCELED
- CONFIRMED → COMPLETED, CANCELED
- COMPLETED → REFUNDED

---

## Payment Endpoints

### 1. Upload Payment Proof

Upload payment proof image.

**Endpoint**: `POST /api/payments/[id]/proof`

**Access**: Authenticated (Order owner)

**Content-Type**: `multipart/form-data`

**Form Data**:
- `senderName`: Name on transfer
- `transferDate`: Date of transfer (YYYY-MM-DD)
- `file`: Image file (JPG, PNG, max 5MB)

**Response**: `200 OK`
```json
{
  "message": "Payment proof uploaded successfully",
  "data": {
    "id": "clx901234",
    "proofUrl": "https://supabase.co/storage/payments/proof-123.jpg",
    "paymentStatus": "PENDING"
  }
}
```

---

### 2. Update Payment Status

Approve or reject payment (Admin only).

**Endpoint**: `PUT /api/payments/[id]/status`

**Access**: Authenticated (ADMIN, SUPER_ADMIN)

**Request Body**:
```json
{
  "paymentStatus": "APPROVED",
  "note": "Payment verified"
}
```

**Response**: `200 OK`
```json
{
  "message": "Payment status updated successfully. Invoice sent to customer.",
  "data": {
    "id": "clx901234",
    "paymentStatus": "APPROVED",
    "approvedByAdminId": "clx567890"
  }
}
```

**Behavior**:
- When status = "APPROVED", automatically:
  - Generates PDF invoice
  - Sends email with invoice attachment to customer
  - Updates order status to CONFIRMED

---

### 3. Get Payment by ID

Retrieve payment details.

**Endpoint**: `GET /api/payments/[id]`

**Access**: Authenticated (Order owner or Admin)

**Response**: `200 OK`
```json
{
  "message": "Payment retrieved successfully",
  "data": {
    "id": "clx901234",
    "orderId": "clx345678",
    "senderName": "John Doe",
    "transferDate": "2025-11-11T10:00:00Z",
    "proofUrl": "https://supabase.co/storage/payments/proof-123.jpg",
    "paymentStatus": "APPROVED",
    "totalPrice": "255000",
    "approvedByAdmin": {
      "fullName": "Admin User"
    }
  }
}
```

---

## Tour Package Endpoints

### 1. Get Tour Packages

Retrieve all tour packages.

**Endpoint**: `GET /api/tour-packages`

**Access**: Public

**Query Parameters**:
- `page`: Page number
- `limit`: Items per page
- `isPrivate`: Filter by private/group (true/false)

**Response**: `200 OK`
```json
{
  "message": "Tour packages retrieved successfully",
  "data": [
    {
      "id": "clx789012",
      "name": "Bromo Sunrise Tour",
      "price": "500000",
      "description": "Experience the magical sunrise at Mount Bromo",
      "photoUrl": ["url1.jpg", "url2.jpg"],
      "meetingPoint": "Malang City Center",
      "minPersonCapacity": 2,
      "maxPersonCapacity": 15,
      "is_private": false,
      "includes": ["Transportation", "Breakfast", "Guide"],
      "excludes": ["Lunch", "Personal expenses"],
      "itineraries": [
        {
          "day": 1,
          "title": "Day 1",
          "activities": ["Pickup at 2 AM", "Drive to Bromo"]
        }
      ]
    }
  ]
}
```

---

### 2. Get Tour Package by ID

Retrieve single tour package details.

**Endpoint**: `GET /api/tour-packages/[id]`

**Access**: Public

**Response**: `200 OK`
```json
{
  "message": "Tour package retrieved successfully",
  "data": {
    "id": "clx789012",
    "name": "Bromo Sunrise Tour",
    "price": "500000",
    "description": "Experience the magical sunrise at Mount Bromo",
    "photoUrl": ["url1.jpg", "url2.jpg"],
    "meetingPoint": "Malang City Center",
    "minPersonCapacity": 2,
    "maxPersonCapacity": 15,
    "is_private": false,
    "includes": ["Transportation", "Breakfast", "Guide"],
    "excludes": ["Lunch", "Personal expenses"],
    "requirements": ["ID Card", "Warm clothes"],
    "tickets": { "entrance": "50000", "jeep": "100000" },
    "itineraries": [
      {
        "day": 1,
        "title": "Bromo Sunrise",
        "activities": [
          "02:00 - Pickup from meeting point",
          "04:30 - Arrive at sunrise viewpoint",
          "08:00 - Return to Malang"
        ]
      }
    ]
  }
}
```

---

### 3. Create Tour Package (Admin)

Create a new tour package.

**Endpoint**: `POST /api/tour-packages`

**Access**: Authenticated (ADMIN, SUPER_ADMIN)

**Request Body**:
```json
{
  "name": "Bromo Sunrise Tour",
  "price": "500000",
  "description": "Experience magical sunrise",
  "photoUrl": ["url1.jpg", "url2.jpg"],
  "meetingPoint": "Malang City Center",
  "minPersonCapacity": 2,
  "maxPersonCapacity": 15,
  "is_private": false,
  "includes": ["Transportation", "Breakfast"],
  "excludes": ["Lunch"],
  "requirements": ["ID Card"],
  "itineraries": [
    {
      "day": 1,
      "title": "Day 1",
      "activities": ["Activity 1", "Activity 2"]
    }
  ]
}
```

**Response**: `201 Created`

---

### 4. Update Tour Package (Admin)

Update existing tour package.

**Endpoint**: `PUT /api/tour-packages/[id]`

**Access**: Authenticated (ADMIN, SUPER_ADMIN)

**Request Body**: Same as create

**Response**: `200 OK`

---

### 5. Delete Tour Package (Admin)

Delete a tour package.

**Endpoint**: `DELETE /api/tour-packages/[id]`

**Access**: Authenticated (SUPER_ADMIN)

**Response**: `200 OK`

---

## Vehicle Type Endpoints

### 1. Get Vehicle Types

Retrieve all vehicle types.

**Endpoint**: `GET /api/vehicle-types`

**Access**: Public

**Query Parameters**:
- `search`: Filter by name

**Response**: `200 OK`
```json
{
  "message": "Vehicle types retrieved successfully",
  "data": [
    {
      "id": "clx123456",
      "name": "Angkot",
      "capacity": 12,
      "pricePerKm": "1000",
      "createdAt": "2025-01-01T00:00:00Z"
    }
  ]
}
```

---

### 2. Create Vehicle Type (Admin)

Create a new vehicle type.

**Endpoint**: `POST /api/vehicle-types`

**Access**: Authenticated (SUPER_ADMIN)

**Request Body**:
```json
{
  "name": "Mini Bus",
  "capacity": 25,
  "pricePerKm": "4000"
}
```

**Response**: `201 Created`

---

### 3. Update Vehicle Type (Admin)

Update vehicle type details.

**Endpoint**: `PUT /api/vehicle-types/[id]`

**Access**: Authenticated (SUPER_ADMIN)

**Request Body**:
```json
{
  "name": "Mini Bus",
  "capacity": 25,
  "pricePerKm": "4500"
}
```

**Response**: `200 OK`

---

## Price Calculation Endpoint

### Calculate Transportation Price

Calculate price for transportation order.

**Endpoint**: `POST /api/calculate-price`

**Access**: Public

**Request Body**:
```json
{
  "vehicleTypeId": "clx123456",
  "totalDistance": "25.5",
  "roundTrip": false,
  "destinations": [
    {
      "departureDate": "2025-12-25"
    },
    {
      "departureDate": "2025-12-25"
    }
  ]
}
```

**Response**: `200 OK`
```json
{
  "message": "Price calculated successfully",
  "data": {
    "basePrice": "255000",
    "interTripCharges": "0",
    "elfOutOfMalangCharges": "0",
    "totalPrice": "255000",
    "breakdown": {
      "pricePerKm": "1000",
      "distance": "25.5",
      "roundTripMultiplier": 1,
      "numberOfDays": 1
    }
  }
}
```

**Pricing Logic**:
- Base Price = `pricePerKm × distance × roundTripMultiplier`
- Inter-trip Charge = If trip spans multiple days, add 30% per additional day
- ELF Out-of-Malang Charge = If destination outside Malang region, add 20%

---

## Google Maps Endpoints

### 1. Get Route

Calculate route between locations.

**Endpoint**: `GET /api/google-maps/route-map`

**Access**: Public

**Query Parameters**:
- `origin`: Starting point (lat,lng or address)
- `destination`: End point (lat,lng or address)
- `waypoints`: Optional intermediate points (pipe-separated)

**Response**: `200 OK`
```json
{
  "routes": [
    {
      "legs": [
        {
          "distance": {
            "text": "25.5 km",
            "value": 25500
          },
          "duration": {
            "text": "45 mins",
            "value": 2700
          }
        }
      ],
      "overview_polyline": {
        "points": "encoded_polyline_string"
      }
    }
  ]
}
```

---

## Analytics Endpoints (Admin)

### 1. Dashboard Analytics

Get dashboard statistics.

**Endpoint**: `GET /api/analytics/dashboard`

**Access**: Authenticated (ADMIN, SUPER_ADMIN)

**Query Parameters**:
- `dateFilter`: today, week, month, year, custom
- `startDate`: For custom range
- `endDate`: For custom range

**Response**: `200 OK`
```json
{
  "message": "Analytics retrieved successfully",
  "data": {
    "totalOrders": 150,
    "completedOrders": 120,
    "pendingOrders": 20,
    "canceledOrders": 10,
    "totalIncome": "75000000",
    "averageRating": 4.5,
    "transportOrders": 100,
    "tourOrders": 50
  }
}
```

---

### 2. Web Vitals

Track web performance metrics.

**Endpoint**: `POST /api/analytics/web-vitals`

**Access**: Public

**Request Body**:
```json
{
  "metric": "LCP",
  "value": 2500,
  "id": "unique-visit-id",
  "path": "/order/transport/angkot"
}
```

**Response**: `200 OK`

---

## Review Endpoints

### 1. Get Reviews

Retrieve published reviews.

**Endpoint**: `GET /api/reviews`

**Access**: Public

**Query Parameters**:
- `page`: Page number
- `limit`: Items per page

**Response**: `200 OK`
```json
{
  "message": "Reviews retrieved successfully",
  "data": [
    {
      "id": "clx111222",
      "rating": 5,
      "content": "Excellent service!",
      "isShow": true,
      "createdAt": "2025-11-10T10:00:00Z",
      "order": {
        "user": {
          "fullName": "John Doe"
        }
      }
    }
  ]
}
```

---

### 2. Create Review

Submit a review for completed order.

**Endpoint**: `POST /api/reviews`

**Access**: Authenticated (Order owner)

**Request Body**:
```json
{
  "orderId": "clx345678",
  "rating": 5,
  "content": "Excellent service! Driver was very friendly."
}
```

**Response**: `201 Created`
```json
{
  "message": "Review submitted successfully",
  "data": {
    "id": "clx111222",
    "rating": 5,
    "content": "Excellent service!",
    "isShow": false
  }
}
```

**Note**: Reviews are not public until admin sets `isShow: true`

---

## Article Endpoints

### 1. Get Articles

Retrieve published articles.

**Endpoint**: `GET /api/articles`

**Access**: Public

**Response**: `200 OK`
```json
{
  "message": "Articles retrieved successfully",
  "data": [
    {
      "id": "clx999888",
      "title": "Top 10 Destinations in Malang",
      "content": "Article content...",
      "mainImgUrl": "https://...",
      "author": {
        "fullName": "Admin User"
      },
      "createdAt": "2025-11-10T10:00:00Z"
    }
  ]
}
```

---

### 2. Get Article by ID

Retrieve single article.

**Endpoint**: `GET /api/articles/[id]`

**Access**: Public

**Response**: `200 OK`

---

## Email Endpoint

### Send Email

Send transactional email.

**Endpoint**: `POST /api/email/send`

**Access**: Internal (used by server-side code)

**Request Body**:
```json
{
  "to": "john@example.com",
  "fullName": "John Doe",
  "emailType": "payment-approval",
  "paymentDate": "11 November 2025",
  "totalAmount": "255000",
  "invoiceNumber": "INV-20251111-12345678"
}
```

**Email Types**:
- `register-verification`: Welcome email
- `payment-approval`: Payment approved with invoice
- `payment-proof-received`: Payment proof received notification
- `forgot-password`: Password reset

**Response**: `200 OK`

---

## User Management Endpoints (Admin)

### 1. Get Users

Retrieve all users.

**Endpoint**: `GET /api/users`

**Access**: Authenticated (ADMIN, SUPER_ADMIN)

**Response**: `200 OK`
```json
{
  "message": "Users retrieved successfully",
  "data": [
    {
      "id": "clx123456",
      "fullName": "John Doe",
      "email": "john@example.com",
      "role": "CUSTOMER",
      "phoneNumber": "+6281234567890",
      "createdAt": "2025-01-01T00:00:00Z"
    }
  ]
}
```

---

### 2. Create Admin User

Create a new admin account.

**Endpoint**: `POST /api/users`

**Access**: Authenticated (SUPER_ADMIN)

**Request Body**:
```json
{
  "fullName": "Admin User",
  "email": "admin@transpo.id",
  "password": "SecurePass123!",
  "role": "ADMIN"
}
```

**Response**: `201 Created`

---

## Achievement & Trusted By Endpoints

### Get Achievements

**Endpoint**: `GET /api/achievements`

**Access**: Public

**Response**: Active achievements sorted by displayOrder

### Get Trusted By

**Endpoint**: `GET /api/trusted-by`

**Access**: Public

**Response**: Active partner logos sorted by displayOrder

---

## Error Codes

| Code | Description |
|------|-------------|
| 400 | Bad Request - Invalid input data |
| 401 | Unauthorized - Authentication required |
| 403 | Forbidden - Insufficient permissions |
| 404 | Not Found - Resource not found |
| 409 | Conflict - Duplicate resource |
| 422 | Unprocessable Entity - Validation failed |
| 500 | Internal Server Error |

---

## Rate Limiting

**To be implemented**:
- 100 requests per minute per IP
- 1000 requests per hour per authenticated user
- Stricter limits for sensitive endpoints (auth, payment)

---

## Webhooks

**Not currently implemented**. Future consideration for:
- Payment gateway webhooks
- SMS notifications
- Third-party integrations

---

## SDK / Client Libraries

**Not available**. Direct HTTP requests using:
- `fetch` API
- `axios`
- Any HTTP client

---

## Versioning

Current version: **v1** (implicit, no version in URL)

Future versions will use URL versioning: `/api/v2/...`

---

## Support

For API issues or questions:
- Email: admin@transpo.id
- Documentation: https://transpo.id/docs
