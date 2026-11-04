import { Router } from "express";
import heroRoutes from "./hero.routes";
import skinRoutes from "./skin.routes";
import playerRoutes from "./player.routes";
import statisticRoutes from "./statistic.routes";

const router = Router();

router.use("/heroes", heroRoutes);
router.use("/skins", skinRoutes);
router.use("/players", playerRoutes);
router.use("/statistics", statisticRoutes);

export default router;
