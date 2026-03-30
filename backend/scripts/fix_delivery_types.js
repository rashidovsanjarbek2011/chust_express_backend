// fix_delivery_types.js
const { Client } = require('pg');

// Replace with your Render database URL
const DATABASE_URL = "postgresql://admin_chust_express:5n4lBbdyYcVzk9Tk1eZZ1EXrJqFVmzt8@dpg-d6ipjgpaae7s73cllpig-a.frankfurt-postgres.render.com/chust_express_web";

const client = new Client({
  connectionString: DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

async function fixDeliveryTypes() {
  console.log('🚀 Connecting to Render database...');
  
  try {
    await client.connect();
    console.log('✅ Connected successfully!\n');
    
    // Check if DeliveryType table exists
    const tableCheck = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'DeliveryType'
      );
    `);
    
    const tableExists = tableCheck.rows[0].exists;
    
    if (tableExists) {
      console.log('📊 DeliveryType table exists. Checking structure...\n');
      
      // Get table columns
      const columns = await client.query(`
        SELECT column_name, data_type, is_nullable
        FROM information_schema.columns 
        WHERE table_name = 'DeliveryType'
        ORDER BY ordinal_position;
      `);
      
      console.log('Current columns in DeliveryType:');
      console.table(columns.rows);
      
      // Check if description column exists
      const hasDescription = columns.rows.some(col => col.column_name === 'description');
      
      // Add missing columns
      if (!hasDescription) {
        console.log('\n📝 Adding description column...');
        await client.query(`ALTER TABLE "DeliveryType" ADD COLUMN description TEXT;`);
        console.log('✅ description column added');
      }
      
      // Check if basePrice column exists with correct type
      const basePriceColumn = columns.rows.find(col => col.column_name === 'basePrice');
      if (basePriceColumn && basePriceColumn.data_type === 'double precision') {
        // It exists, we're good
        console.log('✅ basePrice column exists');
      }
      
    } else {
      console.log('📝 DeliveryType table does not exist. Creating it...\n');
      await client.query(`
        CREATE TABLE "DeliveryType" (
            id SERIAL PRIMARY KEY,
            "typeName" VARCHAR(255) NOT NULL,
            "basePrice" INTEGER NOT NULL DEFAULT 0,
            "baseCostPerKm" INTEGER NOT NULL DEFAULT 0,
            description TEXT,
            "minWeightKg" DOUBLE PRECISION,
            "maxWeightKg" DOUBLE PRECISION,
            "maxDistanceKm" DOUBLE PRECISION,
            "vehicleRequired" BOOLEAN DEFAULT false,
            "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `);
      console.log('✅ DeliveryType table created successfully!\n');
    }
    
    // Check existing records
    const checkResult = await client.query('SELECT COUNT(*) FROM "DeliveryType"');
    const count = parseInt(checkResult.rows[0].count);
    console.log(`\n📊 Found ${count} existing delivery types\n`);
    
    if (count === 0) {
      console.log('📝 Adding delivery types...');
      
      // Insert with explicit createdAt and updatedAt to avoid NOT NULL constraint
      await client.query(`
        INSERT INTO "DeliveryType" (
          "typeName", 
          "basePrice", 
          "baseCostPerKm", 
          description,
          "minWeightKg",
          "maxWeightKg",
          "maxDistanceKm",
          "vehicleRequired",
          "createdAt",
          "updatedAt"
        ) 
        VALUES 
          (
            'Standard Delivery', 
            5000, 
            1000, 
            'Regular delivery service',
            0,
            30,
            50,
            false,
            NOW(),
            NOW()
          ),
          (
            'Express Delivery', 
            10000, 
            2000, 
            'Fast delivery service',
            0,
            30,
            50,
            false,
            NOW(),
            NOW()
          ),
          (
            'Pickup', 
            0, 
            0, 
            'Customer picks up from shop',
            0,
            30,
            50,
            false,
            NOW(),
            NOW()
          );
      `);
      
      console.log('✅ 3 delivery types added successfully!\n');
    } else {
      console.log('✅ Delivery types already exist, updating if needed...\n');
      
      // Update existing types
      await client.query(`
        INSERT INTO "DeliveryType" (
          "typeName", 
          "basePrice", 
          "baseCostPerKm", 
          description,
          "updatedAt"
        ) 
        VALUES 
          ('Standard Delivery', 5000, 1000, 'Regular delivery service', NOW()),
          ('Express Delivery', 10000, 2000, 'Fast delivery service', NOW()),
          ('Pickup', 0, 0, 'Customer picks up from shop', NOW())
        ON CONFLICT ("typeName") DO UPDATE SET
          "basePrice" = EXCLUDED."basePrice",
          "baseCostPerKm" = EXCLUDED."baseCostPerKm",
          description = EXCLUDED.description,
          "updatedAt" = EXCLUDED."updatedAt";
      `);
      
      console.log('✅ Delivery types updated successfully!\n');
    }
    
    // Show all delivery types
    const result = await client.query('SELECT id, "typeName", "basePrice", "baseCostPerKm", description FROM "DeliveryType" ORDER BY id');
    console.log('🎉 Final delivery types in database:');
    console.table(result.rows);
    
    console.log('\n✅ Success! Your orders should now work correctly.');
    console.log('Try placing an order now!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.message.includes('not-null constraint')) {
      console.error('\n💡 Tip: The updatedAt column requires a value. The script now includes it.');
    }
  } finally {
    await client.end();
  }
}

fixDeliveryTypes();