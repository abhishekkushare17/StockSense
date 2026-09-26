const mongoose = require('mongoose');
const env = require('../config/env');
const {
  User,
  Warehouse,
  Category,
  Product,
  Stock,
  StockLedger,
  AuditLog
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
    }

    // 2. Seed Default Warehouses
    console.log('[Seed] Seeding Warehouses...');
    const warehousesData = [
      {
        name: 'Central Distribution Hub',
        code: 'WH-CENTRAL-01',
        location: 'Bay 4, Central Industrial Park',
        city: 'Chicago',
        state: 'IL',
        contactPerson: 'Abhishek Kushare',
        phone: '+1-555-0100',
        email: 'chicago.hub@stocksense.com',
        status: 'active'
      },
      {
        name: 'West Coast Depot',
        code: 'WH-WEST-02',
        location: 'Pier 9 Logistics Center',
        city: 'Reno',
        state: 'NV',
        contactPerson: 'Sarah Jenkins',
        phone: '+1-555-0200',
        email: 'west.depot@stocksense.com',
        status: 'active'
      },
      {
        name: 'South Logistics Facility',
        code: 'WH-SOUTH-03',
        location: 'Sub-Hub 12, Port Access Rd',
        city: 'Dallas',
        state: 'TX',
        contactPerson: 'Marcus Vance',
        phone: '+1-555-0300',
        email: 'south.hub@stocksense.com',
        status: 'active'
      }
    ];

    const warehouses = {};
    for (const wData of warehousesData) {
      let wh = await Warehouse.findOne({ code: wData.code });
      if (!wh) {
        wh = await Warehouse.create(wData);
        console.log(`  -> Created Warehouse: ${wh.name} (${wh.code})`);
      }
      warehouses[wData.code] = wh;
    }

    // 3. Seed Categories
    console.log('[Seed] Seeding Categories...');
    const categoriesData = [
      {
        name: 'Raw Materials',
        code: 'CAT-RAW',
        description: 'Metals, structural rods, and foundational fabrication inputs',
        status: 'active'
      },
      {
        name: 'Commercial Furniture',
        code: 'CAT-FURN',
        description: 'Ergonomic chairs, executive desks, and modular storage',
        status: 'active'
      },
      {
        name: 'Electrical Components',
        code: 'CAT-ELEC',
        description: 'Cables, high-bay luminaires, industrial power conduits',
        status: 'active'
      },
      {
        name: 'Industrial Supplies',
        code: 'CAT-IND',
        description: 'Pallet handling, heavy racking, and safety hardware',
        status: 'active'
      }
    ];

    const categories = {};
    for (const cData of categoriesData) {
      let cat = await Category.findOne({ code: cData.code });
      if (!cat) {
        cat = await Category.create(cData);
        console.log(`  -> Created Category: ${cat.name} (${cat.code})`);
      }
      categories[cData.code] = cat;
    }

    // 4. Seed Products with realistic stock distribution and ledger activity
    console.log('[Seed] Seeding Products & Stock Allocations...');
    const productsData = [
      {
        sku: 'ROD-STL-001',
        name: 'Steel Rod 10mm (High Tensile)',
        categoryCode: 'CAT-RAW',
        unitOfMeasure: 'pcs',
        reorderLevel: 20,
        reorderPoint: 20,
        minStockLevel: 5,
        maxStockLevel: 100,
        costPrice: 12.5,
        sellingPrice: 18.0,
        description: 'Standard 10mm high-tensile structural steel rod',
        allocations: [
          { whCode: 'WH-CENTRAL-01', qty: 15, bin: 'Rack A1 - Bay 02' }
        ]
      },
      {
        sku: 'CHR-ERG-101',
        name: 'Ergonomic Mesh Task Chair',
        categoryCode: 'CAT-FURN',
        unitOfMeasure: 'pcs',
        reorderLevel: 25,
        reorderPoint: 25,
        minStockLevel: 10,
        maxStockLevel: 150,
        costPrice: 85.0,
        sellingPrice: 149.0,
        description: 'Breathable lumbar mesh chair with 4D adjustable armrests',
        allocations: [
          { whCode: 'WH-CENTRAL-01', qty: 45, bin: 'Rack B1 - Bay 01' },
          { whCode: 'WH-WEST-02', qty: 15, bin: 'Rack A2 - Bay 03' }
        ]
      },
      {
        sku: 'DSK-WOD-202',
        name: 'Executive Solid Oak Desk',
        categoryCode: 'CAT-FURN',
        unitOfMeasure: 'pcs',
        reorderLevel: 10,
        reorderPoint: 10,
        minStockLevel: 3,
        maxStockLevel: 40,
        costPrice: 320.0,
        sellingPrice: 590.0,
        description: 'Handcrafted solid oak executive workstation with cable grommets',
        allocations: [
          { whCode: 'WH-CENTRAL-01', qty: 4, bin: 'Rack C1 - Bay 01' }
        ]
      },
      {
        sku: 'WIR-CPR-500',
        name: 'Industrial Copper Wire 50m Spool',
        categoryCode: 'CAT-ELEC',
        unitOfMeasure: 'spools',
        reorderLevel: 15,
        reorderPoint: 15,
        minStockLevel: 5,
        maxStockLevel: 80,
        costPrice: 42.0,
        sellingPrice: 75.0,
        description: 'Pure copper 12-gauge shielded electrical wiring coil',
        allocations: [
          { whCode: 'WH-CENTRAL-01', qty: 0, bin: 'Rack A3 - Bay 04' }
        ]
      },
      {
        sku: 'LMP-LED-150',
        name: 'High-Bay Industrial LED Luminaire 150W',
        categoryCode: 'CAT-ELEC',
        unitOfMeasure: 'pcs',
        reorderLevel: 30,
        reorderPoint: 30,
        minStockLevel: 10,
        maxStockLevel: 200,
        costPrice: 55.0,
        sellingPrice: 98.0,
        description: 'IP65 waterproof warehouse bay lighting fixture 21,000 lumens',
        allocations: [
          { whCode: 'WH-CENTRAL-01', qty: 55, bin: 'Rack B2 - Bay 02' },
          { whCode: 'WH-SOUTH-03', qty: 30, bin: 'Rack A1 - Bay 01' }
        ]
      },
      {
        sku: 'EQP-PLT-250',
        name: 'Hydraulic Hand Pallet Jack 2.5T',
        categoryCode: 'CAT-IND',
        unitOfMeasure: 'units',
        reorderLevel: 5,
        reorderPoint: 5,
        minStockLevel: 2,
        maxStockLevel: 20,
        costPrice: 240.0,
        sellingPrice: 395.0,
        description: 'Heavy duty nylon tandem rollers with overload bypass valve',
        allocations: [
          { whCode: 'WH-CENTRAL-01', qty: 2, bin: 'Bay Floor - Gate 03' }
        ]
      },
      {
        sku: 'SHV-IND-001',
        name: 'Heavy-Duty Teardrop Pallet Racking Set',
        categoryCode: 'CAT-IND',
        unitOfMeasure: 'sets',
        reorderLevel: 12,
        reorderPoint: 12,
        minStockLevel: 4,
        maxStockLevel: 60,
        costPrice: 180.0,
        sellingPrice: 290.0,
        description: 'Industrial modular beam and upright frame storage module',
        allocations: [
          { whCode: 'WH-CENTRAL-01', qty: 18, bin: 'Rack C3 - Bay 01' },
          { whCode: 'WH-WEST-02', qty: 10, bin: 'Rack B3 - Bay 02' }
        ]
      }
    ];

    const now = new Date();
    const daysAgo = (days) => new Date(now.getTime() - days * 24 * 60 * 60 * 1000);

    for (const p of productsData) {
      let product = await Product.findOne({ sku: p.sku });
      const cat = categories[p.categoryCode];

      if (!product) {
        product = await Product.create({
          name: p.name,
          sku: p.sku,
          category: cat ? cat._id : null,
          unitOfMeasure: p.unitOfMeasure,
          reorderLevel: p.reorderLevel,
          reorderPoint: p.reorderPoint,
          minStockLevel: p.minStockLevel,
          maxStockLevel: p.maxStockLevel,
          costPrice: p.costPrice,
          sellingPrice: p.sellingPrice,
          description: p.description,
          status: 'active'
        });
        console.log(`  -> Created Product: ${product.name} (${product.sku})`);
      }

      // Check allocations
      for (const alloc of p.allocations) {
        const wh = warehouses[alloc.whCode];
        if (!wh) continue;

        let stock = await Stock.findOne({ product: product._id, warehouse: wh._id });
        if (!stock) {
          stock = await Stock.create({
            product: product._id,
            warehouse: wh._id,
            quantity: alloc.qty,
            reservedQuantity: 0,
            locationBin: alloc.bin
          });

          // Create ledger entry
          await StockLedger.create({
            product: product._id,
            warehouse: wh._id,
            operationType: 'RECEIPT',
            transactionType: 'RECEIPT',
            referenceId: `INIT-${product.sku}`,
            referenceNumber: `INIT-${product.sku}`,
            quantityBefore: 0,
            quantityChange: alloc.qty,
            quantityChanged: alloc.qty,
            quantityAfter: alloc.qty,
            balanceAfter: alloc.qty,
            createdBy: manager._id,
            user: manager._id,
            notes: 'Initial warehouse inventory baseline allocation',
            createdAt: daysAgo(10)
          });

          // Add realistic outflow movements over the past 7 days to simulate daily velocity
          if (alloc.qty > 0) {
            const usageQty = Math.max(1, Math.round(alloc.qty * 0.2));
            await StockLedger.create({
              product: product._id,
              warehouse: wh._id,
              operationType: 'DELIVERY',
              transactionType: 'DELIVERY',
              referenceId: `DEL-${product.sku}-01`,
              referenceNumber: `DEL-${product.sku}-01`,
              quantityBefore: alloc.qty + usageQty,
              quantityChange: -usageQty,
              quantityChanged: -usageQty,
              quantityAfter: alloc.qty,
              balanceAfter: alloc.qty,
              createdBy: staff ? staff._id : manager._id,
              user: staff ? staff._id : manager._id,
              notes: 'Scheduled outbound dispatch to regional commercial partner',
              createdAt: daysAgo(3)
            });
          }
        }
      }
    }

    // 5. Seed Initial Audit Log Events for rich audit trail demo
    console.log('[Seed] Seeding Sample Audit Logs...');
    const existingAuditCount = await AuditLog.countDocuments();
    if (existingAuditCount === 0) {
      const sampleAudits = [
        {
          user: manager._id,
          action: 'LOGIN',
          module: 'AUTH',
          entityType: 'User',
          recordId: manager.email,
          details: { email: manager.email, role: manager.role },
          ipAddress: '127.0.0.1',
          createdAt: daysAgo(2)
        },
        {
          user: manager._id,
          action: 'CREATE_PRODUCT',
          module: 'PRODUCTS',
          entityType: 'Product',
          recordId: 'ROD-STL-001',
          newValue: { name: 'Steel Rod 10mm (High Tensile)', sku: 'ROD-STL-001', reorderLevel: 20 },
          details: { name: 'Steel Rod 10mm (High Tensile)', sku: 'ROD-STL-001' },
          ipAddress: '127.0.0.1',
          createdAt: daysAgo(2)
        },
        {
          user: manager._id,
          action: 'VALIDATE_RECEIPT',
          module: 'RECEIPTS',
          entityType: 'Receipt',
          recordId: 'REC-2026-001',
          details: { receiptNumber: 'REC-2026-001', supplier: 'Industrial Fasteners Co.', itemsCount: 3 },
          ipAddress: '127.0.0.1',
          createdAt: daysAgo(1)
        },
        {
          user: staff ? staff._id : manager._id,
          action: 'VALIDATE_DELIVERY',
          module: 'DELIVERIES',
          entityType: 'Delivery',
          recordId: 'DEL-2026-008',
          details: { deliveryNumber: 'DEL-2026-008', customer: 'Vertex Construction Ltd.' },
          ipAddress: '127.0.0.1',
          createdAt: daysAgo(1)
        },
        {
          user: manager._id,
          action: 'CREATE_TRANSFER',
          module: 'TRANSFERS',
          entityType: 'InternalTransfer',
          recordId: 'TRF-2026-003',
          details: { transferNumber: 'TRF-2026-003', from: 'WH-CENTRAL-01', to: 'WH-WEST-02', quantity: 15 },
          ipAddress: '127.0.0.1',
          createdAt: new Date(now.getTime() - 2 * 60 * 60 * 1000)
        }
      ];

      await AuditLog.insertMany(sampleAudits);
      console.log('  -> Seeded 5 initial audit log records for live demo');
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
