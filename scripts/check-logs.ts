import "dotenv/config";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
    const logs = await prisma.notificationLog.findMany({
        orderBy: { createdAt: 'desc' },
        take: 5,
        select: { type: true, createdAt: true, status: true, metadata: true }
    });
    console.log(logs.map(l => `${l.type} | ${l.status} | ${(l.metadata as any)?.clientEmail} | ${l.createdAt.toISOString()}`).join('\n'));
}

main().finally(() => prisma.$disconnect());
