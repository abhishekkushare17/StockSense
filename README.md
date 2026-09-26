# StockSense - Modular Inventory Management System

StockSense is a modular, real-time Inventory Management System built on the MERN stack (MongoDB, Express, React, Node.js) with Vite and Tailwind CSS. It replaces traditional paper registers and spreadsheet-based tracking with a unified, role-based platform.

---

## 🌟 Core Architecture Foundation

This repository provides the core architectural foundation developed by the Full-Stack Lead Developer (`feature/abhishek-core`):

- **Clean MERN Folder Structure**: Structured `/client` and `/server` boundaries for modular development.
- **Robust Database Foundation**: 10 clean Mongoose schemas ready for operational modules.
- **Secure Authentication & RBAC**: JWT Bearer token authentication, bcrypt password hashing, and role-based access control (`Inventory Manager` & `Warehouse Staff`).
- **Standardized Backend**: Centralized error handler, consistent JSON API responses, input validation, and CORS setup.
- **Modern React + Tailwind Client**: Pre-configured Axios instance with automatic token interceptors, `AuthContext`, `ProtectedRoute`, and 9 reusable UI components.
- **REST API Documentation**: Complete specification at `/docs/API.md`.

---

## 📁 Project Structure

```
StockSense/
├── client/
│   ├── src/
│   │   ├── components/
│   │   │   └── common/           # 9 reusable Tailwind UI components
│   │   │       ├── Badge.jsx
│   │   │       ├── Button.jsx
│   │   │       ├── ConfirmDialog.jsx
│   │   │       ├── EmptyState.jsx
│   │   │       ├── ErrorMessage.jsx
│   │   │       ├── Input.jsx
│   │   │       ├── Loading.jsx
│   │   │       ├── Modal.jsx
│   │   │       └── Table.jsx
│   │   ├── context/
│   │   │   └── AuthContext.jsx   # Global session state & actions
│   │   ├── hooks/
│   │   │   └── useAuth.js        # AuthContext consumer hook
│   │   ├── layouts/
│   │   │   ├── AuthLayout.jsx    # Centered card layout for login/signup
│   │   │   └── MainLayout.jsx    # Top navbar, role badge, session logout
│   │   ├── pages/
│   │   │   ├── DashboardPage.jsx # Team integration surface & status
│   │   │   ├── LoginPage.jsx     # User authentication
│   │   │   ├── ProfilePage.jsx   # Profile management & password change
│   │   │   └── SignupPage.jsx    # New user onboarding & role selection
│   │   ├── routes/
│   │   │   ├── AppRoutes.jsx     # Application routes & 404 handler
│   │   │   └── ProtectedRoute.jsx# Auth & RBAC route guard
│   │   ├── services/
│   │   │   ├── api.js            # Axios client with JWT interceptor
│   │   │   └── authService.js    # Auth & profile API client methods
│   │   ├── utils/
│   │   │   ├── constants.js      # Roles and local storage keys
│   │   │   └── formatters.js     # Currency, date, and number formatters
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── vite.config.js
│   └── tailwind.config.js
│
├── server/
│   ├── config/
│   │   ├── db.js                 # MongoDB connection logic
│   │   └── env.js                # Centralized environment variables
│   ├── controllers/
│   │   ├── auth.controller.js    # Register, login, me, logout
│   │   └── user.controller.js    # Profile view/edit, change password
│   ├── middleware/
│   │   ├── auth.middleware.js    # JWT protect & role authorization
│   │   ├── error.middleware.js   # 404 & centralized error handling
│   │   ├── validate.middleware.js# Input sanitization and validation
│   │   └── async.middleware.js   # Async try-catch elimination wrapper
│   ├── models/                   # 10 Core MongoDB Schemas
│   │   ├── Category.js
│   │   ├── Delivery.js
│   │   ├── InternalTransfer.js
│   │   ├── Product.js
│   │   ├── Receipt.js
│   │   ├── Stock.js
│   │   ├── StockAdjustment.js
│   │   ├── StockLedger.js
│   │   ├── User.js
│   │   ├── Warehouse.js
│   │   └── index.js
│   ├── routes/
│   │   ├── auth.routes.js        # /api/auth routes
│   │   ├── user.routes.js        # /api/users routes
│   │   └── index.js              # Central route aggregator
│   ├── services/
│   │   ├── auth.service.js
│   │   └── user.service.js
│   ├── utils/
│   │   ├── apiResponse.js        # Standardized { success, message, data }
│   │   └── constants.js          # Roles, statuses, transaction types
│   ├── app.js
│   └── server.js
│
├── docs/
│   └── API.md                    # Comprehensive REST API Documentation
└── package.json                  # Root orchestration scripts
```

---

## 🚀 Quick Start Guide

### 1. Prerequisites
- **Node.js** (v18.0 or newer)
- **MongoDB** (Local instance or MongoDB Atlas URI)

### 2. Environment Setup
Create a `.env` file in `/server` (or duplicate `server/.env.example`):
```ini
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://localhost:27017/stocksense
JWT_SECRET=your_jwt_secret_key_change_in_production
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:3000
```

### 3. Installation
Install all dependencies across root, server, and client:
```bash
npm run install:all
```

### 4. Running the Development Environment
Run both backend and frontend concurrently:
```bash
npm run dev
```
- Client runs on: `http://localhost:3000`
- Server API runs on: `http://localhost:5000`
- API Health check: `http://localhost:5000/api/health`

### 5. Running Automated Backend Tests
```bash
npm run test:server
```

---

## 🔌 Instructions for Team Members

When merging or building your designated modules (e.g. Products, Receipts, Deliveries, Transfers):

1. **Database Models**: All core models (`Product`, `Stock`, `Receipt`, etc.) are pre-built in `/server/models/index.js`. Import them directly:
   ```javascript
   const { Product, Stock, StockLedger } = require('../models');
   ```

2. **Route Protection**: Use the exported auth middleware:
   ```javascript
   const { protect, authorize } = require('../middleware');
   router.post('/action', protect, authorize('Inventory Manager'), controllerMethod);
   ```

3. **API Responses**: Always return standard responses:
   ```javascript
   const { successResponse, errorResponse } = require('../utils/apiResponse');
   ```

4. **Frontend API Calls**: Use the pre-configured Axios instance (`client/src/services/api.js`). It automatically includes JWT tokens in request headers and redirects to `/login` if a token expires.

5. **Frontend UI Components**: Utilize the 9 common components in `client/src/components/common`:
   - `Button`, `Input`, `Modal`, `Table`, `Badge`, `Loading`, `EmptyState`, `ErrorMessage`, `ConfirmDialog`.
