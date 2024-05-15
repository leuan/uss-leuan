const express = require("express");
const loggingConfig = require("./config/logging");
const log = require("pino")(loggingConfig);
const db = require("./config/db");
const errorHandler = require("./middleware/errorHandler");

const app = express();
const port = 8080;

//init function
const init = async () => {
  await db.connect();
};

//routes
app.get("/api", async (req, res, next) => {
  const projectsCollection = await db.Projects.getCollection();
  await projectsCollection.insertOne({ test: "test" });
  let err = new Error("test");
  err.statusCode = 403;
  err.status = "forbidden";
  next(err);
});

//post middlewares
app.use(errorHandler);

init();

//start server
app.listen(port, () => {
  log.info(`Server is running on port ${port}`);
});

//shutdown handling
process.on("SIGINT", async () => {
  await db.shutdown();
  process.exit(0);
});

process.on("SIGTERM", async () => {
  await db.shutdown();
  process.exit(0);
});
