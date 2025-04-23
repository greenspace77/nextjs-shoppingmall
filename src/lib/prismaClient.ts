import { PrismaClient } from "../../prisma/prisma/generated/client";

declare global {
  var prisma: PrismaClient | undefined;
}

const prismaClient = global.prisma || new PrismaClient();

if (process.env.NODE_ENV === "development") global.prisma = prismaClient;

export default prismaClient;
