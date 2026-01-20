const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const bcrypt = require('bcryptjs');

async function main() {
    const email = "admin@example.com";
    const password = "password123";
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
        data: {
            name: "Admin User",
            email,
            password: hashedPassword,
            role: "ADMIN",
            emailVerified: new Date(),
            username: "admin"
        }
    });

    console.log(`Created Admin User: ${user.email} with password: ${password}`);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
