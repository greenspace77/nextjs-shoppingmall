import { PrismaClient } from '@prisma/client';

declare global {
  var Prismaclient: PrismaClient | undefined
}

const prismaClient = global.Prismaclient || new PrismaClient();

if (process.env.NODE_ENV === "development")
  global.Prismaclient = prismaClient;

export default prismaClient