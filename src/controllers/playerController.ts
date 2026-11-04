import type { Request, Response } from "express";
import prisma from "../config/prisma";
import { HttpError } from "../utils/http-error";
import { sendSuccess } from "../utils/response";
import type { Currency } from "../generated/prisma/client";

// fitur 4: create player
export const createPlayer = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { nickname } = req.body;

  if (!nickname || String(nickname).trim() === "") {
    throw new HttpError(400, "nickname wajib diisi");
  }

  const trimmedNickname = String(nickname).trim();

  const existingPlayer = await prisma.player.findUnique({
    where: { nickname: trimmedNickname },
  });

  if (existingPlayer) {
    throw new HttpError(409, "nickname sudah dipakai");
  }

  const newPlayer = await prisma.player.create({
    data: {
      nickname: trimmedNickname,
    },
  });

  sendSuccess(res, 201, "Player berhasil ditambahkan", newPlayer);
};

// fitur 4: get player detail
export const getPlayerById = async (
  req: Request,
  res: Response
): Promise<void> => {
  const rawId = Array.isArray(req.params.player_id)
    ? req.params.player_id[0]
    : req.params.player_id;
  const playerId = parseInt(rawId, 10);

  if (isNaN(playerId)) {
    throw new HttpError(404, "Player tidak ditemukan");
  }

  const player = await prisma.player.findUnique({
    where: { id: playerId },
    include: {
      heroes: {
        include: {
          hero: true,
        },
      },
    },
  });

  if (!player) {
    throw new HttpError(404, "Player tidak ditemukan");
  }

  const formattedHeroes = player.heroes.map((ph) => ({
    id: ph.hero.id,
    name: ph.hero.name,
    role: ph.hero.role,
    lane: ph.hero.lane,
    releaseYear: ph.hero.releaseYear,
    priceBP: ph.hero.priceBP,
    priceDiamond: ph.hero.priceDiamond,
    currency: ph.currency,
    pricePaid: ph.pricePaid,
  }));

  sendSuccess(res, 200, "Berhasil mengambil data player", {
    id: player.id,
    nickname: player.nickname,
    bp: player.bp,
    diamond: player.diamond,
    createdAt: player.createdAt,
    heroes: formattedHeroes,
  });
};

// fitur 4: update player
export const updatePlayer = async (
  req: Request,
  res: Response
): Promise<void> => {
  const rawId = Array.isArray(req.params.player_id)
    ? req.params.player_id[0]
    : req.params.player_id;
  const playerId = parseInt(rawId, 10);
  const { nickname } = req.body;

  if (isNaN(playerId)) {
    throw new HttpError(404, "Player tidak ditemukan");
  }

  const existingPlayer = await prisma.player.findUnique({
    where: { id: playerId },
  });

  if (!existingPlayer) {
    throw new HttpError(404, "Player tidak ditemukan");
  }

  if (!nickname || String(nickname).trim() === "") {
    throw new HttpError(400, "nickname wajib diisi");
  }

  const trimmedNickname = String(nickname).trim();

  const nicknameTaken = await prisma.player.findUnique({
    where: { nickname: trimmedNickname },
  });

  if (nicknameTaken && nicknameTaken.id !== playerId) {
    throw new HttpError(409, "nickname sudah dipakai");
  }

  const updatedPlayer = await prisma.player.update({
    where: { id: playerId },
    data: {
      nickname: trimmedNickname,
    },
  });

  sendSuccess(res, 200, "Player berhasil diupdate", updatedPlayer);
};

// fitur 4: delete player
export const deletePlayer = async (
  req: Request,
  res: Response
): Promise<void> => {
  const rawId = Array.isArray(req.params.player_id)
    ? req.params.player_id[0]
    : req.params.player_id;
  const playerId = parseInt(rawId, 10);

  if (isNaN(playerId)) {
    throw new HttpError(404, "Player tidak ditemukan");
  }

  const existingPlayer = await prisma.player.findUnique({
    where: { id: playerId },
  });

  if (!existingPlayer) {
    throw new HttpError(404, "Player tidak ditemukan");
  }

  await prisma.player.delete({
    where: { id: playerId },
  });

  sendSuccess(res, 200, "Player berhasil dihapus");
};

// fitur 5: top up player
export const topUpPlayer = async (
  req: Request,
  res: Response
): Promise<void> => {
  const rawId = Array.isArray(req.params.player_id)
    ? req.params.player_id[0]
    : req.params.player_id;
  const playerId = parseInt(rawId, 10);
  const { amount } = req.body;

  if (isNaN(playerId)) {
    throw new HttpError(404, "Player tidak ditemukan");
  }

  const player = await prisma.player.findUnique({
    where: { id: playerId },
  });

  if (!player) {
    throw new HttpError(404, "Player tidak ditemukan");
  }

  const amountNum = Number(amount);
  if (
    !Number.isInteger(amountNum) ||
    amountNum <= 0 ||
    amount === undefined ||
    amount === null ||
    amount === ""
  ) {
    throw new HttpError(400, "amount harus berupa bilangan bulat lebih dari 0");
  }

  const updatedPlayer = await prisma.player.update({
    where: { id: playerId },
    data: {
      diamond: {
        increment: amountNum,
      },
    },
    select: {
      id: true,
      diamond: true,
    },
  });

  sendSuccess(res, 200, "Top up berhasil", updatedPlayer);
};

// fitur 5: match player
export const matchPlayer = async (
  req: Request,
  res: Response
): Promise<void> => {
  const rawId = Array.isArray(req.params.player_id)
    ? req.params.player_id[0]
    : req.params.player_id;
  const playerId = parseInt(rawId, 10);
  const { result } = req.body;

  if (isNaN(playerId)) {
    throw new HttpError(404, "Player tidak ditemukan");
  }

  const player = await prisma.player.findUnique({
    where: { id: playerId },
  });

  if (!player) {
    throw new HttpError(404, "Player tidak ditemukan");
  }

  if (result !== "WIN" && result !== "LOSE") {
    throw new HttpError(400, "result harus WIN atau LOSE");
  }

  const bpGained = result === "WIN" ? 300 : 100;

  const updatedPlayer = await prisma.player.update({
    where: { id: playerId },
    data: {
      bp: {
        increment: bpGained,
      },
    },
    select: {
      id: true,
      bp: true,
    },
  });

  sendSuccess(res, 200, "Match selesai", {
    result,
    bpGained,
    newBalance: updatedPlayer.bp,
  });
};

// fitur 6: buy hero
export const buyHero = async (
  req: Request,
  res: Response
): Promise<void> => {
  const rawId = Array.isArray(req.params.player_id)
    ? req.params.player_id[0]
    : req.params.player_id;
  const playerId = parseInt(rawId, 10);
  const { heroId, currency } = req.body;

  // 1. heroId kosong, atau currency bukan BP/DIAMOND -> 400
  const heroIdNum = Number(heroId);
  if (
    heroId === undefined ||
    heroId === null ||
    heroId === "" ||
    !Number.isInteger(heroIdNum) ||
    heroIdNum <= 0 ||
    (currency !== "BP" && currency !== "DIAMOND")
  ) {
    throw new HttpError(
      400,
      "heroId wajib diisi dan currency harus BP atau DIAMOND"
    );
  }

  // 2. Player tidak ditemukan -> 404
  if (isNaN(playerId)) {
    throw new HttpError(404, "Player tidak ditemukan");
  }

  const player = await prisma.player.findUnique({
    where: { id: playerId },
  });

  if (!player) {
    throw new HttpError(404, "Player tidak ditemukan");
  }

  // 3. Hero tidak ditemukan -> 404
  const hero = await prisma.hero.findUnique({
    where: { id: heroIdNum },
  });

  if (!hero) {
    throw new HttpError(404, "Hero tidak ditemukan");
  }

  // 4. Harga hero untuk currency tersebut kosong -> 400 (contoh: Freya tidak punya harga BP)
  const pricePaid = currency === "BP" ? hero.priceBP : hero.priceDiamond;
  if (pricePaid === null || pricePaid === undefined) {
    throw new HttpError(
      400,
      `Hero ${hero.name} tidak bisa dibeli dengan ${currency}`
    );
  }

  // 5. Player sudah memiliki hero tersebut -> 409
  const existingPlayerHero = await prisma.playerHero.findUnique({
    where: {
      playerId_heroId: {
        playerId,
        heroId: heroIdNum,
      },
    },
  });

  if (existingPlayerHero) {
    throw new HttpError(409, "Player sudah memiliki hero ini");
  }

  // 6. Saldo player kurang dari harga hero -> 400
  if (currency === "BP" && player.bp < pricePaid) {
    throw new HttpError(400, "Saldo BP tidak mencukupi");
  }

  if (currency === "DIAMOND" && player.diamond < pricePaid) {
    throw new HttpError(400, "Saldo Diamond tidak mencukupi");
  }

  // Simpan dengan transaction:
  // 1. Kurangi saldo bp atau diamond player sesuai currency (gunakan decrement).
  // 2. Buat data PlayerHero dengan currency dan pricePaid.
  const [updatedPlayer] = await prisma.$transaction([
    prisma.player.update({
      where: { id: playerId },
      data: {
        bp: currency === "BP" ? { decrement: pricePaid } : undefined,
        diamond: currency === "DIAMOND" ? { decrement: pricePaid } : undefined,
      },
      select: {
        bp: true,
        diamond: true,
      },
    }),
    prisma.playerHero.create({
      data: {
        playerId,
        heroId: heroIdNum,
        currency: currency as Currency,
        pricePaid,
      },
    }),
  ]);

  // Response: 201 berisi hero yang dibeli, mata uang, harga, dan saldo BP serta Diamond terbaru.
  sendSuccess(res, 201, "Hero berhasil dibeli", {
    hero: {
      id: hero.id,
      name: hero.name,
    },
    currency,
    pricePaid,
    balance: {
      bp: updatedPlayer.bp,
      diamond: updatedPlayer.diamond,
    },
  });
};
