const mongoose = require('mongoose');
const env = require('../config/env');
const {
  User,
  Warehouse,
  Category,
  Product,
  Stock,
  StockLedger
} = require('../models');

const seedData = async (exitOnComplete = true) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      console.log('[Seed] Connecting to MongoDB at', env.mongoUri);
      await mongoose.connect(env.mongoUri);
      console.log('[Seed] MongoDB Connected successfully');
    }

    // 1. Seed Default Users
    console.log('[Seed] Seeding Default Users...');
    
    // Inventory Manager
    let manager = await User.findOne({ email: 'manager@stocksense.com' });
    if (!manager) {
      manager = await User.create({
        name: 'Abhishek Manager',
        email: 'manager@stocksense.com',
        password: 'Password123!',
        role: 'Inventory Manager',
        status: 'active'
      });
      console.log('  -> Created Inventory Manager: manager@stocksense.com / Password123!');
    } else {
      console.log('  -> Inventory Manager already exists: manager@stocksense.com');
    }

    // Warehouse Staff
    let staff = await User.findOne({ email: 'staff@stocksense.com' });
    if (!staff) {
      staff = await User.create({
        name: 'John Staff',
        email: 'staff@stocksense.com',
        password: 'Password123!',
        role: 'Warehouse Staff',
        status: 'active'
      });
      console.log('  -> Created Warehouse Staff: staff@stocksense.com / Password123!');
    } else {
      console.log('  -> Warehouse Staff already exists: staff@stocksense.com');
    }

    // 2. Seed Default Warehouse
    console.log('[Seed] Seeding Default Warehouse...');
    let warehouse = await Warehouse.findOne({ code: 'WH-CENTRAL-01' });
    if (!warehouse) {
      warehouse = await Warehouse.create({
        name: 'Central Distribution Hub',
        code: 'WH-CENTRAL-01',
        location: 'North Zone, Sector 4',
        city: 'Chicago',
        state: 'IL',
        contactPerson: 'Abhishek',
        phone: '+1-555-0100',
        email: 'hub@stocksense.com',
        status: 'active'
      });
      console.log('  -> Created Warehouse: Central Distribution Hub (WH-CENTRAL-01)');
    }

    // 3. Seed Default Category
    console.log('[Seed] Seeding Default Category...');
    let category = await Category.findOne({ code: 'CAT-RAW' });
    if (!category) {
      category = await Category.create({
        name: 'Raw Materials',
        code: 'CAT-RAW',
        description: 'Metals, structural rods, and foundational inputs',
        status: 'active'
      });
      console.log('  -> Created Category: Raw Materials (CAT-RAW)');
    }

    // 4. Seed Default Product with Stock & Reorder Rule
    console.log('[Seed] Seeding Default Sample Product...');
    let product = await Product.findOne({ sku: 'ROD-STL-001' });
    if (!product) {
      product = await Product.create({
        name: 'Steel Rod 10mm',
        sku: 'ROD-STL-001',
        category: category._id,
        unitOfMeasure: 'pcs',
        reorderLevel: 20,
        reorderPoint: 20,
        minStockLevel: 5,
        maxStockLevel: 100,
        costPrice: 12.5,
        sellingPrice: 18.0,
        description: 'Standard 10mm high-tensile steel rod',
        status: 'active'
      });

      // Seed Stock with 15 units (Low stock: 15 <= 20)
      await Stock.create({
        product: product._id,
        warehouse: warehouse._id,
        quantity: 15,
        reservedQuantity: 0,
        locationBin: 'Aisle 3, Shelf B'
      });

      await StockLedger.create({
        product: product._id,
        warehouse: warehouse._id,
        operationType: 'RECEIPT',
        transactionType: 'RECEIPT',
        referenceId: 'INIT-ROD-STL-001',
        referenceNumber: 'INIT-ROD-STL-001',
        quantityBefore: 0,
        quantityChange: 15,
        quantityChanged: 15,
        quantityAfter: 15,
        balanceAfter: 15,
        createdBy: manager._id,
        user: manager._id,
        notes: 'Initial seed inventory'
      });

      console.log('  -> Created Product: Steel Rod 10mm (ROD-STL-001) with Stock: 15 (Low Stock alert active)');
    }

    console.log('==================================================');
    console.log('  StockSense Seed Completed Successfully!         ');
    console.log('==================================================');
    console.log('  LOGIN CREDENTIALS:                              ');
    console.log('  1. Inventory Manager:                           ');
    console.log('     Email:    manager@stocksense.com             ');
    console.log('     Password: Password123!                       ');
    console.log('                                                  ');
    console.log('  2. Warehouse Staff:                             ');
    console.log('     Email:    staff@stocksense.com               ');
    console.log('     Password: Password123!                       ');
    console.log('==================================================');

    if (exitOnComplete) {
      process.exit(0);
    }
  } catch (error) {
    console.error('[Seed Error]:', error.message);
    if (exitOnComplete) {
      process.exit(1);
    } else {
      throw error;
    }
  }
};

if (require.main === module) {
  seedData(true);
}

module.exports = seedData;
