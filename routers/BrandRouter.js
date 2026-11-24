import { Router } from "express";
import { getBrands, createBrand } from "../controller/BrandController.js";

const router = Router();

router.get("/", getBrands);
router.post("/", createBrand);

export default router;
