import { Router } from "express";
import { loginAdmin } from "../controller/AuthController.js";

const router = Router();

router.post("/login", loginAdmin);
router.post("/login/", loginAdmin);

export default router;
