import type { Request, Response } from "express";
import prisma from "../config/prisma";
import { HttpError } from "../utils/http-error";
import { sendSuccess } from "../utils/response";
import type { Prisma, Role, Lane } from "../generated/prisma/client";

export const getAllHeroes = async (
  req: Request,
  res: Response
): Promise<void> => {
  const page = Math.max(1, parseInt(req.query.page as string, 10) || 1);
  const limit = Math.max(1, parseInt(req.query.limit as string, 10) || 10);

  const where: Prisma.HeroWhereInput = {};

  if (typeof req.query.search === "string" && req.query.search.trim()) {
    where.name = {
      contains: req.query.search.trim(),
      mode: "insensitive",
    };
  }

  if (typeof req.query.role === "string" && req.query.role.trim()) {
    where.role = req.query.role.trim() as Role;
  }

  const totalItems = await prisma.hero.count({ where });
  const totalPages = totalItems > 0 ? Math.ceil(totalItems / limit) : 0;
  const skip = (page - 1) * limit;

  const heroes = await prisma.hero.findMany({
    where,
    skip,
    take: limit,
    orderBy: { id: "asc" },
  });

  sendSuccess(res, 200, "Berhasil mengambil data hero", heroes, {
    currentPage: page,
    limit,
    totalItems,
    totalPages,
  });
};

export const getHeroById = async (
  req: Request,
  res: Response
): Promise<void> => {
  const rawId = Array.isArray(req.params.hero_id)
    ? req.params.hero_id[0]
    : req.params.hero_id;
  const heroId = parseInt(rawId, 10);
  if (isNaN(heroId)) {
    throw new HttpError(404, "Hero tidak ditemukan");
  }

  const hero = await prisma.hero.findUnique({
    where: { id: heroId },
    include: {
      skins: true,
    },
  });

  if (!hero) {
    throw new HttpError(404, "Hero tidak ditemukan");
  }

  sendSuccess(res, 200, "Berhasil mengambil data hero", hero);
};

export const createHero = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { name, role, lane, releaseYear, priceBP, priceDiamond } = req.body;

  // 1. name, role, lane, atau releaseYear tidak diisi -> 400
  if (
    name === undefined ||
    name === null ||
    String(name).trim() === "" ||
    !role ||
    !lane ||
    releaseYear === undefined ||
    releaseYear === null ||
    releaseYear === "" ||
    isNaN(Number(releaseYear))
  ) {
    throw new HttpError(400, "name, role, lane, dan releaseYear wajib diisi");
  }

  // 2. Nama hero sudah ada -> 409
  const existingHero = await prisma.hero.findUnique({
    where: { name: String(name).trim() },
  });

  if (existingHero) {
    throw new HttpError(409, "Nama hero sudah ada");
  }

  // 3. Berhasil -> 201 berisi hero baru
  const newHero = await prisma.hero.create({
    data: {
      name: String(name).trim(),
      role: role as Role,
      lane: lane as Lane,
      releaseYear: Number(releaseYear),
      priceBP:
        priceBP !== undefined && priceBP !== null && priceBP !== ""
          ? Number(priceBP)
          : null,
      priceDiamond:
        priceDiamond !== undefined &&
        priceDiamond !== null &&
        priceDiamond !== ""
          ? Number(priceDiamond)
          : null,
    },
  });

  sendSuccess(res, 201, "Hero berhasil ditambahkan", newHero);
};
