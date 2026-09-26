# StockSense REST API Documentation

This document specifies the standard API contracts, authentication procedures, and endpoints for the **StockSense Inventory Management System**.

---

## 1. Global API Standards

### Base URL
```
http://localhost:5000/api
```

### Standard Response Formats

#### Success Response (Status 200 / 201)
All successful operations follow a consistent envelope structure:
```json
{
  "success": true,
  "message": "Human-readable success message",
  "data": {}
}
```

#### Error Response (Status 400 / 401 / 403 / 404 / 500)
All failed requests follow a standardized error structure:
```json
{
  "success": false,
  "message": "Human-readable error message",
  "errors": [] // Optional validation details
}
```

---

## 2. Authentication Mechanism

StockSense uses **JSON Web Tokens (JWT)**.
- Protected endpoints require an `Authorization` header formatted as:
  ```http
  Authorization: Bearer <your_jwt_token>
  ```
- Tokens are issued upon successful registration or login and have an expiration period (default: 7 days).

### Supported User Roles
- `Inventory Manager`: Full administrative oversight, stock adjustments, ledger access, user visibility.
- `Warehouse Staff`: Operational floor tasks (inbound receipts, transfers, delivery picking/dispatching).

---

## 3. Endpoints Specification

### 3.1 Health Check

#### Check API Health
- **Endpoint**: `/health`
- **Method**: `GET`
- **Authentication**: None (Public)
- **Request Body**: None
- **Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "StockSense API is active and healthy",
    "data": {
      "timestamp": "2026-09-26T08:50:00.000Z",
      "uptime": 128.4
    }
  }
  ```

---

### 3.2 Authentication Endpoints (`/api/auth`)

#### 1. Register User
- **Endpoint**: `/api/auth/register`
- **Method**: `POST`
- **Authentication**: None (Public)
- **Request Body**:
  ```json
  {
    "name": "Jane Doe",
    "email": "jane@company.com",
    "password": "Password123!",
    "role": "Warehouse Staff" // Optional: "Inventory Manager" or "Warehouse Staff" (default)
  }
  ```
- **Validation Rules**:
  - `name`: String, required, min 2 characters.
  - `email`: String, required, valid email format, unique.
  - `password`: String, required, min 6 characters.
  - `role`: Optional, must be either "Inventory Manager" or "Warehouse Staff".
- **Response (201 Created)**:
  ```json
  {
    "success": true,
    "message": "User registered successfully",
    "data": {
      "user": {
        "_id": "6701a2b3c4d5e6f7a8b9c0d1",
        "name": "Jane Doe",
        "email": "jane@company.com",
        "role": "Warehouse Staff",
        "status": "active",
        "createdAt": "2026-09-26T08:55:00.000Z",
        "updatedAt": "2026-09-26T08:55:00.000Z"
      },
      "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
    }
  }
  ```
- **Error Responses**:
  - `400 Bad Request`: Validation failure or email already registered.

---

#### 2. User Login
- **Endpoint**: `/api/auth/login`
- **Method**: `POST`
- **Authentication**: None (Public)
- **Request Body**:
  ```json
  {
    "email": "jane@company.com",
    "password": "Password123!"
  }
  ```
- **Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Login successful",
    "data": {
      "user": {
        "_id": "6701a2b3c4d5e6f7a8b9c0d1",
        "name": "Jane Doe",
        "email": "jane@company.com",
        "role": "Warehouse Staff",
        "status": "active"
      },
      "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
    }
  }
  ```
- **Error Responses**:
  - `400 Bad Request`: Missing email or password.
  - `401 Unauthorized`: Invalid email or incorrect password.
  - `403 Forbidden`: Account is inactive or deactivated.

---

#### 3. Current User (`me`)
- **Endpoint**: `/api/auth/me`
- **Method**: `GET`
- **Authentication**: Required (`Bearer <token>`)
- **Request Body**: None
- **Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Current user profile retrieved",
    "data": {
      "user": {
        "_id": "6701a2b3c4d5e6f7a8b9c0d1",
        "name": "Jane Doe",
        "email": "jane@company.com",
        "role": "Warehouse Staff",
        "status": "active",
        "createdAt": "2026-09-26T08:55:00.000Z",
        "updatedAt": "2026-09-26T08:55:00.000Z"
      }
    }
  }
  ```
- **Error Responses**:
  - `401 Unauthorized`: Missing, expired, or invalid token.

---

#### 4. Logout
- **Endpoint**: `/api/auth/logout`
- **Method**: `POST`
- **Authentication**: None / Optional
- **Request Body**: None
- **Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Logged out successfully",
    "data": null
  }
  ```

---

### 3.3 User Profile Endpoints (`/api/users`)

#### 1. Get User Profile
- **Endpoint**: `/api/users/profile`
- **Method**: `GET`
- **Authentication**: Required (`Bearer <token>`)
- **Request Body**: None
- **Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Profile retrieved successfully",
    "data": {
      "user": {
        "_id": "6701a2b3c4d5e6f7a8b9c0d1",
        "name": "Jane Doe",
        "email": "jane@company.com",
        "role": "Warehouse Staff",
        "status": "active",
        "createdAt": "2026-09-26T08:55:00.000Z",
        "updatedAt": "2026-09-26T08:55:00.000Z"
      }
    }
  }
  ```

---

#### 2. Update Profile
- **Endpoint**: `/api/users/profile`
- **Method**: `PUT`
- **Authentication**: Required (`Bearer <token>`)
- **Request Body**:
  ```json
  {
    "name": "Jane Smith",
    "email": "janesmith@company.com"
  }
  ```
- **Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Profile updated successfully",
    "data": {
      "user": {
        "_id": "6701a2b3c4d5e6f7a8b9c0d1",
        "name": "Jane Smith",
        "email": "janesmith@company.com",
        "role": "Warehouse Staff",
        "status": "active",
        "updatedAt": "2026-09-26T09:00:00.000Z"
      }
    }
  }
  ```
- **Error Responses**:
  - `400 Bad Request`: Email already in use or invalid fields.

---

#### 3. Change Password
- **Endpoint**: `/api/users/change-password`
- **Method**: `PUT`
- **Authentication**: Required (`Bearer <token>`)
- **Request Body**:
  ```json
  {
    "currentPassword": "Password123!",
    "newPassword": "NewStrongPassword456!"
  }
  ```
- **Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Password updated successfully",
    "data": null
  }
  ```
- **Error Responses**:
  - `400 Bad Request`: Current password incorrect or new password too short (< 6 chars).

---

## 4. Database Schema Reference

The core database foundation provides 10 Mongoose models exported from `/server/models/index.js`:

| Model | Collection | Primary Responsibility | Key Fields |
| :--- | :--- | :--- | :--- |
| **`User`** | `users` | User credentials, roles, authorization | `name`, `email`, `password`, `role`, `status` |
| **`Warehouse`** | `warehouses` | Physical facility master data | `name`, `code`, `city`, `state`, `contactPerson`, `phone`, `isActive` |
| **`Category`** | `categories` | Product grouping taxonomy | `name`, `code`, `description`, `isActive` |
| **`Product`** | `products` | Inventory catalog items and thresholds | `name`, `sku`, `category`, `unitOfMeasure`, `minStockLevel`, `reorderPoint` |
| **`Stock`** | `stocks` | Quantities per product per facility | `product`, `warehouse`, `quantity`, `reservedQuantity`, `locationBin` |
| **`Receipt`** | `receipts` | Inbound supplier shipment receipts | `receiptNumber`, `supplierName`, `warehouse`, `items[]`, `status`, `receivedBy` |
| **`Delivery`** | `deliveries` | Outbound customer shipping orders | `deliveryNumber`, `customerName`, `warehouse`, `items[]`, `status`, `dispatchedBy` |
| **`InternalTransfer`** | `internaltransfers` | Warehouse-to-warehouse stock transfers | `transferNumber`, `sourceWarehouse`, `destinationWarehouse`, `items[]`, `status` |
| **`StockAdjustment`** | `stockadjustments` | Discrepancy audits and manual corrections | `adjustmentNumber`, `warehouse`, `items[]` (`oldQty`, `newQty`, `reason`), `status` |
| **`StockLedger`** | `stockledgers` | Immutable audit log of all stock movements | `product`, `warehouse`, `transactionType`, `referenceNumber`, `quantityChanged`, `balanceAfter` |

---

## 5. Developer Guide for Team Modules

Team members creating their modules should follow these conventions:

### Using Backend Middleware
```javascript
const { protect, authorize, validateRegister, asyncHandler } = require('../middleware');

// Protect route (authenticated users only):
router.get('/my-module', protect, myController);

// Restrict to Inventory Managers:
router.post('/my-module/adjust', protect, authorize('Inventory Manager'), myController);
```

### Using Consistent API Responses
```javascript
const { successResponse, errorResponse } = require('../utils/apiResponse');

// In your controller:
return successResponse(res, 'Item created successfully', newItem, 201);
```

### Using Frontend Components
```jsx
import { Button, Input, Modal, Table, Badge, Loading, EmptyState, ErrorMessage, ConfirmDialog } from '../components/common';
import api from '../services/api';

// api automatically attaches Bearer tokens to all requests
const fetchItems = async () => {
  const response = await api.get('/items');
  return response.data.data;
};
```
