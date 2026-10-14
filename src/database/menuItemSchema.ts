import mongoose, { Schema, type InferSchemaType } from "mongoose";

const MenuItemSchema = new Schema({
  name: { type: String, required: true, unique: true },
  price: { type: Number, required: true, min: 0 },
  description: { type: String },
});

export type MenuItemType = InferSchemaType<typeof MenuItemSchema>;

export default mongoose.models.MenuItem || mongoose.model("MenuItem", MenuItemSchema);
