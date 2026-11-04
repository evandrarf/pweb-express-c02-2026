import type { Request, Response } from "express";
import prisma from "../config/prisma";
import { sendSuccess } from "../utils/response";

// fitur 7: get statistics
export const getStatistics = async (
  _req: Request,
  res: Response
): Promise<void> => {
  const totalPlayers = await prisma.player.count();
  const totalHeroesOwned = await prisma.playerHero.count();
  const totalDiamondAgg = await prisma.player.aggregate({
    _sum: {
      diamond: true,
    },
  });
  const totalDiamond = totalDiamondAgg._sum.diamond ?? 0;

  const mostOwnedGroup = await prisma.playerHero.groupBy({
    by: ["heroId"],
    _count: {
      heroId: true,
    },
    orderBy: [
      {
        _count: {
          heroId: "desc",
        },
      },
      {
        heroId: "asc",
      },
    ],
    take: 1,
  });

  let mostOwnedHero: {
    heroId: number;
    name: string;
    owners: number;
  } | null = null;

  if (mostOwnedGroup.length > 0) {
    const topHero = await prisma.hero.findUnique({
      where: { id: mostOwnedGroup[0].heroId },
      select: { id: true, name: true },
    });
    if (topHero) {
      mostOwnedHero = {
        heroId: topHero.id,
        name: topHero.name,
        owners: mostOwnedGroup[0]._count.heroId,
      };
    }
  }

  const roleGroups = await prisma.hero.groupBy({
    by: ["role"],
    _count: {
      role: true,
    },
    orderBy: [
      {
        _count: {
          role: "desc",
        },
      },
      {
        role: "asc",
      },
    ],
  });

  const heroesPerRole = roleGroups.map((g) => ({
    role: g.role,
    total: g._count.role,
  }));

  sendSuccess(res, 200, "Berhasil mengambil statistik", {
    totalPlayers,
    totalHeroesOwned,
    totalDiamond,
    mostOwnedHero,
    heroesPerRole,
  });
};
