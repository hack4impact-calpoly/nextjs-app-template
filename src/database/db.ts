import mongoose from "mongoose";

// Share an in-flight connection across requests and development hot reloads.
const globalForMongo = globalThis as typeof globalThis & {
  mongoConnection?: Promise<typeof mongoose>;
};

/**
 * Makes a connection to a MongoDB database. If a connection already exists, does nothing
 * Call this function before all api routes
 * @returns {Promise<typeof mongoose>}
 */
const connectDB = async () => {
  const url = process.env.MONGO_URI;
  if (!url) {
    throw new Error("MONGO_URI is not configured");
  }

  if (!globalForMongo.mongoConnection) {
    globalForMongo.mongoConnection = mongoose.connect(url, { serverSelectionTimeoutMS: 5000 }).catch((error) => {
      // A failed attempt must not prevent a later request from reconnecting.
      globalForMongo.mongoConnection = undefined;
      throw error;
    });
  }

  return globalForMongo.mongoConnection;
};

export default connectDB;
