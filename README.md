<p align="center">
  <img src="client/public/logo.png" width="90" height="90" alt="StockSense Logo" style="border-radius: 20px; box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.2);" />
</p>

<h1 align="center">StockSense — Intelligent Inventory OS</h1>

<p align="center">
  <strong>Centralized Real-Time Inventory Management & Predictive Intelligence Platform</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Stack-MERN-1b2839?style=for-the-badge&logo=mongodb" alt="MERN Stack" />
  <img src="https://img.shields.io/badge/Frontend-React_19_+_Vite-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React 19" />
  <img src="https://img.shields.io/badge/Styling-Tailwind_CSS-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/Backend-Node.js_+_Express-339933?style=for-the-badge&logo=node.js&logoColor=white" alt="Node.js" />
  <img src="https://img.shields.io/badge/Tests-21%20Passing-10B981?style=for-the-badge&logo=mocha" alt="Tests" />
  <img src="https://img.shields.io/badge/Theme-Midnight_Slate-1e2b3e?style=for-the-badge" alt="Theme" />
</p>

---

## 📖 Overview

**StockSense** is an enterprise-grade Inventory Intelligence Operating System designed to replace fragmented spreadsheets, manual registers, and disjointed warehouse tracking. Built on modern **MERN** architecture, StockSense goes beyond basic CRUD operations to act as a **proactive operational cockpit**—forecasting stockouts before they happen, surfacing daily action plans, detecting stock anomalies, and guiding replenishment decisions in real time.

---

## ⚡ Core Feature Highlights

### 1. 📊 Top-Side Visual Analytics & Telemetry
Interactive visualization engine prominently positioned at the top of the command center:
* **Stock by Category**: Multi-segment donut chart displaying real-time inventory allocation.
* **Stock Movement Trends**: Dual-gradient area chart tracking Inbound vs. Outbound flow across timeline activity.
* **Incoming vs. Outgoing**: Fulfillment balance bar comparison of pending operations and movement volume.
* **Stock by Warehouse**: Facility capacity breakdown visualizing distribution across regional warehouses.
* **Multi-Criteria Filter Bar**: Dynamic slicing by Category, Warehouse Facility, Document Type, and Status.

### 2. 🧠 Proactive Intelligence Suite
* **Daily Action Center ("What Should I Do Today?")**: Dynamic prioritization queue organizing urgent reorders, pending deliveries, ready receipts, and critical stock depletion tasks into one-click actionable cards.
* **Stock Forecast & Stockout Prediction**: Algorithmic burn-rate calculations estimating runout days, depletion curves, and risk tiers (CRITICAL, HIGH, MODERATE, SAFE).
* **Inventory Risk Radar**: Multi-axis operational threat matrix monitoring stock concentration, single-facility bottlenecks, and lead-time delays.
* **Autonomous Anomaly Detection**: Heuristic engine flagging abnormal volume spikes, unexpected stock shrinkage, ghost inventory, and rapid burn events.
* **Interactive What-If Simulator**: Sandbox tool modeling the impact of demand spikes (+10% to +200%) and supplier lead-time changes on buffer stock and projected days of coverage.
* **"Where is My Stock?" Instant Locator**: Search engine indexing products across warehouses, aisles, racks, and bin coordinates.
* **Smart Reorder Recommendations & Health Score**: EOQ-guided reorder quantity calculation paired with a 360-degree circular Inventory Health gauge.

### 3. 📦 Full Operations Lifecycle
* **Inbound Receipts**: Supplier purchase receipts with draft-to-done workflow, batch intake, and automatic stock incrementing.
* **Outbound Deliveries**: Customer order fulfillment with real-time stock reservation, picking validation, and deduction.
* **Internal Transfers**: Multi-warehouse stock relocation with transit tracking and validation against circular transfers.
* **Inventory Adjustments**: Physical inventory count reconciliation with automatic variance computation.
* **Stock Ledger (Audit Trail)**: Immutable, auditable ledger tracking every single unit movement with transaction timestamps and user attribution.

### 4. 📱 Hardware & Output Utilities
* **Barcode & QR Scanner**: Camera-based scanner and mock test generator for swift scanning of product labels, bin tags, and shipments.
* **Printable Statements & CSV Export**: Official PDF-formatted statements with corporate branding header and one-click tabular CSV exports across all 7 operational modules.

### 5. 🎨 Design & Corporate Identity
* **Flight Bird Emblem**: Soaring avian silhouette symbolizing foresight, precision, and high-altitude operational oversight.
* **Midnight Slate & Platinum Palette**: Executive color scheme (`#1b2839`, `#151f2d`, `#cecfd2`) inspired by modern fintech dashboards, complete with class-based Dark/Light theme switching.

---

## 🏗️ Technology Architecture

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 19, Vite 6, Tailwind CSS 3.4, Recharts, Lucide React, Axios, React Router v6 |
| **Backend** | Node.js (v18+), Express.js, REST APIs, JSON Web Tokens (JWT), bcryptjs, Morgan |
| **Database** | MongoDB, Mongoose 8 (11 Schemas: Products, Categories, Warehouses, Stocks, Receipts, Deliveries, Transfers, Adjustments, Ledger, Users, Anomalies) |
| **Verification** | Native Node.js Test Runner (21 Unit & Integration Test Suites) |

---

## 📁 Repository Structure

```
StockSense/
├── client/                           # React + Vite Frontend
│   ├── public/
│   │   ├── favicon.png               # Flight Bird Brand Favicon
│   │   └── logo.png                  # Master Brand Asset
│   ├── src/
│   │   ├── assets/                   # Static imagery and logos
│   │   ├── components/
│   │   │   ├── common/               # Reusable UI system (Logo, Button, Modal, Table, Badge, etc.)
│   │   │   ├── dashboard/            # Core dashboard widgets, KPIs, filters, activity tables
│   │   │   │   └── Charts/           # 4 Recharts visual telemetry components
│   │   │   ├── intelligence/         # Daily Action Center, Forecast, Radar, Simulator, Find Stock
│   │   │   └── layout/               # Sidebar, Navbar, Mobile Drawer
│   │   ├── context/                  # AuthContext, ThemeContext (Dark/Light mode)
│   │   ├── hooks/                    # useAuth, useTheme
│   │   ├── layouts/                  # MainLayout, AuthLayout
│   │   ├── pages/                    # 17 Feature & Intelligence Pages
│   │   ├── services/                 # Axios API service abstraction layers
│   │   └── utils/                    # Constants, formatters, validation helpers
│   ├── index.html
│   ├── tailwind.config.js            # Midnight Slate & Platinum theme configuration
│   └── vite.config.js
│
├── server/                           # Node.js + Express Backend
│   ├── config/                       # Database connection and environment config
│   ├── controllers/                  # REST API controllers for all modules
│   ├── middleware/                   # JWT Auth, RBAC authorization, Validation, Error Handler
│   ├── models/                       # 11 Mongoose Data Schemas
│   ├── routes/                       # Express route definitions
│   ├── services/                     # Business logic and analytics calculation services
│   ├── utils/                        # Standardized API response formatters & constants
│   ├── app.js                        # Express application setup
│   ├── server.js                     # Server entrypoint
│   └── test/                         # 21 Integration & Unit Tests
│
├── docs/                             # API Documentation & Architecture Specifications
└── package.json                      # Unified root orchestration scripts
```

---

## 🚀 Quick Start Guide

### 1. Prerequisites
* **Node.js** (v18.0.0 or higher)
* **MongoDB** (Local instance or MongoDB Atlas connection string)
* **npm** or **pnpm** / **yarn**

### 2. Environment Configuration
Create a `.env` file in the `/server` directory:
```ini
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://localhost:27017/stocksense
JWT_SECRET=your_jwt_secret_production_key_here
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:3000
```

### 3. Dependency Installation
Install all dependencies across the root, client, and server workspaces:
```bash
npm run install:all
```

### 4. Running the Application
Launch both backend API server and frontend client concurrently:
```bash
npm run dev
```

* **Frontend Client**: [http://localhost:3000](http://localhost:3000)
* **Backend API**: [http://localhost:5000](http://localhost:5000)
* **API Health Check**: [http://localhost:5000/api/health](http://localhost:5000/api/health)

---

## 🧪 Testing & Quality Assurance

Run the automated backend test suite:
```bash
npm run test:server
```

### Verified Test Suites (21/21 Passing):
* ✅ Anomaly Model & Schema Validation
* ✅ Stock Forecast Risk Classification
* ✅ What-If Simulator Coverage Calculation
* ✅ "Where is My Stock" Natural Language Parser
* ✅ Health Endpoint Standard Response
* ✅ Standard 404 Error Payloads
* ✅ Register & Login Validation Middleware
* ✅ JWT Route Authentication & Role Guards
* ✅ 10 Core Database Schemas Instantiation
* ✅ Receipt, Delivery & Transfer Operational Rules
* ✅ Duplicate Prevention (SKU, Warehouse Code, Category Code)
* ✅ Physical Count Adjustment Calculation
* ✅ Immutable Stock Ledger Audit Fields
* ✅ Reorder Logic & Depletion Thresholds

---

## 👥 Role-Based Access Control (RBAC)

StockSense provides two pre-configured security roles:

| Role | Access Permissions |
| :--- | :--- |
| **Inventory Manager** | Full access to all operations, What-If Simulator, reorder approvals, user management, warehouse configuration, and audit logs. |
| **Warehouse Staff** | Operational access to Barcode Scanner, processing inbound receipts, picking outbound deliveries, transfers, and viewing stock balances. |

---

## 🌿 Git Branching Strategy

Development follows clean feature-driven Git workflows:
* `main`: Production-ready release branch.
* `develop`: Integration and staging branch.
* `feature/<feature-name>`: Isolated branches for new features and components.

```bash
git checkout develop
git pull origin develop
git checkout -b feature/your-feature
# make modifications
git add .
git commit -m "feat: description of changes"
git push origin feature/your-feature
```

---

## 📄 License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.

<p align="center">
  <sub>Built with precision for <strong>StockSense</strong> &bull; Intelligent Inventory OS</sub>
</p>
