# StockSense Product, Category, Warehouse & Stock API Documentation

This document provides sample API requests, headers, and responses for the Product Management, Category Management, Warehouse Management, and Stock subsystems in **StockSense**.

Compatible with **Thunder Client**, **Postman**, and **cURL**.

---

## Base URL
```
http://localhost:5000/api
```

## Global Headers
```http
Content-Type: application/json
Authorization: Bearer <your_jwt_token>
```
*(Note: Bearer token is obtained from `POST /api/auth/login`)*

---

## 1. Category Management (`/api/categories`)

### 1.1 Create Category
- **Endpoint**: `POST /api/categories`
- **Auth**: Required (`Bearer <token>`)
- **Request Body**:
```json
{
  "name": "Raw Materials",
  "code": "CAT-RAW",
  "description": "Metals, plastics, and foundational manufacturing inputs",
  "status": "active"
}
```
- **Response (201 Created)**:
```json
{
  "success": true,
  "message": "Category created successfully",
  "data": {
    "category": {
      "_id": "6701b1a2c3d4e5f6a7b8c9d0",
      "name": "Raw Materials",
      "code": "CAT-RAW",
      "description": "Metals, plastics, and foundational manufacturing inputs",
      "status": "active",
      "isActive": true,
      "createdAt": "2026-09-26T09:00:00.000Z",
      "updatedAt": "2026-09-26T09:00:00.000Z"
    }
  }
}
```

### 1.2 Get All Categories
- **Endpoint**: `GET /api/categories`
- **Query Parameters**:
  - `search` (optional): Filter by name or code (e.g., `?search=raw`)
  - `status` (optional): `active` or `inactive`
- **Response (200 OK)**:
```json
{
  "success": true,
  "message": "Categories retrieved successfully",
  "data": {
    "categories": [
      {
        "_id": "6701b1a2c3d4e5f6a7b8c9d0",
        "name": "Raw Materials",
        "code": "CAT-RAW",
        "description": "Metals, plastics, and foundational manufacturing inputs",
        "status": "active",
        "productCount": 5
      }
    ]
  }
}
```

### 1.3 Update Category
- **Endpoint**: `PUT /api/categories/:id`
- **Auth**: Required (`Bearer <token>`)
- **Request Body**:
```json
{
  "name": "Industrial Raw Materials",
  "description": "Updated description for industrial materials"
}
```
- **Response (200 OK)**:
```json
{
  "success": true,
  "message": "Category updated successfully",
  "data": {
    "category": {
      "_id": "6701b1a2c3d4e5f6a7b8c9d0",
      "name": "Industrial Raw Materials",
      "code": "CAT-RAW",
      "status": "active"
    }
  }
}
```

### 1.4 Delete Category
- **Endpoint**: `DELETE /api/categories/:id`
- **Auth**: Required (`Bearer <token>`)
- **Validation**: Cannot delete if products are currently assigned to this category.
- **Response (200 OK)**:
```json
{
  "success": true,
  "message": "Category 'Industrial Raw Materials' (CAT-RAW) deleted successfully",
  "data": null
}
```

---

## 2. Warehouse Management (`/api/warehouses`)

### 2.1 Create Warehouse
- **Endpoint**: `POST /api/warehouses`
- **Auth**: Required (`Bearer <token>`)
- **Request Body**:
```json
{
  "name": "Central Distribution Hub",
  "code": "WH-CENTRAL-01",
  "location": "North Zone, Sector 4",
  "description": "Primary receiving and fulfillment center",
  "city": "Chicago",
  "state": "IL",
  "contactPerson": "Marcus Vance",
  "phone": "+1-555-0199",
  "email": "marcus@stocksense.local",
  "status": "active"
}
```
- **Response (201 Created)**:
```json
{
  "success": true,
  "message": "Warehouse created successfully",
  "data": {
    "warehouse": {
      "_id": "6701c2a3b4c5d6e7f8a9b0c1",
      "name": "Central Distribution Hub",
      "code": "WH-CENTRAL-01",
      "location": "North Zone, Sector 4",
      "description": "Primary receiving and fulfillment center",
      "city": "Chicago",
      "state": "IL",
      "status": "active",
      "isActive": true
    }
  }
}
```

### 2.2 Get All Warehouses
- **Endpoint**: `GET /api/warehouses`
- **Query Parameters**:
  - `search` (optional): `?search=central`
  - `status` (optional): `active` or `inactive`
- **Response (200 OK)**:
```json
{
  "success": true,
  "message": "Warehouses retrieved successfully",
  "data": {
    "warehouses": [
      {
        "_id": "6701c2a3b4c5d6e7f8a9b0c1",
        "name": "Central Distribution Hub",
        "code": "WH-CENTRAL-01",
        "location": "North Zone, Sector 4",
        "totalProducts": 12,
        "totalQuantity": 450,
        "status": "active"
      }
    ]
  }
}
```

### 2.3 Get Warehouse by ID
- **Endpoint**: `GET /api/warehouses/:id`
- **Response (200 OK)**:
```json
{
  "success": true,
  "message": "Warehouse details retrieved successfully",
  "data": {
    "warehouse": {
      "_id": "6701c2a3b4c5d6e7f8a9b0c1",
      "name": "Central Distribution Hub",
      "code": "WH-CENTRAL-01",
      "location": "North Zone, Sector 4",
      "totalProducts": 1,
      "totalQuantity": 15,
      "stocks": [
        {
          "_id": "6701d3a4b5c6d7e8f9a0b1c2",
          "quantity": 15,
          "locationBin": "Aisle 3, Shelf B",
          "product": {
            "_id": "6701e4a5b6c7d8e9f0a1b2c3",
            "name": "Steel Rod",
            "sku": "ROD-STL-001",
            "reorderLevel": 20
          }
        }
      ]
    }
  }
}
```

---

## 3. Product Management (`/api/products`)

### 3.1 Create Product (with optional initial stock)
- **Endpoint**: `POST /api/products`
- **Auth**: Required (`Bearer <token>`)
- **Request Body**:
```json
{
  "name": "Steel Rod",
  "sku": "ROD-STL-001",
  "category": "6701b1a2c3d4e5f6a7b8c9d0",
  "unitOfMeasure": "pcs",
  "reorderLevel": 20,
  "minStockLevel": 5,
  "maxStockLevel": 100,
  "costPrice": 12.50,
  "sellingPrice": 18.00,
  "description": "Standard 10mm high-tensile steel rod for structural assembly",
  "status": "active",
  "initialStock": 15,
  "warehouseId": "6701c2a3b4c5d6e7f8a9b0c1"
}
```
- **Response (201 Created)**:
```json
{
  "success": true,
  "message": "Product created successfully",
  "data": {
    "product": {
      "_id": "6701e4a5b6c7d8e9f0a1b2c3",
      "name": "Steel Rod",
      "sku": "ROD-STL-001",
      "category": {
        "_id": "6701b1a2c3d4e5f6a7b8c9d0",
        "name": "Raw Materials",
        "code": "CAT-RAW"
      },
      "unitOfMeasure": "pcs",
      "reorderLevel": 20,
      "initialStock": 15,
      "totalStock": 15,
      "lowStock": true,
      "status": "active",
      "createdAt": "2026-09-26T09:10:00.000Z",
      "updatedAt": "2026-09-26T09:10:00.000Z"
    }
  }
}
```

### 3.2 List Products (with Search & Filtering)
- **Endpoint**: `GET /api/products`
- **Supported Query Parameters**:
  - `search`: Keyword search matching name or SKU (e.g. `?search=steel`)
  - `sku`: Direct SKU search (e.g. `?sku=ROD-STL-001`)
  - `category`: Category ObjectId (e.g. `?category=6701b1a2c3d4...`)
  - `warehouse`: Warehouse ObjectId (e.g. `?warehouse=6701c2a3...`)
  - `lowStock`: Filter low-stock products (`?lowStock=true`)
  - `outOfStock`: Filter zero-stock products (`?outOfStock=true`)
  - `status`: `active` or `inactive`
  - `page`: Page number (default: 1)
  - `limit`: Page size (default: 20)
- **Response (200 OK)**:
```json
{
  "success": true,
  "message": "Products retrieved successfully",
  "data": {
    "products": [
      {
        "_id": "6701e4a5b6c7d8e9f0a1b2c3",
        "name": "Steel Rod",
        "sku": "ROD-STL-001",
        "category": {
          "_id": "6701b1a2c3d4e5f6a7b8c9d0",
          "name": "Raw Materials",
          "code": "CAT-RAW"
        },
        "unitOfMeasure": "pcs",
        "reorderLevel": 20,
        "totalStock": 15,
        "availableStock": 15,
        "lowStock": true,
        "outOfStock": false,
        "status": "active"
      }
    ],
    "pagination": {
      "total": 1,
      "page": 1,
      "limit": 20,
      "totalPages": 1
    }
  }
}
```

### 3.3 Get Product by ID
- **Endpoint**: `GET /api/products/:id`
- **Response (200 OK)**:
```json
{
  "success": true,
  "message": "Product details retrieved successfully",
  "data": {
    "product": {
      "_id": "6701e4a5b6c7d8e9f0a1b2c3",
      "name": "Steel Rod",
      "sku": "ROD-STL-001",
      "unitOfMeasure": "pcs",
      "reorderLevel": 20,
      "totalStock": 15,
      "availableStock": 15,
      "lowStock": true,
      "outOfStock": false,
      "stocks": [
        {
          "_id": "6701d3a4b5c6d7e8f9a0b1c2",
          "quantity": 15,
          "reservedQuantity": 0,
          "warehouse": {
            "_id": "6701c2a3b4c5d6e7f8a9b0c1",
            "name": "Central Distribution Hub",
            "code": "WH-CENTRAL-01",
            "location": "North Zone, Sector 4"
          }
        }
      ]
    }
  }
}
```

### 3.4 Update Product
- **Endpoint**: `PUT /api/products/:id`
- **Auth**: Required (`Bearer <token>`)
- **Request Body**:
```json
{
  "name": "High-Grade Steel Rod",
  "reorderLevel": 25,
  "sellingPrice": 21.50
}
```
- **Response (200 OK)**:
```json
{
  "success": true,
  "message": "Product updated successfully",
  "data": {
    "product": {
      "_id": "6701e4a5b6c7d8e9f0a1b2c3",
      "name": "High-Grade Steel Rod",
      "sku": "ROD-STL-001",
      "reorderLevel": 25
    }
  }
}
```

### 3.5 Delete Product
- **Endpoint**: `DELETE /api/products/:id`
- **Auth**: Required (`Bearer <token>`)
- **Validation**: Cannot delete if active stock > 0.
- **Response (200 OK)**:
```json
{
  "success": true,
  "message": "Product 'High-Grade Steel Rod' (ROD-STL-001) successfully deleted",
  "data": null
}
```

---

## 4. Stock & Low Stock APIs (`/api/stock`)

### 4.1 Get All Stock Records
- **Endpoint**: `GET /api/stock`
- **Query Parameters**:
  - `warehouse`: Filter by warehouse ID
  - `product`: Filter by product ID
  - `category`: Filter by category ID
  - `lowStock`: `?lowStock=true`
  - `outOfStock`: `?outOfStock=true`
  - `search`: Search product name, SKU, warehouse
- **Response (200 OK)**:
```json
{
  "success": true,
  "message": "Stock records retrieved successfully",
  "data": {
    "stocks": [
      {
        "_id": "6701d3a4b5c6d7e8f9a0b1c2",
        "product": {
          "_id": "6701e4a5b6c7d8e9f0a1b2c3",
          "name": "Steel Rod",
          "sku": "ROD-STL-001",
          "unitOfMeasure": "pcs",
          "reorderLevel": 20
        },
        "warehouse": {
          "_id": "6701c2a3b4c5d6e7f8a9b0c1",
          "name": "Central Distribution Hub",
          "code": "WH-CENTRAL-01",
          "location": "North Zone, Sector 4"
        },
        "quantity": 15,
        "reservedQuantity": 0,
        "availableQuantity": 15,
        "lowStock": true,
        "outOfStock": false
      }
    ],
    "summary": {
      "totalRecords": 1,
      "totalQuantity": 15,
      "totalReserved": 0,
      "totalAvailable": 15
    }
  }
}
```

### 4.2 Get Stock by Product ID
- **Endpoint**: `GET /api/stock/product/:productId`
- **Response (200 OK)**:
```json
{
  "success": true,
  "message": "Product stock retrieved successfully",
  "data": {
    "product": {
      "_id": "6701e4a5b6c7d8e9f0a1b2c3",
      "name": "Steel Rod",
      "sku": "ROD-STL-001",
      "unitOfMeasure": "pcs",
      "reorderLevel": 20,
      "status": "active"
    },
    "inventory": {
      "totalStock": 15,
      "totalReserved": 0,
      "availableStock": 15,
      "lowStock": true,
      "outOfStock": false,
      "deficit": 5
    },
    "warehouses": [
      {
        "warehouseId": "6701c2a3b4c5d6e7f8a9b0c1",
        "warehouseName": "Central Distribution Hub",
        "warehouseCode": "WH-CENTRAL-01",
        "quantity": 15,
        "availableQuantity": 15,
        "locationBin": "Aisle 3, Shelf B"
      }
    ]
  }
}
```

### 4.3 Get Stock by Warehouse ID
- **Endpoint**: `GET /api/stock/warehouse/:warehouseId`
- **Response (200 OK)**:
```json
{
  "success": true,
  "message": "Warehouse stock retrieved successfully",
  "data": {
    "warehouse": {
      "_id": "6701c2a3b4c5d6e7f8a9b0c1",
      "name": "Central Distribution Hub",
      "code": "WH-CENTRAL-01",
      "location": "North Zone, Sector 4"
    },
    "summary": {
      "totalProductsTracked": 1,
      "totalQuantity": 15,
      "lowStockCount": 1,
      "outOfStockCount": 0
    },
    "items": [
      {
        "stockId": "6701d3a4b5c6d7e8f9a0b1c2",
        "product": {
          "_id": "6701e4a5b6c7d8e9f0a1b2c3",
          "name": "Steel Rod",
          "sku": "ROD-STL-001",
          "reorderLevel": 20
        },
        "quantity": 15,
        "availableQuantity": 15,
        "lowStock": true,
        "outOfStock": false
      }
    ]
  }
}
```

### 4.4 Get Low Stock and Out of Stock Report
- **Endpoint**: `GET /api/stock/low-stock`
- **Calculation Rule**:
  - `lowStock`: `0 < currentStock <= reorderLevel`
  - `outOfStock`: `currentStock === 0`
  - `deficit`: `reorderLevel - currentStock`
- **Response (200 OK)**:
```json
{
  "success": true,
  "message": "Low stock inventory report generated",
  "data": {
    "summary": {
      "totalMonitoredProducts": 10,
      "lowStockCount": 2,
      "outOfStockCount": 1,
      "criticalTotal": 3
    },
    "outOfStockProducts": [
      {
        "productId": "6701f5a6b7c8d9e0f1a2b3c4",
        "name": "Copper Pipe 15mm",
        "sku": "PIP-COP-015",
        "unitOfMeasure": "pcs",
        "currentStock": 0,
        "reorderLevel": 10,
        "deficit": 10,
        "suggestedReorderQuantity": 10,
        "status": "OUT_OF_STOCK"
      }
    ],
    "lowStockProducts": [
      {
        "productId": "6701e4a5b6c7d8e9f0a1b2c3",
        "name": "Steel Rod",
        "sku": "ROD-STL-001",
        "unitOfMeasure": "pcs",
        "currentStock": 15,
        "reorderLevel": 20,
        "deficit": 5,
        "suggestedReorderQuantity": 5,
        "status": "LOW_STOCK",
        "warehouses": [
          {
            "warehouse": {
              "_id": "6701c2a3b4c5d6e7f8a9b0c1",
              "name": "Central Distribution Hub"
            },
            "quantity": 15
          }
        ]
      }
    ]
  }
}
```

---

## 5. Standard Error Examples

### 5.1 Validation Error (Empty Name / Duplicate SKU) - Status 400
```json
{
  "success": false,
  "message": "Product with SKU 'ROD-STL-001' already exists"
}
```

### 5.2 Invalid ID Format - Status 400
```json
{
  "success": false,
  "message": "Invalid product ID format"
}
```

### 5.3 Resource Not Found - Status 404
```json
{
  "success": false,
  "message": "Product not found"
}
```

### 5.4 Deletion Blocked by Active Stock - Status 400
```json
{
  "success": false,
  "message": "Cannot delete product 'Steel Rod' because it currently has 15 units in stock. Please adjust stock to 0 first."
}
```
