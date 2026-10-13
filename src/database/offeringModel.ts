import mongoose, { Schema, type Model, type Types } from "mongoose";
import { DEFAULT_SPECIAL_OFFER, OFFERING_CATEGORIES, OFFERING_INPUT_LIMITS, type Offering } from "@/types/offering";

export type OfferingRecord = Omit<Offering, "ID"> & { _id: Types.ObjectId; seedKey?: string };

const offeringSchema = new Schema<OfferingRecord>({
  name: { type: String, required: true, trim: true, maxlength: OFFERING_INPUT_LIMITS.name },
  description: { type: String, required: true, trim: true, maxlength: OFFERING_INPUT_LIMITS.description },
  price: {
    type: Number,
    required: true,
    min: 0,
    validate: {
      validator: (value: number) => {
        const cents = value * 10 ** OFFERING_INPUT_LIMITS.priceDecimalPlaces;
        return Number.isFinite(value) && Math.abs(cents - Math.round(cents)) <= 1e-8;
      },
      message: "Price must be finite and have at most two decimal places.",
    },
  },
  category: { type: String, required: true, enum: OFFERING_CATEGORIES },
  specialOffer: { type: Boolean, required: true, default: DEFAULT_SPECIAL_OFFER },
  seedKey: { type: String, immutable: true },
});

// Unseeded offerings may share names and have no seedKey. Only seed identities are unique.
offeringSchema.index({ seedKey: 1 }, { unique: true, partialFilterExpression: { seedKey: { $type: "string" } } });

const OfferingModel =
  (mongoose.models.Offering as Model<OfferingRecord> | undefined) ??
  mongoose.model<OfferingRecord>("Offering", offeringSchema);

export default OfferingModel;
