import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      default: "admin@xtremeshoes.com",
    },
    role: {
      type: String,
      enum: ["admin", "staff"],
      default: "admin",
    },
  },
  {
    timestamps: true,
  }
);

UserSchema.set("toJSON", {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString();
    delete returnedObject.password;
    delete returnedObject.__v;
  },
});

export const User = mongoose.model("User", UserSchema);

