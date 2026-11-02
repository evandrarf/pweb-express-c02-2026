import "dotenv/config";
import express from "express";
import prisma from "./config/prisma";
import { errorHandler, notFound } from "./middlewares/error";
import { logger } from "./middlewares/logger";
import router from "./routes";

const app = express();

// Middleware global
app.use(logger);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get("/health", async (_req, res) => {
  await prisma.$queryRaw`SELECT 1`;
  res.status(200).json({
    status: true,
    message: "Server dan database OK",
  });
});

// Root endpoint
app.get("/", (_req, res) => {
  res.json({
    status: true,
    message: "MLBB Shop Backend API",
    endpoints: {
      health: "/health",
      heroes: "/api/heroes",
      skins: "/api/skins",
    },
  });
});

// API routes
app.use("/api", router);

// Middleware notFound & errorHandler
app.use(notFound);
app.use(errorHandler);

const PORT = Number(process.env.PORT) || 3000;
const server = app.listen(PORT, () => {
  console.log(`Server berjalan di http://localhost:${PORT}`);
});

const shutdown = async () => {
  server.close();
  await prisma.$disconnect();
  console.log("Database disconnected");
  process.exit(0);
};

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
