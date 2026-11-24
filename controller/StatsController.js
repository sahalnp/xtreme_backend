import { Product } from "../models/Product.js";
import { Category } from "../models/Category.js";
import { localStore } from "../config/localStore.js";
import mongoose from "mongoose";

export const getStoreStats = async (req, res) => {
  try {
    if (mongoose.connection.readyState === 1) {
      const [total_products, active_products, inactive_products, deleted_products, total_categories] =
        await Promise.all([
          Product.countDocuments({ is_deleted: false }),
          Product.countDocuments({ is_deleted: false, is_active: true }),
          Product.countDocuments({ is_deleted: false, is_active: false }),
          Product.countDocuments({ is_deleted: true }),
          Category.countDocuments({ is_deleted: false }),
        ]);

      return res.status(200).json({
        total_products,
        active_products,
        inactive_products,
        deleted_products,
        total_categories,
      });
    } else {
      const stats = localStore.getStats();
      return res.status(200).json(stats);
    }
  } catch (err) {
    console.error("Get stats error:", err);
    return res.status(500).json({ error: "Failed to get store stats" });
  }
};

