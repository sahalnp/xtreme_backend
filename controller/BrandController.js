import { Brand } from "../models/Brand.js";
import { localStore } from "../config/localStore.js";
import mongoose from "mongoose";

export const getBrands = async (req, res) => {
  try {
    if (mongoose.connection.readyState === 1) {
      const brands = await Brand.find({ is_deleted: false }).sort({ name: 1 });
      return res.status(200).json(brands);
    } else {
      const brands = localStore.getBrands();
      return res.status(200).json(brands);
    }
  } catch (err) {
    console.error("Get brands error:", err);
    return res.status(500).json({ error: "Failed to fetch brands" });
  }
};

export const createBrand = async (req, res) => {
  try {
    const { name, description } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ error: "Brand name is required" });
    }

    if (mongoose.connection.readyState === 1) {
      let existing = await Brand.findOne({ name: { $regex: `^${name.trim()}$`, $options: "i" } });
      if (existing) {
        return res.status(200).json(existing);
      }
      const brand = await Brand.create({
        name: name.trim(),
        description: description || "",
      });
      return res.status(201).json(brand);
    } else {
      const brand = localStore.createBrand({ name: name.trim(), description: description || "" });
      return res.status(201).json(brand);
    }
  } catch (err) {
    console.error("Create brand error:", err);
    return res.status(500).json({ error: "Failed to create brand" });
  }
};
