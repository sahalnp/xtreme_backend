import mongoose from "mongoose";
import dotenv from "dotenv";
import { User } from "./models/User.js";
import { Category } from "./models/Category.js";
import { Product } from "./models/Product.js";
import { hashPassword } from "./utils/Password.js";

dotenv.config();

const uri = process.env.MONGODB_URI || "mongodb+srv://muhdsahal87_db_user:Nq0TlD9cymy8FefU@cluster0.iq3tsa0.mongodb.net/xtreme_shoe_store?retryWrites=true&w=majority";

async function seedDatabase() {
  console.log("Connecting to MongoDB Atlas for seeding...");
  await mongoose.connect(uri);
  console.log("Connected successfully!");

  // 1. Seed Admin User
  const existingAdmin = await User.findOne({ username: "admin" });
  if (!existingAdmin) {
    const hashedPassword = await hashPassword("admin123");
    await User.create({
      username: "admin",
      password: hashedPassword,
      email: "admin@xtremeshoes.com",
      role: "admin",
    });
    console.log("✔ Admin user created: admin / admin123");
  } else {
    console.log("✔ Admin user already exists");
  }

  // 2. Seed Categories
  const categoryData = [
    { name: "Sneakers", description: "Streetwear lifestyle kicks and contemporary drops" },
    { name: "Basketball", description: "High-top court shoes with dynamic traction" },
    { name: "Running", description: "Ultralight marathon and daily responsive runners" },
    { name: "Casual & Loafers", description: "Everyday lifestyle comfort shoes" },
    { name: "Outdoor & Trail", description: "All-terrain rugged grip waterproof shoes" },
  ];

  const catMap = {};
  for (const cat of categoryData) {
    let doc = await Category.findOne({ name: cat.name });
    if (!doc) {
      doc = await Category.create({ ...cat, is_active: true, is_deleted: false });
      console.log(`✔ Created category: ${cat.name}`);
    }
    catMap[cat.name] = doc._id;
  }

  // 3. Seed Products with real HD sneaker photos
  const mockProducts = [
    {
      name: "Air Jordan Retro 1 High",
      category: catMap["Basketball"],
      price: 199.99,
      color: "Chicago Red / White / Black",
      size: "UK 8, UK 9, UK 10, UK 11, UK 12",
      stock: 15,
      description: "Iconic collector silhouette engineered with genuine leather and court-ready Nike Air cushioning.",
      image: "https://images.unsplash.com/photo-1552346154-21d32810aba3?auto=format&fit=crop&w=800&q=80",
      is_active: true,
      is_deleted: false,
    },
    {
      name: "Nike Air Max Pulse",
      category: catMap["Sneakers"],
      price: 139.99,
      color: "Sport Red / Black / White",
      size: "UK 7, UK 8, UK 9, UK 10, UK 11",
      stock: 25,
      description: "Point-loaded Air unit engineered for supreme bounce and high-energy rebound.",
      image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=80",
      is_active: true,
      is_deleted: false,
    },
    {
      name: "Adidas Ultraboost Light",
      category: catMap["Running"],
      price: 189.99,
      color: "Core Black / Cloud White",
      size: "UK 7, UK 8, UK 9, UK 10",
      stock: 20,
      description: "Ultralight BOOST foam providing continuous propulsion through every mile.",
      image: "https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?auto=format&fit=crop&w=800&q=80",
      is_active: true,
      is_deleted: false,
    },
    {
      name: "New Balance 9060 Chunky",
      category: catMap["Sneakers"],
      price: 159.99,
      color: "Rain Cloud / Castlerock Grey",
      size: "UK 7, UK 8, UK 9, UK 10, UK 11",
      stock: 18,
      description: "Exaggerated Y2K aesthetic with sculpted dual-density ABZORB and SBS cushioning.",
      image: "https://images.unsplash.com/photo-1539185441755-769473a23570?auto=format&fit=crop&w=800&q=80",
      is_active: true,
      is_deleted: false,
    },
    {
      name: "Puma Velocity Nitro 3",
      category: catMap["Running"],
      price: 129.99,
      color: "Electric Lime / Puma Black",
      size: "UK 7, UK 8, UK 9, UK 10",
      stock: 30,
      description: "Explosive energy return powered by advanced NITRO foam and PUMAGRIP rubber.",
      image: "https://images.unsplash.com/photo-1608231387042-66d1773070a5?auto=format&fit=crop&w=800&q=80",
      is_active: true,
      is_deleted: false,
    },
    {
      name: "Salomon XT-6 Gore-Tex",
      category: catMap["Outdoor & Trail"],
      price: 210.00,
      color: "Phantom / Black / Dark Grey",
      size: "UK 8, UK 9, UK 10, UK 11",
      stock: 12,
      description: "Waterproof trail running icon featuring ACS chassis technology and Quicklace system.",
      image: "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?auto=format&fit=crop&w=800&q=80",
      is_active: true,
      is_deleted: false,
    },
    {
      name: "Nike Dunk Low Retro Panda",
      category: catMap["Sneakers"],
      price: 115.00,
      color: "White / Black",
      size: "UK 7, UK 8, UK 9, UK 10, UK 11",
      stock: 22,
      description: "Timeless 80s hoops icon built with crisp leather overlays and padded collar.",
      image: "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&w=800&q=80",
      is_active: true,
      is_deleted: false,
    },
    {
      name: "Adidas Forum Bold Classic",
      category: catMap["Casual & Loafers"],
      price: 110.00,
      color: "Cloud White / Core White",
      size: "UK 6, UK 7, UK 8, UK 9, UK 10",
      stock: 16,
      description: "Elevated platform court shoe highlighting heritage B-ball design and plush collar.",
      image: "https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?auto=format&fit=crop&w=800&q=80",
      is_active: true,
      is_deleted: false,
    }
  ];

  // Clear existing mock products if they had missing images or update them
  await Product.deleteMany({});
  for (const p of mockProducts) {
    await Product.create(p);
    console.log(`✔ Created product in Atlas: ${p.name}`);
  }

  console.log("\x1b[32m✔ MongoDB Atlas Seeding Finished Successfully!\x1b[0m");
  process.exit(0);
}

seedDatabase().catch((err) => {
  console.error("Seeding error:", err);
  process.exit(1);
});

