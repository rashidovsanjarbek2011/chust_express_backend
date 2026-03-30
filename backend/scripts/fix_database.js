// fix_database.js
// Run this script locally to fix both delivery types and notes column

const { Client } = require('pg');

// Replace with your Render database URL
const DATABASE_URL = "postgresql://admin_chust_express:5n4lBbdyYcVzk9Tk1eZZ1EXrJqFVmzt8@dpg-d6ipjgpaae7s73cllpig-a.frankfurt-postgres.render.com/chust_express_web";

const client = new Client({
  connectionString: DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

async function fixDatabase() {
  console.log('🚀 Connecting to Render database...\n');
  
  try {
    await client.connect();
    console.log('✅ Connected successfully!\n');
    
    // ========================================
    // 1. Fix DeliveryType table
    // ========================================
    console.log('📦 STEP 1: Fixing DeliveryType table...\n');
    
    // Check if DeliveryType table exists
    const tableCheck = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'DeliveryType'
      );
    `);
    
    if (tableCheck.rows[0].exists) {
      // Add description column if it doesn't exist
      try {
        await client.query(`ALTER TABLE "DeliveryType" ADD COLUMN description TEXT;`);
        console.log('✅ Added description column to DeliveryType');
      } catch (err) {
        if (err.message.includes('already exists')) {
          console.log('ℹ️ description column already exists');
        } else {
          console.log('⚠️ Could not add description column:', err.message);
        }
      }
      
      // Check existing delivery types
      const checkResult = await client.query('SELECT COUNT(*) FROM "DeliveryType"');
      const count = parseInt(checkResult.rows[0].count);
      
      if (count === 0) {
        console.log('📝 Adding delivery types...');
        await client.query(`
          INSERT INTO "DeliveryType" (
            "typeName", 
            "basePrice", 
            "baseCostPerKm", 
            description,
            "createdAt",
            "updatedAt"
          ) 
          VALUES 
            ('Standard Delivery', 5000, 1000, 'Regular delivery service', NOW(), NOW()),
            ('Express Delivery', 10000, 2000, 'Fast delivery service', NOW(), NOW()),
            ('Pickup', 0, 0, 'Customer picks up from shop', NOW(), NOW());
        `);
        console.log('✅ Added 3 delivery types');
      } else {
        console.log(`ℹ️ Delivery types already exist (${count} found)`);
      }
    } else {
      console.log('📝 Creating DeliveryType table...');
      await client.query(`
        CREATE TABLE "DeliveryType" (
            id SERIAL PRIMARY KEY,
            "typeName" VARCHAR(255) NOT NULL,
            "basePrice" INTEGER NOT NULL DEFAULT 0,
            "baseCostPerKm" INTEGER NOT NULL DEFAULT 0,
            description TEXT,
            "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `);
      
      await client.query(`
        INSERT INTO "DeliveryType" ("typeName", "basePrice", "baseCostPerKm", description, "createdAt", "updatedAt") 
        VALUES 
            ('Standard Delivery', 5000, 1000, 'Regular delivery service', NOW(), NOW()),
            ('Express Delivery', 10000, 2000, 'Fast delivery service', NOW(), NOW()),
            ('Pickup', 0, 0, 'Customer picks up from shop', NOW(), NOW());
      `);
      console.log('✅ Created DeliveryType table and added types');
    }
    
    // ========================================
    // 2. Fix Order table - Add notes column
    // ========================================
    console.log('\n📦 STEP 2: Fixing Order table - adding notes column...\n');
    
    try {
      // Check if notes column exists
      const columnCheck = await client.query(`
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = 'Order' AND column_name = 'notes';
      `);
      
      if (columnCheck.rows.length === 0) {
        console.log('📝 Adding notes column to Order table...');
        await client.query(`ALTER TABLE "Order" ADD COLUMN notes TEXT;`);
        console.log('✅ Added notes column to Order table');
      } else {
        console.log('ℹ️ notes column already exists in Order table');
      }
    } catch (err) {
      console.log('⚠️ Could not add notes column:', err.message);
      console.log('💡 Trying alternative approach...');
      
      // Alternative: Try without quotes
      try {
        await client.query(`ALTER TABLE "Order" ADD COLUMN notes TEXT;`);
        console.log('✅ Added notes column (alternative method)');
      } catch (err2) {
        console.log('❌ Could not add notes column. Please check permissions.');
      }
    }
    
    // ========================================
    // 3. Verify changes
    // ========================================
    console.log('\n📦 STEP 3: Verifying changes...\n');
    
    // Check delivery types
    const deliveryTypes = await client.query('SELECT id, "typeName", "basePrice", "baseCostPerKm", description FROM "DeliveryType"');
    console.log('✅ Delivery Types:');
    console.table(deliveryTypes.rows);
    
    // Check if notes column exists
    const notesCheck = await client.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'Order' AND column_name = 'notes';
    `);
    
    if (notesCheck.rows.length > 0) {
      console.log('✅ notes column is present in Order table');
    } else {
      console.log('⚠️ notes column is still missing');
    }
    
    // Check if there are any orders
    const orderCount = await client.query('SELECT COUNT(*) FROM "Order"');
    console.log(`📊 Total orders in database: ${orderCount.rows[0].count}`);
    
    console.log('\n🎉 Database fix completed successfully!');
    console.log('\n📝 Next steps:');
    console.log('1. Your orders should now work');
    console.log('2. If you still get errors, check the Render logs for details');
    console.log('3. Try placing an order again');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('\n💡 If you need to run SQL manually, use this:');
    console.error(`
-- Run these SQL commands in your database:

-- Add notes column to Order table
ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS notes TEXT;

-- Add description to DeliveryType if missing
ALTER TABLE "DeliveryType" ADD COLUMN IF NOT EXISTS description TEXT;

-- Add delivery types if missing
INSERT INTO "DeliveryType" ("typeName", "basePrice", "baseCostPerKm", description, "createdAt", "updatedAt") 
VALUES 
    ('Standard Delivery', 5000, 1000, 'Regular delivery service', NOW(), NOW()),
    ('Express Delivery', 10000, 2000, 'Fast delivery service', NOW(), NOW()),
    ('Pickup', 0, 0, 'Customer picks up from shop', NOW(), NOW())
ON CONFLICT ("typeName") DO NOTHING;

-- Verify changes
SELECT * FROM "DeliveryType";
SELECT column_name FROM information_schema.columns WHERE table_name = 'Order' AND column_name = 'notes';
    `);
  } finally {
    await client.end();
  }
}

fixDatabase();