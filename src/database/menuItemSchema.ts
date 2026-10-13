import mongoose, { Schema } from "mongoose";
import { CATEGORIES } from "@/lib/validateMenuItem";

const MenuItemSchema = new Schema({
  name: { type: String, required: true, unique: true, trim: true },
  description: { type: String, required: true, trim: true },
  price: { type: Number, required: true, min: [0.01, "Price must be greater than 0."] },
  category: { type: String, required: true, enum: [...CATEGORIES] },
  available: { type: Boolean, required: true },
  imageUrl: { type: String, required: false, trim: true },
});

export default mongoose.models.MenuItem || mongoose.model("MenuItem", MenuItemSchema, "items");
