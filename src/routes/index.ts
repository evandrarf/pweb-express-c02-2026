import { Router } from "express";
import heroRoutes from "./hero.routes";
import skinRoutes from "./skin.routes";
import playerRoutes from "./player.routes";

const router = Router();

router.use("/heroes", heroRoutes);
router.use("/skins", skinRoutes);
router.use("/players", playerRoutes);

export default router;
