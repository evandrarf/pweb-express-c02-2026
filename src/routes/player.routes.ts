import { Router } from "express";
import {
  createPlayer,
  getPlayerById,
  updatePlayer,
  deletePlayer,
  topUpPlayer,
  matchPlayer,
  buyHero,
} from "../controllers/playerController";

const router = Router();

// fitur 4: player routes
router.post("/", createPlayer);
router.get("/:player_id", getPlayerById);
router.patch("/:player_id", updatePlayer);
router.delete("/:player_id", deletePlayer);

// fitur 5: top up and match routes
router.post("/:player_id/topup", topUpPlayer);
router.post("/:player_id/matches", matchPlayer);

// fitur 6: buy hero route
router.post("/:player_id/heroes", buyHero);

export default router;
