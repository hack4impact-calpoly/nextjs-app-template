import mongoose, { Schema } from "mongoose";

const ReviewSchema = new Schema({
  username: {
    type: String,
    minLength: 3,
    required: true,
  },
  description: {
    type: String,
    maxLength: 50,
    required: true,
    trim: true,
  },
  rating: { type: Number, required: true, min: 1, max: 5 },
});

export default mongoose.models.Review || mongoose.model("Review", ReviewSchema);
