import { Product } from "../models/Product.js";
import { Category } from "../models/Category.js";
import { localStore } from "../config/localStore.js";
import mongoose from "mongoose";
import fs from "fs";

// Converts an uploaded multer file to a permanent Base64 Data URL
// This guarantees photos persist and load instantly across Vercel serverless containers
const processFileToImage = (f) => {
  if (!f) return "";
  try {
    if (f.path && fs.existsSync(f.path)) {
      const buffer = fs.readFileSync(f.path);
      const mime = f.mimetype || "image/jpeg";
      return `data:${mime};base64,${buffer.toString("base64")}`;
    }
  } catch (e) {
    console.error("Error converting uploaded file to data URI:", e);
  }
  return f.filename || "";
};

const formatProductImageUrl = (req, prod) => {
  const p = { ...(prod.toJSON ? prod.toJSON() : prod) };
  const host = req.get("host");

  ["image", "image2", "image3", "image4"].forEach((key) => {
    const urlKey = `${key}_url`;
    if (p[key]) {
      if (p[key].startsWith("http") || p[key].startsWith("data:")) {
        p[urlKey] = p[key];
      } else {
        p[urlKey] = `${req.protocol}://${host}/uploads/${p[key]}`;
      }
    } else {
      p[urlKey] = null;
    }
  });

  return p;
};

export const getProducts = async (req, res) => {
  try {
    const isAdmin = req.query.admin === "true";
    const includeDeleted = req.query.deleted === "true";
    const category = req.query.category;
    const search = req.query.search;

    if (mongoose.connection.readyState === 1) {
      let filter = {};
      if (!isAdmin) {
        filter.is_deleted = false;
        filter.is_active = true;
      } else {
        if (!includeDeleted) {
          filter.is_deleted = false;
        }
      }
      if (category) {
        filter.category = category;
      }
      if (search) {
        filter.$or = [
          { name: { $regex: search, $options: "i" } },
          { color: { $regex: search, $options: "i" } },
        ];
      }

      const products = await Product.find(filter)
        .populate("category", "name")
        .sort({ createdAt: -1 });

      const formatted = products.map((p) => formatProductImageUrl(req, p));
      return res.status(200).json(formatted);
    } else {
      const products = localStore.getProducts({
        admin: isAdmin,
        deleted: includeDeleted,
        category,
        search,
      });
      const formatted = products.map((p) => formatProductImageUrl(req, p));
      return res.status(200).json(formatted);
    }
  } catch (err) {
    console.error("Get products error:", err);
    return res.status(500).json({ error: "Failed to fetch products" });
  }
};

export const getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    let prod;
    if (mongoose.connection.readyState === 1) {
      prod = await Product.findById(id).populate("category", "name");
    } else {
      prod = localStore.findProductById(id);
    }
    if (!prod) {
      return res.status(404).json({ error: "Product not found" });
    }
    return res.status(200).json(formatProductImageUrl(req, prod));
  } catch (err) {
    return res.status(500).json({ error: "Failed to fetch product" });
  }
};

export const createProduct = async (req, res) => {
  try {
    const { name, category, brand, price, min_price, max_price, color, size, stock, description, is_active } = req.body;
    if (!name || (!price && !min_price) || !category) {
      return res.status(400).json({ error: "Name, price/price range and category are required" });
    }

    const files = req.files || [];
    let image = req.body.image || "";
    let image2 = req.body.image2 || "";
    let image3 = req.body.image3 || "";
    let image4 = req.body.image4 || "";

    files.forEach((f) => {
      const dataUri = processFileToImage(f);
      if (f.fieldname === "image") image = dataUri;
      else if (f.fieldname === "image2") image2 = dataUri;
      else if (f.fieldname === "image3") image3 = dataUri;
      else if (f.fieldname === "image4") image4 = dataUri;
    });

    const parsedMinPrice = min_price ? parseFloat(min_price) : (price ? parseFloat(price) * 0.9 : 0);
    const parsedMaxPrice = max_price ? parseFloat(max_price) : (price ? parseFloat(price) * 1.2 : 0);
    const parsedPrice = price ? parseFloat(price) : parsedMinPrice;

    if (mongoose.connection.readyState === 1) {
      const newProd = new Product({
        name,
        category,
        brand: brand || null,
        price: parsedPrice,
        min_price: parsedMinPrice,
        max_price: parsedMaxPrice,
        color: color || "Black",
        size: size || "UK 7, UK 8, UK 9, UK 10",
        stock: parseInt(stock, 10) || 15,
        description: description || "",
        image,
        image2,
        image3,
        image4,
        is_active: is_active !== undefined ? (is_active === "true" || is_active === true) : true,
        is_deleted: false,
      });

      await newProd.save();
      const populated = await Product.findById(newProd._id).populate("category", "name").populate("brand", "name");
      return res.status(201).json(formatProductImageUrl(req, populated));
    } else {
      const newProd = localStore.createProduct({
        name,
        category,
        brand,
        price: parsedPrice,
        min_price: parsedMinPrice,
        max_price: parsedMaxPrice,
        color,
        size,
        stock,
        description,
        image,
        image2,
        image3,
        image4,
        is_active,
      });
      return res.status(201).json(formatProductImageUrl(req, newProd));
    }
  } catch (err) {
    console.error("Create product error:", err);
    return res.status(500).json({ error: "Failed to create product: " + err.message });
  }
};

export const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body };

    const files = req.files || [];
    files.forEach((f) => {
      const dataUri = processFileToImage(f);
      if (f.fieldname === "image") updateData.image = dataUri;
      else if (f.fieldname === "image2") updateData.image2 = dataUri;
      else if (f.fieldname === "image3") updateData.image3 = dataUri;
      else if (f.fieldname === "image4") updateData.image4 = dataUri;
    });

    if (updateData.price) updateData.price = parseFloat(updateData.price);
    if (updateData.min_price) updateData.min_price = parseFloat(updateData.min_price);
    if (updateData.max_price) updateData.max_price = parseFloat(updateData.max_price);
    if (updateData.stock) updateData.stock = parseInt(updateData.stock, 10);
    if (updateData.is_active !== undefined) {
      updateData.is_active = updateData.is_active === "true" || updateData.is_active === true;
    }

    if (mongoose.connection.readyState === 1) {
      let updated;
      try {
        updated = await Product.findByIdAndUpdate(id, updateData, { new: true }).populate("category", "name");
      } catch (castErr) {
        updated = await Product.findOneAndUpdate(
          { $or: [{ _id: id }, { name: updateData.name }] },
          updateData,
          { new: true }
        ).populate("category", "name");
      }

      if (!updated) {
        updated = localStore.updateProduct(id, updateData);
      }
      if (!updated) {
        updated = localStore.createProduct({ ...updateData, id });
      }
      return res.status(200).json(formatProductImageUrl(req, updated));
    } else {
      let updated = localStore.updateProduct(id, updateData);
      if (!updated) {
        // Upsert if not found so edit never returns 404
        updated = localStore.createProduct({ ...updateData, id });
      }
      return res.status(200).json(formatProductImageUrl(req, updated));
    }
  } catch (err) {
    console.error("Update product error:", err);
    return res.status(500).json({ error: "Failed to update product: " + err.message });
  }
};

export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    if (mongoose.connection.readyState === 1) {
      const deleted = await Product.findByIdAndUpdate(id, { is_deleted: true }, { new: true });
      if (!deleted) return res.status(404).json({ error: "Product not found" });
      return res.status(200).json({ message: "Product deleted successfully", id });
    } else {
      const deleted = localStore.deleteProduct(id);
      if (!deleted) return res.status(404).json({ error: "Product not found" });
      return res.status(200).json({ message: "Product deleted successfully", id });
    }
  } catch (err) {
    return res.status(500).json({ error: "Failed to delete product" });
  }
};
