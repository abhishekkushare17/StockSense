# StockSense Inventory Operations API Documentation

This document provides sample API requests, headers, and responses for **Receipts**, **Delivery Orders**, **Internal Transfers**, **Stock Adjustments**, **Stock Ledger**, and **Dashboard KPIs** in the **StockSense** Inventory Management System.

Designed for testing in **Postman**, **Thunder Client**, and **cURL**.

---

## Base URL
```
http://localhost:5000/api
```

## Global Authentication Headers
```http
Content-Type: application/json
Authorization: Bearer <your_jwt_token>
```
*(Bearer token is obtained via `POST /api/auth/login`)*

---

## 1. Inbound Receipts (`/api/receipts`)

### 1.1 Create Receipt
- **Endpoint**: `POST /api/receipts`
- **Auth**: Required (`Bearer <token>`)
- **Statuses**: `Draft`, `Waiting`, `Ready`, `Done`, `Canceled`
- **Request Body**:
```json
{
  "receiptNumber": "REC-2026-001",
  "supplier": "Apex Industrial Supplies",
  "warehouse": "6701b1a2c3d4e5f6a7b8c9d2",
  "items": [
    {
      "product": "6701b1a2c3d4e5f6a7b8c9d1",
      "quantity": 50,
      "unitCost": 45.00
    }
  ],
  "status": "Ready",
  "notes": "Steel rod shipment received at Bay 4"
}
```
- **Response (201 Created)**:
```json
{
  "success": true,
  "message": "Receipt created successfully",
  "data": {
    "receipt": {
      "_id": "6701b1a2c3d4e5f6a7b8c9e0",
      "receiptNumber": "REC-2026-001",
      "supplier": "Apex Industrial Supplies",
      "warehouse": {
        "_id": "6701b1a2c3d4e5f6a7b8c9d2",
        "name": "Main Warehouse",
        "code": "WH-MAIN"
      },
      "items": [
        {
          "product": {
            "_id": "6701b1a2c3d4e5f6a7b8c9d1",
            "name": "Steel Rod 12mm",
            "sku": "STL-ROD-12"
          },
          "quantity": 50,
          "quantityReceived": 50,
          "unitCost": 45.00
        }
      ],
      "status": "Ready",
      "createdAt": "2026-09-26T10:00:00.000Z"
    }
  }
}
```

### 1.2 Get All Receipts
- **Endpoint**: `GET /api/receipts`
- **Query Parameters**:
  - `status`: Filter by status (`Draft`, `Waiting`, `Ready`, `Done`, `Canceled`)
  - `warehouse`: Filter by Warehouse ID
  - `search`: Search receipt number, supplier, or notes
  - `page`: Page number (default: 1)
  - `limit`: Items per page (default: 20)

### 1.3 Validate Receipt (Stock Increment & Ledger Entry)
- **Endpoint**: `PATCH /api/receipts/:id/validate`
- **Auth**: Required (`Bearer <token>`)
- **Process**:
  - Validates inbound receipt
  - Atomically increases product stock in the warehouse
  - Generates a `StockLedger` audit record with `operationType: 'RECEIPT'`
  - Marks receipt status as `Done`
- **Response (200 OK)**:
```json
{
  "success": true,
  "message": "Receipt validated and stock updated successfully",
  "data": {
    "receipt": {
      "_id": "6701b1a2c3d4e5f6a7b8c9e0",
      "receiptNumber": "REC-2026-001",
      "status": "Done"
    },
    "stockUpdates": [
      {
        "product": "6701b1a2c3d4e5f6a7b8c9d1",
        "warehouse": "6701b1a2c3d4e5f6a7b8c9d2",
        "quantityBefore": 100,
        "quantityAdded": 50,
        "newQuantity": 150
      }
    ]
  }
}
```

---

## 2. Outbound Delivery Orders (`/api/deliveries`)

### 2.1 Create Delivery Order
- **Endpoint**: `POST /api/deliveries`
- **Auth**: Required (`Bearer <token>`)
- **Request Body**:
```json
{
  "deliveryNumber": "DEL-2026-001",
  "customer": "Summit Construction Ltd",
  "warehouse": "6701b1a2c3d4e5f6a7b8c9d2",
  "items": [
    {
      "product": "6701b1a2c3d4e5f6a7b8c9d1",
      "quantity": 20
    }
  ],
  "status": "Draft",
  "notes": "Urgent site delivery"
}
```

### 2.2 Update Lifecycle (Pick → Pack → Ready)
- **Endpoint**: `PUT /api/deliveries/:id`
- **Request Body**:
```json
{
  "status": "Ready",
  "notes": "Order picked and packed in Crate #12"
}
```

### 2.3 Validate Delivery Order (Stock Decrement & Negative Stock Guard)
- **Endpoint**: `PATCH /api/deliveries/:id/validate`
- **Auth**: Required (`Bearer <token>`)
- **Process**:
  - Verifies available warehouse stock $\ge$ delivery quantity
  - If insufficient: Rejects with `400 Bad Request` (`Insufficient stock for product...`)
  - Atomically decrements stock
  - Generates `StockLedger` audit record with `operationType: 'DELIVERY'`
  - Sets delivery status to `Done`
- **Response (200 OK)**:
```json
{
  "success": true,
  "message": "Delivery validated and stock deducted successfully",
  "data": {
    "delivery": {
      "_id": "6701b1a2c3d4e5f6a7b8c9f0",
      "deliveryNumber": "DEL-2026-001",
      "status": "Done"
    },
    "stockUpdates": [
      {
        "product": "6701b1a2c3d4e5f6a7b8c9d1",
        "warehouse": "6701b1a2c3d4e5f6a7b8c9d2",
        "quantityBefore": 150,
        "quantityDeducted": 20,
        "newQuantity": 130
      }
    ]
  }
}
```

---

## 3. Internal Transfers (`/api/transfers`)

### 3.1 Create Transfer Request
- **Endpoint**: `POST /api/transfers`
- **Auth**: Required (`Bearer <token>`)
- **Request Body**:
```json
{
  "transferNumber": "TRF-2026-001",
  "sourceWarehouse": "6701b1a2c3d4e5f6a7b8c9d2",
  "destinationWarehouse": "6701b1a2c3d4e5f6a7b8c9d3",
  "product": "6701b1a2c3d4e5f6a7b8c9d1",
  "quantity": 30,
  "status": "Ready",
  "notes": "Rebalancing stock between Main and Secondary hubs"
}
```

### 3.2 Validate Transfer (Dual-Entry Movement)
- **Endpoint**: `PATCH /api/transfers/:id/validate`
- **Auth**: Required (`Bearer <token>`)
- **Process**:
  - Checks source warehouse stock sufficiency
  - Decreases stock in source warehouse
  - Increases stock in destination warehouse
  - Writes dual ledger entries: `TRANSFER_OUT` and `TRANSFER_IN`
  - Sets transfer status to `Done`
- **Response (200 OK)**:
```json
{
  "success": true,
  "message": "Transfer validated and stock moved successfully",
  "data": {
    "transfer": {
      "_id": "6701b1a2c3d4e5f6a7b8c9g0",
      "transferNumber": "TRF-2026-001",
      "status": "Done"
    },
    "sourceDeduction": 30,
    "destinationAddition": 30
  }
}
```

---

## 4. Stock Adjustments (`/api/adjustments`)

### 4.1 Create Stock Adjustment
- **Endpoint**: `POST /api/adjustments`
- **Auth**: Required (`Bearer <token>`)
- **Request Body**:
```json
{
  "warehouse": "6701b1a2c3d4e5f6a7b8c9d2",
  "product": "6701b1a2c3d4e5f6a7b8c9d1",
  "recordedQuantity": 100,
  "physicalQuantity": 95,
  "reason": "Damaged goods discarded during annual physical count"
}
```
*(Note: `difference` is calculated automatically: `95 - 100 = -5`)*

### 4.2 Validate Stock Adjustment
- **Endpoint**: `PATCH /api/adjustments/:id/validate`
- **Auth**: Required (`Bearer <token>`)
- **Process**:
  - Calculates difference between physical count and system records
  - Updates recorded stock to physical counted quantity
  - Creates `StockLedger` audit record with `operationType: 'ADJUSTMENT'`
  - Marks adjustment status as `Done`
- **Response (200 OK)**:
```json
{
  "success": true,
  "message": "Stock adjustment validated and applied successfully",
  "data": {
    "adjustment": {
      "_id": "6701b1a2c3d4e5f6a7b8c9h0",
      "adjustmentNumber": "ADJ-20260926-AB12",
      "warehouse": "6701b1a2c3d4e5f6a7b8c9d2",
      "items": [
        {
          "product": "6701b1a2c3d4e5f6a7b8c9d1",
          "recordedQuantity": 100,
          "physicalQuantity": 95,
          "difference": -5,
          "reason": "Damaged goods discarded during annual physical count"
        }
      ],
      "status": "Done"
    }
  }
}
```

---

## 5. Stock Ledger (`/api/ledger`)

### 5.1 Query Audit Trail
- **Endpoint**: `GET /api/ledger`
- **Auth**: Required (`Bearer <token>`)
- **Query Parameters**:
  - `product`: Product ID
  - `warehouse`: Warehouse ID
  - `operationType`: `RECEIPT` | `DELIVERY` | `TRANSFER_IN` | `TRANSFER_OUT` | `ADJUSTMENT`
  - `referenceNumber`: Document number
  - `startDate`, `endDate`: Date range filters
  - `page`, `limit`, `sortOrder`: Pagination controls
- **Response (200 OK)**:
```json
{
  "success": true,
  "message": "Stock ledger entries retrieved successfully",
  "data": {
    "entries": [
      {
        "_id": "6701b1a2c3d4e5f6a7b8c9i1",
        "product": {
          "_id": "6701b1a2c3d4e5f6a7b8c9d1",
          "name": "Steel Rod 12mm",
          "sku": "STL-ROD-12"
        },
        "warehouse": {
          "_id": "6701b1a2c3d4e5f6a7b8c9d2",
          "name": "Main Warehouse",
          "code": "WH-MAIN"
        },
        "operationType": "RECEIPT",
        "referenceId": "REC-2026-001",
        "quantityBefore": 100,
        "quantityChange": 50,
        "quantityAfter": 150,
        "timestamp": "2026-09-26T10:15:00.000Z"
      }
    ],
    "pagination": {
      "total": 1,
      "page": 1,
      "limit": 25,
      "pages": 1
    }
  }
}
```

### 5.2 Product Specific Ledger
- **Endpoint**: `GET /api/ledger/product/:productId`
- **Auth**: Required (`Bearer <token>`)

---

## 6. Dashboard KPI Summary (`/api/dashboard/summary`)

- **Endpoint**: `GET /api/dashboard/summary`
- **Auth**: Required (`Bearer <token>`)
- **Response (200 OK)**:
```json
{
  "success": true,
  "message": "Dashboard summary retrieved successfully",
  "data": {
    "totalProducts": 120,
    "lowStockItems": 8,
    "outOfStockItems": 3,
    "pendingReceipts": 5,
    "pendingDeliveries": 12,
    "scheduledTransfers": 4
  }
}
```
