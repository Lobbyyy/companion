import { PrismaClient } from "@prisma/client";

//prisma doesnt exist in our global scope, so we need to define it
declare global {
    var prisma: PrismaClient | undefined;
}

//special function to prevent hot reloading from creating multiple instances of PrismaClient
const prisma = globalThis.prisma || new PrismaClient();
if (process.env.NODE_ENV !== "production") globalThis.prisma = prisma;

export default prisma;