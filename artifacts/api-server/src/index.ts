import app from "./app";
import { logger } from "./lib/logger";
import { connectDB } from "@workspace/db";

const rawPort = process.env["PORT"];

if (!rawPort) {
  throw new Error(
    "PORT environment variable is required but was not provided.",
  );
}

const port = Number(rawPort);

if (Number.isNaN(port) || port <= 0) {
  throw new Error(`Invalid PORT value: "${rawPort}"`);
}

const startServer = async () => {
  try {
    await connectDB();
    logger.info("Connected to MongoDB");
    
    app.listen(port, () => {
      logger.info({ port }, "Server listening");
    });
  } catch (error) {
    logger.error({ error }, "Failed to start server");
    process.exit(1);
  }
};

startServer();
