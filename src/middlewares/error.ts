import type { NextFunction, Request, Response } from "express";
import { HttpError } from "../utils/http-error";

export const notFound = (req: Request, res: Response): void => {
  res.status(404).json({
    status: false,
    message: `Endpoint ${req.method} ${req.originalUrl} tidak ditemukan`,
  });
};

export const errorHandler = (
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  if (err instanceof HttpError) {
    res.status(err.status).json({
      status: false,
      message: err.message,
    });
    return;
  }

  if (typeof err === "object" && err !== null) {
    if ("code" in err) {
      if (err.code === "P2002") {
        res.status(409).json({
          status: false,
          message: "Data sudah ada (nilai unik bentrok)",
        });
        return;
      }
      if (err.code === "P2025") {
        res.status(404).json({
          status: false,
          message: "Data tidak ditemukan",
        });
        return;
      }
      if (err.code === "P2003") {
        res.status(400).json({
          status: false,
          message: "Relasi data tidak valid",
        });
        return;
      }
    }
    if ("status" in err && typeof err.status === "number" && err.status < 500) {
      res.status(err.status).json({
        status: false,
        message: "Request tidak valid (cek format JSON kalian)",
      });
      return;
    }
  }

  console.error("Unhandled error:", err);
  res.status(500).json({
    status: false,
    message: "Terjadi kesalahan pada server",
  });
};
