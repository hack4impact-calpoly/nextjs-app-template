import connectDB from "@/database/db";
import OfferingModel, { type OfferingRecord } from "@/database/offeringModel";
import { sortOfferings } from "@/lib/offerings";
import type { CreateOfferingInput, Offering } from "@/types/offering";
import type { OfferingStore } from "@/server/offering-handlers";

function publicOffering(record: OfferingRecord): Offering {
  return {
    ID: record._id.toString(),
    name: record.name,
    description: record.description,
    price: record.price,
    category: record.category,
    specialOffer: record.specialOffer,
  };
}

/** Real storage boundary supplied to the separately developed request handlers. */
export const offeringStore: OfferingStore = {
  async list(): Promise<Offering[]> {
    await connectDB();
    return sortOfferings((await OfferingModel.find().lean()).map(publicOffering));
  },
  async create(input: CreateOfferingInput): Promise<Offering> {
    await connectDB();
    const { name, description, price, category, specialOffer } = input;
    return publicOffering(await OfferingModel.create({ name, description, price, category, specialOffer }));
  },
  async update(id, input) {
    await connectDB();
    const record = await OfferingModel.findByIdAndUpdate(
      id,
      { $set: { ...input, specialOffer: input.specialOffer ?? false } },
      { new: true, runValidators: true },
    );
    return record ? publicOffering(record) : null;
  },
  async remove(id) {
    await connectDB();
    return (await OfferingModel.deleteOne({ _id: id })).deletedCount === 1;
  },
};
