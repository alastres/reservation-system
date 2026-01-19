
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log("Verifying all users...");

    // Update all users to have emailVerified set to now
    const result = await prisma.user.updateMany({
        where: {
            emailVerified: null
        },
        data: {
            emailVerified: new Date()
        }
    });

    console.log(`Updated ${result.count} users to be verified.`);
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
