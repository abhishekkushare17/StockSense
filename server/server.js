const app = require('./app');
const env = require('./config/env');
const connectDB = require('./config/db');

const startServer = async () => {
  // Connect to Database
  await connectDB();

  // Start HTTP Server
  const server = app.listen(env.port, () => {
    console.log(`===============================================`);
    console.log(`  StockSense API Server Running               `);
    console.log(`  Environment: ${env.nodeEnv}                 `);
    console.log(`  Port:        ${env.port}                    `);
    console.log(`  Base URL:    http://localhost:${env.port}   `);
    console.log(`===============================================`);
  });

  // Handle Unhandled Promise Rejections
  process.on('unhandledRejection', (err) => {
    console.error(`[Unhandled Rejection] ${err.message}`);
    server.close(() => process.exit(1));
  });
};

startServer();
