import type { Response } from "express";

export const sendSuccess = (
  res: Response,
  status: number,
  message: string,
  data?: unknown,
  metadata?: Record<string, unknown>
): void => {
  const responseBody: Record<string, unknown> = {
    status: true,
    message,
  };
  if (data !== undefined) {
    responseBody.data = data;
  }
  if (metadata !== undefined) {
    responseBody.metadata = metadata;
  }
  res.status(status).json(responseBody);
};
