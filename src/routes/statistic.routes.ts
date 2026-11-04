import { Router } from "express";
import { getStatistics } from "../controllers/statisticController";

const router = Router();

// fitur 7: statistics route
router.get("/", getStatistics);

export default router;
