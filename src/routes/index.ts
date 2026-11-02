import { Router } from "express";
import heroRoutes from "./hero.routes";
import skinRoutes from "./skin.routes";

const router = Router();

router.use("/heroes", heroRoutes);
router.use("/skins", skinRoutes);

export default router;
