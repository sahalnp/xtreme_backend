import { Router } from "express";
import {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
} from "../controller/ProductController.js";
import { upload } from "../middleware/upload.js";

const router = Router();

router.get("/", getProducts);
router.get("/:id", getProductById);
router.post("/", upload.any(), createProduct);
router.put("/:id", upload.any(), updateProduct);
router.delete("/:id", deleteProduct);

export default router;
