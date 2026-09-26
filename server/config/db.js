const mongoose = require('mongoose');
const env = require('./env');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(env.mongoUri);
    console.log(`[Database] MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`[Database Error] Failed to connect to MongoDB: ${error.message}`);
    // If running in development without local mongo instance running, log instructions
    if (env.nodeEnv === 'development') {
      console.warn('[Database] Note: Ensure MongoDB server is running on ' + env.mongoUri);
    }
    // Do not abruptly crash in development if other modules are being built, but throw for tests
    if (process.env.NODE_ENV === 'production') {
      process.exit(1);
    }
  }
};

module.exports = connectDB;
