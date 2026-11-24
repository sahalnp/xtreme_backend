import { Router } from "express";
import { getStoreStats } from "../controller/StatsController.js";

const router = Router();

router.get("/", getStoreStats);

export default router;

