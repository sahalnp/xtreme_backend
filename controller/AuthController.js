import { User } from "../models/User.js";
import { localStore } from "../config/localStore.js";
import { comparePassword } from "../utils/Password.js";
import { generateToken } from "../utils/TokenGenerator.js";
import mongoose from "mongoose";

export const loginAdmin = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: "Please provide both username and password" });
    }

    let user;
    if (mongoose.connection.readyState === 1) {
      user = await User.findOne({ username: username.trim() });
    } else {
      user = localStore.findUserByUsername(username.trim());
    }

    if (!user) {
      return res.status(401).json({ error: "Invalid admin credentials" });
    }

    const isMatch = await comparePassword(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: "Invalid admin credentials" });
    }

    const token = generateToken({
      id: user.id || user._id,
      username: user.username,
      role: user.role || "admin",
    });

    return res.status(200).json({
      success: true,
      message: "Login successful",
      user: {
        id: user.id || user._id,
        username: user.username,
        email: user.email || "admin@xtremeshoes.com",
        role: user.role || "admin",
      },
      token,
    });
  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).json({ error: "Internal server error during login" });
  }
};

