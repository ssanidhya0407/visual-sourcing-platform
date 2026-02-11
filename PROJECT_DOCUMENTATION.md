# Visual Sourcing Platform - Project Documentation

## Table of Contents
1. [System Architecture](#system-architecture)
2. [Database Schema](#database-schema)
3. [API Reference](#api-reference)
4. [User Roles & Permissions](#user-roles--permissions)
5. [Component Structure](#component-structure)
6. [Deployment Guide](#deployment-guide)

---

## 1. System Architecture

### 1.1 High-Level Architecture
```
┌─────────────────────────────────────────────────────────┐
│                     Client Browser                       │
│  ┌─────────────────────────────────────────────────┐   │
│  │         Next.js App (SSR + Client)              │   │
│  │  - Public Pages (/, /internal/login)            │   │
│  │  - Protected Routes (/internal/*)               │   │
│  └─────────────────────────────────────────────────┘   │
└───────────────────────┬─────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────┐
│              Next.js API Routes (/api/*)                │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │
│  │ Public APIs  │  │ Protected    │  │ Admin-Only   │ │
│  │ - /seed      │  │ - /orders    │  │ - /admin/*   │ │
│  │ - /analyze   │  │ - /sourcing  │  │              │ │
│  └──────────────┘  └──────────────┘  └──────────────┘ │
└───────────────────────┬─────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────┐
│                  Firebase Services                       │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │
│  │ Authentication│  │  Firestore   │  │  Admin SDK   │ │
│  │ - JWT Tokens │  │  - Products  │  │  - User Mgmt │ │
│  │ - Custom     │  │  - Orders    │  │  - Custom    │ │
│  │   Claims     │  │  - Tasks     │  │    Claims    │ │
│  └──────────────┘  └──────────────┘  └──────────────┘ │
└─────────────────────────────────────────────────────────┘
```

### 1.2 Technology Stack

| Layer | Technology | Purpose |
|-------|------------|---------|
| Frontend | Next.js 14 (App Router) | Server-side rendering, routing |
| UI Framework | React 18 | Component-based UI |
| Styling | Tailwind CSS | Utility-first styling |
| Type Safety | TypeScript | Static type checking |
| State Management | React Hooks | Local state management |
| Animation | Framer Motion | UI animations |
| Icons | Lucide React | Icon library |
| Authentication | Firebase Auth | User authentication |
| Database | Firestore | NoSQL cloud database |
| Hosting | Vercel | Serverless deployment |
| Version Control | Git/GitHub | Code management |

---

## 2. Database Schema

### 2.1 Firestore Collections

#### **products** Collection
```typescript
interface ProductSKU {
  id: string;                    // SKU identifier (e.g., "INT-RING-001")
  name: string;                  // Product name
  material: string;              // Material composition
  baseCost: number;              // Manufacturing cost (USD)
  moq: number;                   // Minimum order quantity
  leadTime: string;              // Production time (e.g., "5-7 days")
  image: string;                 // Product image URL
  source: 'internal' | 'external'; // Manufacturing source
  attributes: {
    category: string;            // ring, necklace, bracelet
    shape?: string;              // round, oval, emerald, etc.
    stoneDensity?: 'none' | 'low' | 'medium' | 'high';
    metalVisibility?: 'low' | 'medium' | 'high';
    finish?: string;             // polished, matte, vintage, etc.
  };
}
```

#### **orders** Collection
```typescript
interface Order {
  id: string;                    // Auto-generated
  orderNumber: string;           // Display number (e.g., "ORD-20240211-001")
  status: 'Submitted' | 'Quoted' | 'Sourced';
  submittedAt: Timestamp;
  items: OrderItem[];
  totalIntentValue: number;      // Customer's expected budget
  totalQuoteValue?: number;      // Final quoted price (set by Sales)
  notes?: string;                // Customer notes
  quotedItems?: QuotedItem[];    // Items with pricing
  settingsSnapshot?: PricingSettings; // Pricing rules used
}

interface OrderItem {
  id: string;                    // Product SKU
  name: string;
  material: string;
  image: string;
  quantity: number;
  source: 'Internal' | 'External';
  baseCost?: number;             // Set by Sourcing
  moq?: number;
  leadTime?: string;
}

interface QuotedItem extends OrderItem {
  sellPrice: number;
  marginApplied: number;
}
```

#### **users** Collection (Custom Claims in Auth)
```typescript
interface UserClaims {
  role: 'admin' | 'sales' | 'sourcing';
}

// Stored in Firebase Authentication custom claims, not Firestore
```

### 2.2 Data Flow

1. **Customer Uploads Image** → Landing Page
2. **AI Analysis (Mock)** → Generates product recommendations
3. **Customer Submits Order** → Creates document in `orders` collection
4. **Sourcing Reviews** → Updates order items with SKU mappings and costs
5. **Sales Generates Quote** → Calculates pricing, updates order status
6. **Admin Manages** → User accounts and product catalog

---

## 3. API Reference

### 3.1 Public APIs

#### **POST /api/analyze**
Analyzes uploaded jewelry image and returns product recommendations.

**Request:**
```typescript
{
  image: string; // Base64-encoded image data
}
```

**Response:**
```typescript
{
  success: boolean;
  data: {
    primary: ProductSKU;
    alternatives: ProductSKU[];
  }
}
```

#### **POST /api/seed**
Seeds database with default users and products.

**Response:**
```typescript
{
  success: boolean;
  message: string;
}
```

### 3.2 Protected APIs (Requires Authentication)

#### **GET /api/orders**
Fetches all orders (filtered by role).

**Headers:**
```
Authorization: Bearer <firebase-jwt-token>
```

**Response:**
```typescript
{
  success: boolean;
  data: Order[];
}
```

#### **POST /api/orders**
Creates a new order.

**Request:**
```typescript
{
  items: OrderItem[];
  totalIntentValue: number;
  notes?: string;
}
```

#### **POST /api/orders/[id]/quote**
Generates a quote for an order (Sales role only).

**Request:**
```typescript
{
  quotedItems: QuotedItem[];
  totalQuoteValue: number;
  settingsSnapshot: PricingSettings;
}
```

#### **GET /api/sourcing/tasks**
Fetches pending sourcing tasks.

**Response:**
```typescript
{
  success: boolean;
  data: Order[]; // Orders with status "Submitted"
}
```

#### **POST /api/sourcing/tasks**
Updates sourcing task (marks as "Sourced").

**Request:**
```typescript
{
  orderId: string;
  items: OrderItem[];
  status: 'Sourced';
}
```

### 3.3 Admin-Only APIs

#### **GET /api/admin/users**
Lists all users.

**Authorization:** Admin role required

**Response:**
```typescript
{
  success: boolean;
  data: {
    uid: string;
    email: string;
    displayName: string;
    role: string;
  }[];
}
```

#### **POST /api/admin/users**
Creates a new user.

**Request:**
```typescript
{
  email: string;
  password: string;
  displayName: string;
  role: 'admin' | 'sales' | 'sourcing';
}
```

#### **DELETE /api/admin/users?uid=<uid>**
Deletes a user.

#### **GET /api/admin/products**
Lists all products.

#### **POST /api/admin/products**
Creates a product.

#### **DELETE /api/admin/products?id=<id>**
Deletes a product.

#### **GET /api/admin/settings**
Retrieves pricing settings.

**Response:**
```typescript
{
  success: boolean;
  data: {
    internalMargin: number;
    externalMargin: number;
    taxRate: number;
  }
}
```

#### **POST /api/admin/settings**
Updates pricing settings.

---

## 4. User Roles & Permissions

| Feature | Public | Sales | Sourcing | Admin |
|---------|--------|-------|----------|-------|
| Upload Image | ✅ | ✅ | ✅ | ✅ |
| View Products | ✅ | ✅ | ✅ | ✅ |
| Submit Order | ✅ | ✅ | ✅ | ✅ |
| View All Orders | ❌ | ✅ | ✅ | ✅ |
| Generate Quote | ❌ | ✅ | ❌ | ✅ |
| Sourcing Tasks | ❌ | ❌ | ✅ | ✅ |
| Global Supplier Search | ❌ | ❌ | ✅ | ✅ |
| Manage Users | ❌ | ❌ | ❌ | ✅ |
| Manage Products | ❌ | ❌ | ❌ | ✅ |
| Update Settings | ❌ | ❌ | ❌ | ✅ |

---

## 5. Component Structure

### 5.1 Page Hierarchy

```
src/
├── app/
│   ├── page.tsx                    # Public landing page
│   ├── internal/
│   │   ├── login/
│   │   │   └── page.tsx           # Login page
│   │   ├── layout.tsx             # Shared sidebar layout
│   │   ├── admin/
│   │   │   └── page.tsx           # Admin dashboard
│   │   ├── sales/
│   │   │   └── page.tsx           # Sales orders
│   │   ├── sourcing/
│   │   │   └── page.tsx           # Sourcing tasks
│   │   ├── products/
│   │   │   └── page.tsx           # Product catalog
│   │   ├── users/
│   │   │   └── page.tsx           # User management
│   │   ├── settings/
│   │   │   └── page.tsx           # Settings
│   │   └── audit/
│   │       └── page.tsx           # Audit logs
│   └── api/
│       ├── analyze/
│       │   └── route.ts           # Image analysis
│       ├── seed/
│       │   └── route.ts           # Database seeding
│       ├── orders/
│       │   ├── route.ts           # Order CRUD
│       │   └── [id]/
│       │       └── quote/
│       │           └── route.ts   # Quote generation
│       ├── sourcing/
│       │   └── tasks/
│       │       └── route.ts       # Sourcing tasks
│       └── admin/
│           ├── users/
│           │   └── route.ts       # User management
│           ├── products/
│           │   └── route.ts       # Product management
│           └── settings/
│               └── route.ts       # Settings management
├── components/
│   ├── UploadSection.tsx          # Image upload UI
│   ├── RecommendationSection.tsx  # Product recommendations
│   └── RecommendationCard.tsx     # Single product card
├── services/
│   ├── catalogService.ts          # Product matching logic
│   ├── sourcingService.ts         # AI analysis (mock)
│   └── manufacturerService.ts     # Global supplier search
└── lib/
    ├── firebase.ts                # Client Firebase config
    └── firebase-admin.ts          # Server Firebase config
```

### 5.2 Key Components

#### **UploadSection.tsx**
- Handles image upload
- Calls `/api/analyze`
- Displays analysis results

#### **RecommendationSection.tsx**
- Shows primary match and alternatives
- Collects customer information
- Submits order

#### **InternalLayout.tsx**
- Sidebar navigation
- Role-based menu items
- User profile and logout

---

## 6. Deployment Guide

### 6.1 Prerequisites

1. **Firebase Project**
   - Create project at https://console.firebase.google.com
   - Enable Authentication (Email/Password)
   - Enable Firestore Database
   - Generate service account key

2. **GitHub Repository**
   - Push code to GitHub
   - Set as public or private

3. **Vercel Account**
   - Sign up at https://vercel.com
   - Connect GitHub account

### 6.2 Environment Variables

Create `.env.local` with:

```env
# Firebase Client Config (Public)
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# Firebase Admin (Private - Base64 encoded service account JSON)
FIREBASE_SERVICE_ACCOUNT_KEY=base64_encoded_service_account_json
```

### 6.3 Deployment Steps

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Initial deployment"
   git push origin main
   ```

2. **Deploy to Vercel**
   - Go to https://vercel.com/new
   - Import GitHub repository
   - Add environment variables
   - Click "Deploy"

3. **Seed Database**
   ```bash
   curl -X POST https://your-vercel-url.vercel.app/api/seed
   ```

4. **Login**
   - Navigate to `/internal/login`
   - Use default credentials:
     - Admin: `admin@yash.com` / `password123`
     - Sales: `sales@yash.com` / `password123`
     - Sourcing: `sourcing@yash.com` / `password123`

### 6.4 Production Considerations

- [ ] Change default passwords
- [ ] Enable Firebase security rules
- [ ] Set up custom domain
- [ ] Configure CORS policies
- [ ] Enable error monitoring (e.g., Sentry)
- [ ] Set up backup strategy for Firestore
- [ ] Implement rate limiting on API routes
- [ ] Add proper logging

---

## 7. Maintenance & Support

### 7.1 Common Issues

**Issue: "User list is empty"**
- Ensure API route includes Authorization header
- Check that `onAuthStateChanged` is used in component

**Issue: "Broken images"**
- Run `/api/seed` to repopulate with verified URLs
- Check Unsplash image IDs are valid

**Issue: "Permission denied"**
- Verify user has correct role in Firebase custom claims
- Check API route authorization logic

### 7.2 Code Quality

- Run `npm run lint` before committing
- Use `npm run build` locally to catch build errors
- Test on multiple browsers (Chrome, Safari, Firefox)
- Verify responsive design on mobile/tablet

---

## 8. Contact & Resources

- **GitHub Repository**: [Link to your repo]
- **Live Demo**: [Vercel URL]
- **Firebase Console**: https://console.firebase.google.com/project/[your-project-id]
- **Vercel Dashboard**: https://vercel.com/[your-username]/[your-project]

---

*Last Updated: February 11, 2026*
