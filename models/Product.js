import mongoose from "mongoose";

const ProductSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: "",
    },
    price: {
      type: Number,
      required: false,
      default: 0,
      min: 0,
    },
    min_price: {
      type: Number,
      default: 0,
      min: 0,
    },
    max_price: {
      type: Number,
      default: 0,
      min: 0,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    brand: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Brand",
      default: null,
    },
    image: {
      type: String,
      default: "",
    },
    image2: {
      type: String,
      default: "",
    },
    image3: {
      type: String,
      default: "",
    },
    image4: {
      type: String,
      default: "",
    },
    size: {
      type: String,
      default: "UK 7, UK 8, UK 9, UK 10",
    },
    color: {
      type: String,
      default: "Black",
    },
    stock: {
      type: Number,
      default: 15,
    },
    is_active: {
      type: Boolean,
      default: true,
    },
    is_deleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

ProductSchema.set("toJSON", {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString();
    if (returnedObject.category && typeof returnedObject.category === "object") {
      returnedObject.category_name = returnedObject.category.name;
      returnedObject.category = returnedObject.category._id ? returnedObject.category._id.toString() : returnedObject.category;
    }
    if (returnedObject.brand && typeof returnedObject.brand === "object") {
      returnedObject.brand_name = returnedObject.brand.name;
      returnedObject.brand = returnedObject.brand._id ? returnedObject.brand._id.toString() : returnedObject.brand;
    }
    delete returnedObject.__v;
  },
});

export const Product = mongoose.model("Product", ProductSchema);
