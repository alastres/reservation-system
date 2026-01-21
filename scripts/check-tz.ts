
import { prisma } from "../lib/prisma";

async function main() {
    const users = await prisma.user.findMany({
        select: { email: true, username: true, timeZone: true }
    });
    console.log("Users:", users);
}

main();
