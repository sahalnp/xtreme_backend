import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import morgan from "morgan";
import path from "path";
import { fileURLToPath } from "url";

import { connectDB } from "./config/db.js";
import authRouter from "./routers/AuthRouter.js";
import categoryRouter from "./routers/CategoryRouter.js";
import brandRouter from "./routers/BrandRouter.js";
import productRouter from "./routers/ProductRouter.js";
import statsRouter from "./routers/StatsRouter.js";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 8000;

// Connect Database (MongoDB)
connectDB();

// Middleware
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static uploads & media directory
app.use("/uploads", express.static(path.join(__dirname, "public/uploads")));
app.use("/media", express.static(path.join(__dirname, "public/uploads")));

// API Routes (matching structure)
app.use("/api/auth", authRouter);
app.use("/api/categories", categoryRouter);
app.use("/api/brands", brandRouter);
app.use("/api/products", productRouter);
app.use("/api/stats", statsRouter);

// Root health check endpoint
app.get("/", (req, res) => {
  res.json({
    status: "online",
    message: "XTREME Shoe Store Backend (Node.js, Express & MongoDB)",
    timestamp: new Date().toISOString(),
  });
});

// Start Server
app.listen(PORT, "0.0.0.0", () => {
  console.log(`\x1b[32m✔ Server running on http://0.0.0.0:${PORT}\x1b[0m`);
  console.log(`\x1b[36m✔ API endpoints available at http://localhost:${PORT}/api/\x1b[0m`);
});

