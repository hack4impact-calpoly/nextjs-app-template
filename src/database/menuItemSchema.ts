import mongoose, { Model, Schema } from "mongoose";
import type { MenuItem } from "@/types/menuItem";

type MenuItemRecord = Omit<MenuItem, "id"> & { id?: string };

const menuItemSchema = new Schema<MenuItemRecord>({
  id: { type: String },
  name: { type: String, required: true },
  price: { type: Number, required: true, min: 0 },
  description: { type: String, required: true },
});

const MenuItemModel =
  (mongoose.models.MenuItem as Model<MenuItemRecord> | undefined) ||
  mongoose.model<MenuItemRecord>("MenuItem", menuItemSchema, "menuitems");

export default MenuItemModel;
