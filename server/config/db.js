const mongoose = require('mongoose');
const env = require('./env');

let memServer = null;

const connectDB = async () => {
  // If a real MongoDB URI is reachable, connect to it
  try {
    const conn = await mongoose.connect(env.mongoUri, {
      serverSelectionTimeoutMS: 2500 // Fast fail in dev if local mongod is not running
    });
    console.log(`[Database] MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    if (env.nodeEnv === 'development') {
      console.warn(`[Database] Could not connect to MongoDB at ${env.mongoUri} (${error.message}).`);
      console.log('[Database] Starting embedded in-memory MongoDB server for development...');
      try {
        const { MongoMemoryServer } = require('mongodb-memory-server');
        memServer = await MongoMemoryServer.create({
          instance: {
            dbName: 'stocksense'
          }
        });
        const inMemoryUri = memServer.getUri();
        console.log(`[Database] In-Memory MongoDB running at: ${inMemoryUri}`);
        const conn = await mongoose.connect(inMemoryUri);
        console.log(`[Database] Connected to In-Memory MongoDB successfully!`);

        // Automatically seed demo data
        try {
          const seedData = require('../scripts/seed');
          await seedData(false);
          console.log('[Database] Seeded demo users and inventory data successfully!');
        } catch (seedErr) {
          console.warn('[Database] Auto-seeding skipped or failed:', seedErr.message);
        }

        return conn;
      } catch (memErr) {
        console.error(`[Database Error] Failed to start in-memory MongoDB: ${memErr.message}`);
      }
    }

    if (process.env.NODE_ENV === 'production') {
      console.error(`[Database Error] Failed to connect to MongoDB in production: ${error.message}`);
      process.exit(1);
    }
  }
};

module.exports = connectDB;
