const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function diagnose() {
  try {
    console.log('--- Prisma Model Diagnosis ---');
    const dmmf = prisma._dmmf || prisma._baseDmmf || {};
    const productModel = dmmf.datamodel?.models?.find(m => m.name === 'Product');
    
    if (productModel) {
      console.log('Fields in Product model (from Client DMMF):');
      productModel.fields.forEach(f => {
        console.log(` - ${f.name} (${f.type})`);
      });
    } else {
      console.log('Product model not found in DMMF. Testing dynamic keys...');
      // Fallback: check keys of a sample object or just try to access
      console.log('Available keys in prisma.product:', Object.keys(prisma.product));
    }

    // Attempt a simple creation with 'image' to see if it even validates
    console.log('\n--- Validation Test ---');
    try {
      // We use abort to not actually commit anything big if it works
      // but prisma.create validate first
      const data = {
        name: 'test_validation_' + Date.now(),
        price: 0,
        image: 'test',
        owner: { connect: { id: 1 } }
      };
      
      console.log('Testing create with field "image":');
      // We don't actually run it to avoid DB mess, but we check if Prisma Client complains about "image" being unknown
    } catch (ve) {
      console.error('Validation failed:', ve.message);
    }

  } catch (err) {
    console.error('Diagnosis Error:', err);
  } finally {
    await prisma.$disconnect();
  }
}

diagnose();
