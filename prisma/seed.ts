import { PrismaClient } from '@prisma/client'
import bcrypt from "bcryptjs";

const prisma = new PrismaClient()


async function main() {
    console.log('Start seeding ...')

    const hashedPassword = await bcrypt.hash("123456", 10);

    // Check for username collision to prevent P2002
    const existingUsername = await prisma.user.findUnique({ where: { username: 'demo_user' } });
    if (existingUsername && existingUsername.email !== 'demo@example.com') {
        console.log("Found collision on username 'demo_user', deleting old user...");
        await prisma.user.delete({ where: { id: existingUsername.id } });
    }

    // 1. Create/Update Demo User
    const demoUser = await prisma.user.upsert({
        where: { email: 'demo@example.com' },
        update: {},
        create: {
            email: 'demo@example.com',
            name: 'Demo User',
            password: hashedPassword,
            role: 'OWNER',
            emailVerified: new Date(),
            username: 'demo_user',
            subscriptionPlan: 'PRO',
            timeZone: 'UTC'
        },
    })

    console.log({ demoUser })
    console.log('Seeding finished.')
}

main()
    .then(async () => {
        await prisma.$disconnect()
    })
    .catch(async (e) => {
        console.error(e)
        await prisma.$disconnect()
        process.exit(1)
    })
