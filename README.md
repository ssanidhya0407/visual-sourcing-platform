# 🎨 Visual Sourcing Platform

> AI-powered jewelry sourcing and manufacturing workflow automation platform

[![Next.js](https://img.shields.io/badge/Next.js-14-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Firebase](https://img.shields.io/badge/Firebase-10-orange?style=flat-square&logo=firebase)](https://firebase.google.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.0-38B2AC?style=flat-square&logo=tailwind-css)](https://tailwindcss.com/)
[![Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?style=flat-square&logo=vercel)](https://vercel.com/)

## 📋 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Getting Started](#-getting-started)
- [Project Structure](#-project-structure)
- [User Roles](#-user-roles)
- [API Documentation](#-api-documentation)
- [Deployment](#-deployment)
- [Screenshots](#-screenshots)
- [Contributing](#-contributing)
- [License](#-license)

## 🎯 Overview

The Visual Sourcing Platform revolutionizes the jewelry manufacturing industry by automating the gap between customer design concepts and actual production. Using AI-powered image analysis and intelligent supplier matching, it streamlines the entire sourcing workflow from initial inquiry to final quote.

### Key Problems Solved

✅ **Manual Sourcing**: Automates hours of manual supplier research  
✅ **Cost Estimation**: Instant pricing based on design complexity  
✅ **Supplier Discovery**: Global manufacturer matching with real-time data  
✅ **Quote Generation**: Automated pricing with configurable margins  
✅ **Workflow Transparency**: Role-based dashboards for complete visibility

## ✨ Features

### 🌍 Public Portal
- **Visual Upload**: Drag-and-drop jewelry image upload
- **AI Analysis**: Intelligent design attribute extraction
- **Product Matching**: Instant internal catalog recommendations
- **Order Submission**: Seamless quote request workflow

### 💼 Sales Dashboard
- **Order Management**: View and process all customer requests
- **Quote Generator**: Automated pricing with margin calculation
- **Status Tracking**: Real-time order status updates
- **Customer Notes**: Contextual information for each order

### 🔧 Sourcing Dashboard
- **Feasibility Assessment**: Evaluate manufacturability
- **SKU Mapping**: Match designs to internal inventory
- **Global Supplier Search**: Simulate Alibaba/Indiamart searches
- **Cost Estimation**: Assign base costs and lead times

### ⚙️ Admin Panel
- **User Management**: Create/delete users with role assignment
- **Product Catalog**: Manage internal and external SKUs
- **Pricing Settings**: Configure margins and tax rates
- **Audit Logs**: Track system activity (coming soon)

## 🛠 Tech Stack

| Category | Technology |
|----------|------------|
| **Frontend** | Next.js 14 (App Router), React 18, TypeScript |
| **Styling** | Tailwind CSS, Framer Motion |
| **Backend** | Next.js API Routes, Firebase Admin SDK |
| **Database** | Firebase Firestore (NoSQL) |
| **Authentication** | Firebase Auth with Custom Claims |
| **Hosting** | Vercel (Serverless) |
| **Version Control** | Git, GitHub |

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm
- Firebase account (free tier works)
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/visual-sourcing-platform.git
   cd visual-sourcing-platform
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up Firebase**
   - Create a Firebase project at https://console.firebase.google.com
   - Enable Authentication (Email/Password provider)
   - Enable Firestore Database
   - Download service account key (Settings → Service Accounts → Generate New Private Key)

4. **Configure environment variables**
   
   Create `.env.local`:
   ```env
   # Firebase Client Config (from Project Settings → General)
   NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

   # Firebase Admin (Base64-encode your service account JSON)
   FIREBASE_SERVICE_ACCOUNT_KEY=base64_encoded_json
   ```

   To encode your service account JSON:
   ```bash
   cat serviceAccountKey.json | base64
   ```

5. **Run development server**
   ```bash
   npm run dev
   ```
   Open http://localhost:3000

6. **Seed the database**
   ```bash
   curl -X POST http://localhost:3000/api/seed
   ```

### Default Login Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@yash.com | password123 |
| Sales | sales@yash.com | password123 |
| Sourcing | sourcing@yash.com | password123 |

⚠️ **Change these passwords immediately in production!**

## 📁 Project Structure

```
visual-sourcing-platform/
├── src/
│   ├── app/                      # Next.js App Router
│   │   ├── page.tsx             # Public landing page
│   │   ├── api/                 # Backend API routes
│   │   │   ├── analyze/         # Image analysis
│   │   │   ├── orders/          # Order management
│   │   │   ├── sourcing/        # Sourcing tasks
│   │   │   ├── admin/           # Admin operations
│   │   │   └── seed/            # Database seeding
│   │   └── internal/            # Protected dashboards
│   │       ├── login/
│   │       ├── sales/
│   │       ├── sourcing/
│   │       ├── admin/
│   │       ├── products/
│   │       └── users/
│   ├── components/              # Reusable React components
│   ├── services/                # Business logic
│   │   ├── catalogService.ts    # Product matching
│   │   ├── sourcingService.ts   # AI analysis (mock)
│   │   └── manufacturerService.ts # Supplier search
│   └── lib/                     # Utilities
│       ├── firebase.ts          # Client config
│       └── firebase-admin.ts    # Server config
├── public/                      # Static assets
├── METHODOLOGY.md               # Development approach
├── PROJECT_DOCUMENTATION.md     # Technical reference
└── README.md                    # You are here
```

## 👥 User Roles

### 🔴 Admin
- Full system access
- User management (create/delete)
- Product catalog control
- Pricing configuration
- System settings

### 🔵 Sales
- View all customer orders
- Generate quotes with automatic pricing
- Update order status
- View product catalog

### 🟢 Sourcing
- View pending feasibility requests
- Map designs to SKUs
- Search global suppliers
- Assign manufacturing costs

### ⚪ Public
- Upload jewelry images
- View recommendations
- Submit quote requests

## 📡 API Documentation

### Public Endpoints

#### POST `/api/analyze`
Analyzes uploaded image and returns product recommendations.

**Request:**
```json
{
  "image": "base64_encoded_image_data"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "primary": { /* Product object */ },
    "alternatives": [ /* Array of products */ ]
  }
}
```

### Protected Endpoints (Requires Auth Token)

#### GET `/api/orders`
Fetch all orders (filtered by role).

**Headers:**
```
Authorization: Bearer <firebase-jwt-token>
```

#### POST `/api/orders`
Create a new order.

#### POST `/api/orders/[id]/quote`
Generate quote (Sales only).

### Admin Endpoints

#### GET `/api/admin/users`
List all users.

#### POST `/api/admin/users`
Create user with role.

```json
{
  "email": "user@example.com",
  "password": "securepass",
  "displayName": "John Doe",
  "role": "sales"
}
```

See [PROJECT_DOCUMENTATION.md](./PROJECT_DOCUMENTATION.md) for complete API reference.

## 🌐 Deployment

### Deploy to Vercel (Recommended)

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Ready for deployment"
   git push origin main
   ```

2. **Connect to Vercel**
   - Go to https://vercel.com/new
   - Import your repository
   - Add environment variables from `.env.local`
   - Click **Deploy**

3. **Seed Production Database**
   ```bash
   curl -X POST https://your-app.vercel.app/api/seed
   ```

4. **Update Passwords**
   - Login as admin
   - Navigate to `/internal/users`
   - Delete and recreate users with secure passwords

### Environment Variables on Vercel

Add all variables from `.env.local` in:
**Project Settings → Environment Variables**

## 📸 Screenshots

### Landing Page
![Landing Page](https://via.placeholder.com/800x450.png?text=Upload+%26+Analyze)

### Sales Dashboard
![Sales Dashboard](https://via.placeholder.com/800x450.png?text=Order+Management)

### Sourcing Dashboard
![Sourcing Dashboard](https://via.placeholder.com/800x450.png?text=Feasibility+Assessment)

### Admin Panel
![Admin Panel](https://via.placeholder.com/800x450.png?text=User+Management)

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Development Guidelines

- Run `npm run lint` before committing
- Write meaningful commit messages
- Test on multiple browsers
- Update documentation for new features

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) - The React framework
- [Firebase](https://firebase.google.com/) - Backend-as-a-Service
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS
- [Vercel](https://vercel.com/) - Deployment platform
- [Lucide](https://lucide.dev/) - Beautiful icons

## 📞 Support

For questions or support:

- 📧 Email: support@yourdomain.com
- 🐛 Issues: [GitHub Issues](https://github.com/yourusername/visual-sourcing-platform/issues)
- 📖 Docs: [PROJECT_DOCUMENTATION.md](./PROJECT_DOCUMENTATION.md)

---

**Built with ❤️ for the jewelry manufacturing industry**

*Last Updated: February 11, 2026*
