const express = require("express");
const loggingConfig = require("./config/logging");
const log = require("pino")(loggingConfig);
const db = require("./config/db");

const app = express();
const port = 8080;

const init = async () => {
  await db.connect();
};

app.get("/api", async (req, res) => {
  const projectsCollection = await db.Projects.getCollection();
  await projectsCollection.insertOne({ test: "test" });
  res.send("Hello World!");
});

init();
app.listen(port, () => {
  log.info(`Server is running on port ${port}`);
});

process.on("SIGINT", async () => {
  await db.shutdown();
  process.exit(0);
});

process.on("SIGTERM", async () => {
  await db.shutdown();
  process.exit(0);
});
