/**
 * Database helpers for integration tests
 * 
 * Provides utilities for setting up and tearing down
 * MongoDB Memory Server for integration testing
 */

import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';

let mongoServer: MongoMemoryServer | null = null;

/**
 * Connect to in-memory MongoDB instance
 */
export async function connectDB() {
  // Close any existing connection
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }

  // Create and start memory server
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();

  // Connect mongoose
  await mongoose.connect(mongoUri);
}

/**
 * Disconnect and stop in-memory MongoDB instance
 */
export async function disconnectDB() {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }

  if (mongoServer) {
    await mongoServer.stop();
    mongoServer = null;
  }
}

/**
 * Clear all collections in the database
 */
export async function clearDB() {
  if (mongoose.connection.readyState === 0) {
    throw new Error('Database not connected');
  }

  const collections = mongoose.connection.collections;

  for (const key in collections) {
    const collection = collections[key];
    await collection.deleteMany({});
  }
}

/**
 * Drop the entire database
 */
export async function dropDB() {
  if (mongoose.connection.readyState === 0) {
    throw new Error('Database not connected');
  }

  await mongoose.connection.dropDatabase();
}
