import jwt from "jsonwebtoken";

export const generateToken = (payload) => {
  return jwt.sign(
    payload,
    process.env.JWT_SECRET || "xtreme-super-secret-jwt-key-2026",
    { expiresIn: "7d" }
  );
};

export const verifyToken = (token) => {
  return jwt.verify(
    token,
    process.env.JWT_SECRET || "xtreme-super-secret-jwt-key-2026"
  );
};

