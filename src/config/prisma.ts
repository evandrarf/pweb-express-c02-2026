import "dotenv/config";
import { PrismaNeon } from "@prisma/adapter-neon";
import { PrismaClient } from "../generated/prisma/client";

const rawUrl =
  process.env.DATABASE_URL_UNPOOLED || process.env.DATABASE_URL || "";

// Neon serverless WebSocket connection requires direct host without -pooler
const connStr = rawUrl
  .replace("-pooler.", ".")
  .replace("&channel_binding=require", "");

const adapter = new PrismaNeon({
  connectionString: connStr,
});

const prisma = new PrismaClient({
  adapter,
  log: ["warn", "error"],
});

export default prisma;
