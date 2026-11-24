import mongoose from "mongoose";

let isConnected = false;

export const connectDB = async () => {
  const uri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/xtreme_shoe_store";

  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 2500,
    });
    isConnected = true;
    console.log(`\x1b[32m✔ MongoDB connected successfully: ${conn.connection.host}/${conn.connection.name}\x1b[0m`);
    return true;
  } catch (error) {
    console.warn(`\x1b[33m⚠ Local MongoDB server not reachable at ${uri} (${error.message}).\x1b[0m`);
    console.log(`\x1b[36mℹ Initializing seamless Local Persistent DB fallback for standalone operation.\x1b[0m`);
    isConnected = false;
    return false;
  }
};

export const getDBStatus = () => isConnected;

