<<<<<<< HEAD
// @ts-nocheck
import { prisma } from "./lib/prisma";
=======

import { prisma } from "../lib/prisma";
>>>>>>> master

async function main() {
    const users = await prisma.user.findMany({
        select: {
            email: true,
            timeZone: true
        }
    });

    console.log("User Timezones:");
    users.forEach(u => console.log(`${u.email}: ${u.timeZone}`));
}

main();
