import { Category } from "../models/Category.js";
import { localStore } from "../config/localStore.js";
import mongoose from "mongoose";

export const getCategories = async (req, res) => {
  try {
    const includeDeleted = req.query.all === "true";

    if (mongoose.connection.readyState === 1) {
      const filter = includeDeleted ? {} : { is_deleted: false };
      const categories = await Category.find(filter).sort({ createdAt: -1 });
      return res.status(200).json(categories);
    } else {
      const categories = localStore.getCategories(includeDeleted);
      return res.status(200).json(categories);
    }
  } catch (err) {
    console.error("Get categories error:", err);
    return res.status(500).json({ error: "Failed to fetch categories" });
  }
};

export const createCategory = async (req, res) => {
  try {
    const { name, description } = req.body;
    if (!name) {
      return res.status(400).json({ error: "Category name is required" });
    }

    if (mongoose.connection.readyState === 1) {
      const cat = new Category({ name, description });
      await cat.save();
      return res.status(201).json(cat);
    } else {
      const cat = localStore.createCategory({ name, description });
      return res.status(201).json(cat);
    }
  } catch (err) {
    console.error("Create category error:", err);
    return res.status(500).json({ error: "Failed to create category" });
  }
};

export const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    if (mongoose.connection.readyState === 1) {
      const cat = await Category.findByIdAndUpdate(id, req.body, { new: true });
      if (!cat) return res.status(404).json({ error: "Category not found" });
      return res.status(200).json(cat);
    } else {
      const cat = localStore.updateCategory(id, req.body);
      if (!cat) return res.status(404).json({ error: "Category not found" });
      return res.status(200).json(cat);
    }
  } catch (err) {
    return res.status(500).json({ error: "Failed to update category" });
  }
};

export const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;
    if (mongoose.connection.readyState === 1) {
      const cat = await Category.findByIdAndUpdate(id, { is_deleted: true }, { new: true });
      if (!cat) return res.status(404).json({ error: "Category not found" });
      return res.status(200).json({ message: "Category soft-deleted", id });
    } else {
      const cat = localStore.deleteCategory(id);
      if (!cat) return res.status(404).json({ error: "Category not found" });
      return res.status(200).json({ message: "Category soft-deleted", id });
    }
  } catch (err) {
    return res.status(500).json({ error: "Failed to delete category" });
  }
};

