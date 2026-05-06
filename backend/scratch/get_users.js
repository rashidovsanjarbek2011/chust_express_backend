const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany({ take: 5, select: { email: true, role: true, extraCode: true, extraExpiresAt: true } });
  console.log(users);
  
  const extraCodes = await prisma.extraCode.findMany();
  console.log("ExtraCodes:", extraCodes);
}
main()
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
