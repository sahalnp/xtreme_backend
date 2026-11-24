import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { hashPassword, comparePassword } from "../utils/Password.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dataDir = path.join(__dirname, "../data");
const dataFile = path.join(dataDir, "db.json");

if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

let memoryDB = {
  users: [],
  categories: [],
  products: [],
};

const loadData = () => {
  if (fs.existsSync(dataFile)) {
    try {
      const content = fs.readFileSync(dataFile, "utf-8");
      memoryDB = JSON.parse(content);
    } catch (e) {
      console.error("Error reading fallback db file:", e);
    }
  }
};

const saveData = () => {
  try {
    fs.writeFileSync(dataFile, JSON.stringify(memoryDB, null, 2), "utf-8");
  } catch (e) {
    console.error("Error writing fallback db file:", e);
  }
};

loadData();

// Initialize initial seed if empty
const initSeed = async () => {
  if (memoryDB.users.length === 0) {
    const hashedPassword = await hashPassword("admin123");
    memoryDB.users.push({
      _id: "usr_admin_1",
      id: "usr_admin_1",
      username: "admin",
      password: hashedPassword,
      email: "admin@xtremeshoes.com",
      role: "admin",
      createdAt: new Date().toISOString(),
    });
  }

  if (memoryDB.categories.length === 0) {
    const cats = [
      { id: "cat_1", _id: "cat_1", name: "Sneakers", description: "Streetwear & lifestyle kicks", is_active: true, is_deleted: false },
      { id: "cat_2", _id: "cat_2", name: "Running Shoes", description: "High-mileage responsive runners", is_active: true, is_deleted: false },
      { id: "cat_3", _id: "cat_3", name: "Basketball", description: "High-top court traction shoes", is_active: true, is_deleted: false },
      { id: "cat_4", _id: "cat_4", name: "Casual & Loafers", description: "Everyday comfort footwear", is_active: true, is_deleted: false },
      { id: "cat_5", _id: "cat_5", name: "Outdoor & Trail", description: "All-terrain rugged silhouettes", is_active: true, is_deleted: false },
    ];
    memoryDB.categories = cats;
  }

  if (memoryDB.products.length === 0) {
    const prods = [
      {
        id: "prod_1",
        _id: "prod_1",
        name: "Nike Air Max Pulse",
        category: "cat_1",
        category_name: "Sneakers",
        price: 139.99,
        color: "Black / Wolf Grey",
        size: "UK 7, UK 8, UK 9, UK 10, UK 11",
        stock: 25,
        description: "Point-loaded Air unit engineered for supreme bounce.",
        is_active: true,
        is_deleted: false,
        createdAt: new Date().toISOString(),
      },
      {
        id: "prod_2",
        _id: "prod_2",
        name: "Adidas Ultraboost Light",
        category: "cat_2",
        category_name: "Running Shoes",
        price: 189.99,
        color: "Core Black / Cloud White",
        size: "UK 7, UK 8, UK 9, UK 10",
        stock: 18,
        description: "Ultralight BOOST foam providing continuous propulsion.",
        is_active: true,
        is_deleted: false,
        createdAt: new Date().toISOString(),
      },
      {
        id: "prod_3",
        _id: "prod_3",
        name: "Air Jordan Retro 1 High",
        category: "cat_3",
        category_name: "Basketball",
        price: 199.99,
        color: "Chicago Red / White / Black",
        size: "UK 8, UK 9, UK 10, UK 11, UK 12",
        stock: 12,
        description: "Iconic collector high-top in heritage Chicago colors.",
        is_active: true,
        is_deleted: false,
        createdAt: new Date().toISOString(),
      },
      {
        id: "prod_4",
        _id: "prod_4",
        name: "Puma Velocity Nitro 3",
        category: "cat_2",
        category_name: "Running Shoes",
        price: 129.99,
        color: "Electric Lime / Black",
        size: "UK 7, UK 8, UK 9, UK 10",
        stock: 30,
        description: "Explosive energy rebound with PUMAGRIP traction rubber.",
        is_active: true,
        is_deleted: false,
        createdAt: new Date().toISOString(),
      },
      {
        id: "prod_5",
        _id: "prod_5",
        name: "New Balance 9060 Chunky",
        category: "cat_1",
        category_name: "Sneakers",
        price: 159.99,
        color: "Rain Cloud / Castlerock",
        size: "UK 7, UK 8, UK 9, UK 10, UK 11",
        stock: 15,
        description: "Exaggerated Y2K midsole with sculpted dual-density ABZORB.",
        is_active: true,
        is_deleted: false,
        createdAt: new Date().toISOString(),
      },
      {
        id: "prod_6",
        _id: "prod_6",
        name: "Salomon XT-6 Gore-Tex",
        category: "cat_5",
        category_name: "Outdoor & Trail",
        price: 210.0,
        color: "Phantom / Black",
        size: "UK 8, UK 9, UK 10, UK 11",
        stock: 10,
        description: "Legendary trail icon featuring waterproof membrane and ACS chassis.",
        is_active: true,
        is_deleted: false,
        createdAt: new Date().toISOString(),
      },
    ];
    memoryDB.products = prods;
  }
  saveData();
};

initSeed();

export const localStore = {
  getUsers: () => memoryDB.users,
  findUserByUsername: (u) => memoryDB.users.find((x) => x.username.toLowerCase() === u.toLowerCase()),
  
  getCategories: (includeDeleted = false) => {
    return memoryDB.categories.filter((c) => includeDeleted || !c.is_deleted);
  },
  createCategory: (data) => {
    const id = "cat_" + Date.now();
    const newCat = {
      id,
      _id: id,
      name: data.name,
      description: data.description || "",
      is_active: data.is_active !== undefined ? data.is_active : true,
      is_deleted: false,
      createdAt: new Date().toISOString(),
    };
    memoryDB.categories.unshift(newCat);
    saveData();
    return newCat;
  },
  updateCategory: (id, data) => {
    const idx = memoryDB.categories.findIndex((c) => c.id === id || c._id === id);
    if (idx !== -1) {
      memoryDB.categories[idx] = { ...memoryDB.categories[idx], ...data, updatedAt: new Date().toISOString() };
      saveData();
      return memoryDB.categories[idx];
    }
    return null;
  },
  deleteCategory: (id) => {
    const idx = memoryDB.categories.findIndex((c) => c.id === id || c._id === id);
    if (idx !== -1) {
      memoryDB.categories[idx].is_deleted = true;
      saveData();
      return memoryDB.categories[idx];
    }
    return null;
  },

  getProducts: (filter = {}) => {
    let prods = [...memoryDB.products];
    if (filter.admin !== true) {
      prods = prods.filter((p) => !p.is_deleted && p.is_active);
    } else {
      if (!filter.deleted) {
        prods = prods.filter((p) => !p.is_deleted);
      }
    }
    if (filter.category) {
      prods = prods.filter((p) => p.category === filter.category || p.category_name?.toLowerCase() === filter.category.toLowerCase());
    }
    if (filter.search) {
      const q = filter.search.toLowerCase();
      prods = prods.filter((p) => p.name.toLowerCase().includes(q) || p.color?.toLowerCase().includes(q));
    }
    return prods;
  },
  findProductById: (id) => memoryDB.products.find((p) => p.id === id || p._id === id),
  createProduct: (data) => {
    const id = "prod_" + Date.now();
    const cat = memoryDB.categories.find((c) => c.id === data.category || c._id === data.category);
    const newProd = {
      id,
      _id: id,
      name: data.name,
      category: data.category,
      category_name: cat ? cat.name : "Sneakers",
      price: parseFloat(data.price) || 0,
      color: data.color || "Black",
      size: data.size || "UK 7, UK 8, UK 9, UK 10",
      stock: parseInt(data.stock, 10) || 15,
      description: data.description || "",
      image: data.image || "",
      is_active: data.is_active !== undefined ? (data.is_active === "true" || data.is_active === true) : true,
      is_deleted: false,
      createdAt: new Date().toISOString(),
    };
    memoryDB.products.unshift(newProd);
    saveData();
    return newProd;
  },
  updateProduct: (id, data) => {
    const idx = memoryDB.products.findIndex((p) => p.id === id || p._id === id);
    if (idx !== -1) {
      if (data.category) {
        const cat = memoryDB.categories.find((c) => c.id === data.category || c._id === data.category);
        if (cat) data.category_name = cat.name;
      }
      if (data.price) data.price = parseFloat(data.price);
      if (data.stock) data.stock = parseInt(data.stock, 10);
      if (data.is_active !== undefined) {
        data.is_active = data.is_active === "true" || data.is_active === true;
      }
      memoryDB.products[idx] = { ...memoryDB.products[idx], ...data, updatedAt: new Date().toISOString() };
      saveData();
      return memoryDB.products[idx];
    }
    return null;
  },
  deleteProduct: (id) => {
    const idx = memoryDB.products.findIndex((p) => p.id === id || p._id === id);
    if (idx !== -1) {
      memoryDB.products[idx].is_deleted = true;
      saveData();
      return memoryDB.products[idx];
    }
    return null;
  },

  getStats: () => {
    const prods = memoryDB.products;
    return {
      total_products: prods.filter((p) => !p.is_deleted).length,
      active_products: prods.filter((p) => !p.is_deleted && p.is_active).length,
      inactive_products: prods.filter((p) => !p.is_deleted && !p.is_active).length,
      deleted_products: prods.filter((p) => p.is_deleted).length,
      total_categories: memoryDB.categories.filter((c) => !c.is_deleted).length,
    };
  },
};

