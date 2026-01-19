
const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

const prisma = new PrismaClient();

async function main() {
    const users = await prisma.user.findMany({
        select: { email: true, username: true, timeZone: true }
    });
    console.log("Users in DB:");
    users.forEach(u => console.log(`${u.username}: ${u.timeZone}`));
}

main()
    .catch(e => console.error(e))
    .finally(async () => {
        await prisma.$disconnect();
    });
