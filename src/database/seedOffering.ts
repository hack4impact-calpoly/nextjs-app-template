import connectDB from "@/database/db";
import OfferingModel from "@/database/offeringModel";
import { OfferingList } from "@/database/offering";

/** Deliberate starting-data import, never a runtime fallback or automatic startup action. */
export async function seedOfferings(): Promise<number> {
  await connectDB();
  await OfferingModel.init();
  const operations = OfferingList.map(({ ID, ...details }) => {
    const seedKey = `coffee-shop-v1-${ID}`;
    return {
      updateOne: {
        filter: { seedKey },
        update: { $setOnInsert: { ...details, seedKey } },
        upsert: true,
      },
    };
  });
  const result = await OfferingModel.bulkWrite(operations);
  return result.upsertedCount;
}
