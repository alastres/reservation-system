
const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

const prisma = new PrismaClient();

async function main() {
    // Update all users for now, or just the one with username 'edison'
    // Since we saw 'edison' (or similar) in the logs/context? 
    // Actually, I'll update ALL users to 'Europe/Madrid' to be safe for this single-tenant-like dev env.

    const update = await prisma.user.updateMany({
        data: {
            timeZone: "Europe/Madrid"
        }
    });

    console.log("Updated users:", update.count);
}

main()
    .catch(e => console.error(e))
    .finally(async () => {
        await prisma.$disconnect();
    });
