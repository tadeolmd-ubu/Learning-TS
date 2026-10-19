import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client.ts";

const connectionString = process.env.DIRECT_URL;

if (!connectionString) {
  throw new Error("DIRECT_URL no está definida");
}

const adapter = new PrismaPg({ connectionString });

export const prisma = new PrismaClient({ adapter });