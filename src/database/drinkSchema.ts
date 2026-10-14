import mongoose, { Schema } from "mongoose";

const SizeOptionSchema = new Schema(
  {
    size: { type: String, required: true, enum: ["Small", "Medium", "Large"] },
    price: { type: Number, required: true, min: 0.01 },
  },
  { _id: false },
);

const DrinkSchema = new Schema({
  name: { type: String, required: true, unique: true, trim: true },
  description: { type: String, required: true },
  category: { type: String, required: true, enum: ["Coffee", "Tea"] },
  sizes: {
    type: [SizeOptionSchema],
    validate: {
      validator: (sizes: unknown[]) => sizes.length > 0,
      message: "A drink needs at least one size",
    },
  },
  milkOptions: { type: [String], default: [] },
  imageUrl: { type: String, required: true },
  isBestseller: { type: Boolean, default: false },
});

export default mongoose.models.Drink || mongoose.model("Drink", DrinkSchema);
