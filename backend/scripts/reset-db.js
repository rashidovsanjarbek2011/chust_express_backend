const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function resetDatabase() {
    console.log('🚀 Starting database reset...');

    try {
        // 1. Delete transaction history (OrderItems -> Orders -> Deliveries)
        console.log('🗑️ Deleting Order Items...');
        await prisma.orderItem.deleteMany();

        console.log('🗑️ Deleting Deliveries...');
        await prisma.delivery.deleteMany();

        console.log('🗑️ Deleting Orders...');
        await prisma.order.deleteMany();

        // 2. Delete static data (Products, Cars, Codes)
        console.log('🗑️ Deleting Products...');
        await prisma.product.deleteMany();

        console.log('🗑️ Deleting Delivery Cars...');
        await prisma.deliveryCar.deleteMany();

        console.log('🗑️ Deleting Delivery Codes...');
        await prisma.deliveryCode.deleteMany();

        console.log('🗑️ Deleting Manager Codes...');
        await prisma.managerCode.deleteMany();

        // 3. Delete Users (KEEP ADMINISTRATORS)
        console.log('🗑️ Deleting non-admin users...');
        const deleteUsers = await prisma.user.deleteMany({
            where: {
                NOT: {
                    role: 'administrator'
                }
            }
        });
        console.log(`✅ Deleted ${deleteUsers.count} users.`);

        console.log('✨ Database reset successful!');
    } catch (error) {
        console.error('❌ Error during reset:', error);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

resetDatabase();
