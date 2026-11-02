import fs from "fs";
import path from "path";
import prisma from "../src/config/prisma";

async function main() {
  console.log("Emptying all tables...");
  await prisma.$executeRawUnsafe(
    'TRUNCATE "PlayerHero", "Player", "Skin", "Hero" RESTART IDENTITY CASCADE;'
  );

  console.log("Seeding heroes...");
  const heroesData = JSON.parse(
    fs.readFileSync(path.join(process.cwd(), "data/heroes.json"), "utf-8")
  );
  await prisma.hero.createMany({
    data: heroesData,
  });

  console.log("Seeding skins...");
  const skinsData = JSON.parse(
    fs.readFileSync(path.join(process.cwd(), "data/skins.json"), "utf-8")
  );
  await prisma.skin.createMany({
    data: skinsData,
  });

  console.log("Seeding players...");
  await prisma.player.createMany({
    data: [
      { nickname: "ArekITS", bp: 1500, diamond: 75 },
      { nickname: "SangPushRank", bp: 13000, diamond: 2892 },
      { nickname: "MageSurabaya", bp: 10000, diamond: 0 },
    ],
  });

  console.log("Seeding player heroes...");
  await prisma.playerHero.createMany({
    data: [
      { playerId: 1, heroId: 18, currency: "BP", pricePaid: 2000 },
      { playerId: 1, heroId: 1, currency: "BP", pricePaid: 10800 },
      { playerId: 2, heroId: 84, currency: "DIAMOND", pricePaid: 599 },
      { playerId: 2, heroId: 56, currency: "BP", pricePaid: 32000 },
    ],
  });

  console.log("Seed completed successfully!");
}

main()
  .catch((e) => {
    console.error("Error during seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
