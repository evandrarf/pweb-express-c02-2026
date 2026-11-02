import type { Request, Response } from "express";
import prisma from "../config/prisma";
import { HttpError } from "../utils/http-error";
import { sendSuccess } from "../utils/response";
import type { Prisma, Rarity } from "../generated/prisma/client";

export const getAllSkins = async (
  req: Request,
  res: Response
): Promise<void> => {
  const page = Math.max(1, parseInt(req.query.page as string, 10) || 1);
  const limit = Math.max(1, parseInt(req.query.limit as string, 10) || 10);

  const where: Prisma.SkinWhereInput = {};

  if (req.query.heroId) {
    const heroId = parseInt(req.query.heroId as string, 10);
    if (!isNaN(heroId)) {
      where.heroId = heroId;
    }
  }

  if (typeof req.query.rarity === "string" && req.query.rarity.trim()) {
    where.rarity = req.query.rarity.trim() as Rarity;
  }

  const totalItems = await prisma.skin.count({ where });
  const totalPages = totalItems > 0 ? Math.ceil(totalItems / limit) : 0;
  const skip = (page - 1) * limit;

  const skins = await prisma.skin.findMany({
    where,
    include: {
      hero: {
        select: {
          name: true,
        },
      },
    },
    skip,
    take: limit,
    orderBy: { id: "asc" },
  });

  sendSuccess(res, 200, "Berhasil mengambil data skin", skins, {
    currentPage: page,
    limit,
    totalItems,
    totalPages,
  });
};

export const getSkinById = async (
  req: Request,
  res: Response
): Promise<void> => {
  const rawId = Array.isArray(req.params.skin_id)
    ? req.params.skin_id[0]
    : req.params.skin_id;
  const skinId = parseInt(rawId, 10);
  if (isNaN(skinId)) {
    throw new HttpError(404, "Skin tidak ditemukan");
  }

  const skin = await prisma.skin.findUnique({
    where: { id: skinId },
    include: {
      hero: true,
    },
  });

  if (!skin) {
    throw new HttpError(404, "Skin tidak ditemukan");
  }

  sendSuccess(res, 200, "Berhasil mengambil data skin", skin);
};
