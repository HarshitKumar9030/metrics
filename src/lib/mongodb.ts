import { MongoClient } from "mongodb";
import { env } from "@/lib/env";

type GlobalWithMongo = typeof globalThis & {
  __metricsMongoClient?: MongoClient;
  __metricsMongoClientPromise?: Promise<MongoClient>;
};

const globalForMongo = globalThis as GlobalWithMongo;

export const mongoClient =
  globalForMongo.__metricsMongoClient ??
  new MongoClient(env.MONGODB_URI, {
    maxPoolSize: 15,
  });

const mongoClientPromise = globalForMongo.__metricsMongoClientPromise ?? mongoClient.connect();

if (process.env.NODE_ENV !== "production") {
  globalForMongo.__metricsMongoClient = mongoClient;
  globalForMongo.__metricsMongoClientPromise = mongoClientPromise;
}

export async function getDb() {
  await mongoClientPromise;
  return mongoClient.db(env.MONGODB_DB);
}
