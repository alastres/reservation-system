import { PrismaClient } from '@prisma/client'
import bcrypt from "bcryptjs";

const prisma = new PrismaClient()


async function main() {
    console.log('Start seeding ...')

    // Password must match the one in login-form (demo1234)
    const demoPasswordHash = await bcrypt.hash("demo1234", 10);

    // Check for username collision to prevent P2002 (if demo_user exists for another email)
    const existingUsername = await prisma.user.findUnique({ where: { username: 'demo_user' } });
    if (existingUsername && existingUsername.email !== 'demo@scheduler.com') {
        console.log("Found collision on username 'demo_user', deleting old user...");
        await prisma.user.delete({ where: { id: existingUsername.id } });
    }

    // 1. Create/Update Demo User
    const demoUser = await prisma.user.upsert({
        where: { email: 'demo@scheduler.com' },
        update: {
            password: demoPasswordHash, // Ensure password is updated if user exists
            bio: "Psicólogo Clínico con más de 10 años de experiencia ayudando a personas a superar la ansiedad y encontrar el equilibrio emocional. Especialista en Terapia Cognitivo-Conductual y Mindfulness."
        },
        create: {
            email: 'demo@scheduler.com',
            name: 'Demo User',
            password: demoPasswordHash,
            role: 'OWNER',
            emailVerified: new Date(),
            username: 'demo_user',
            image: "https://cdn.pixabay.com/photo/2021/07/19/04/36/woman-6477171_1280.jpg",
            coverImage: "https://images.unsplash.com/photo-1544027993-37dbfe43562a?q=80&w=870&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
            phone: "+34614123456",
            address: "Calle de la Paz, 123",
            subscriptionPlan: 'PRO',
            subscriptionStatus: 'ACTIVE',
            orgRole: 'OWNER',
            timeZone: 'Europe/Madrid',
            bio: "Psicólogo Clínico con más de 10 años de experiencia ayudando a personas a superar la ansiedad y encontrar el equilibrio emocional. Especialista en Terapia Cognitivo-Conductual y Mindfulness."
        },
    });

    console.log("Demo user created/updated.");

    // 2. Set Availability (Mon-Fri, 09:00 - 18:00)
    // First clear existing rules to avoid duplicates on re-seed
    await prisma.availabilityRule.deleteMany({ where: { userId: demoUser.id } });

    const workDays = [1, 2, 3, 4, 5]; // Mon=1 to Fri=5
    for (const day of workDays) {
        await prisma.availabilityRule.create({
            data: {
                userId: demoUser.id,
                dayOfWeek: day,
                startTime: "09:00",
                endTime: "18:00"
            }
        });
    }
    console.log("Availability set (Mon-Fri).");

    // 3. Create Services
    // Clear existing services to ensure clean slate or avoid duplicates if logic changes
    // (Optional: normally upsert is better but for seed simplicity deleting old demo services is fine)
    await prisma.service.deleteMany({ where: { userId: demoUser.id } });

    await prisma.service.create({
        data: {
            userId: demoUser.id,
            title: "Terapia Individual",
            description: "Sesión 1 a 1 para abordar ansiedad, depresión o crecimiento personal.",
            duration: 60,
            price: 75,
            isActive: true,
            requiresPayment: false, // Demo purposes
            url: "terapia-individual",
            locationType: "GOOGLE_MEET"
        }
    });

    await prisma.service.create({
        data: {
            userId: demoUser.id,
            title: "Terapia de Pareja",
            description: "Sesión conjunta para mejorar la comunicación y resolver conflictos en la relación.",
            duration: 90,
            price: 120,
            isActive: true,
            requiresPayment: false,
            url: "terapia-pareja",
            locationType: "IN_PERSON",
            address: "Clínica Central, Av. Principal 123"
        }
    });
    console.log("Services created.");

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
