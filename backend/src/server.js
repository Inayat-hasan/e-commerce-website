import app from "./app.js";
import { connectDB, disconnectDB } from "./db/index.js";
import { startAgenda, stopAgenda } from "./utils/agenda.js";

const port = process.env.PORT || 3000;
let server;

(async () => {
  try {
    await connectDB();
    await startAgenda();

    server = app.listen(port, () => {
      console.log(`Server is running at the port: ${port}`);
    });

    app.on("error", (error) => {
      console.log("App error: ", error);
      throw error;
    });
  } catch (error) {
    console.log("Error during startup:", error);
  }
})();

const gracefulShutdown = async () => {
  console.log("🔻 Graceful shutdown...");
  await stopAgenda();
  await disconnectDB();
  if (server) {
    server.close(() => {
      console.log("HTTP server closed.");
      process.exit(0);
    });
  } else {
    process.exit(0);
  }
};

process.on("SIGTERM", gracefulShutdown);

process.on("SIGINT", gracefulShutdown);

// ZJH6ZEZCMMGU7TJGNHSHE7EHGKA5XI2B
