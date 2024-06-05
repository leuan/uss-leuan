const express = require("express");
const loggingConfig = require("./config/logging");
const log = require("pino")(loggingConfig);
const db = require("./config/db");
const errorHandler = require("./middleware/errorHandler");
const router = require("./routes/index");
const verifyToken = require("./middleware/keycloak");

const app = express();
const port = 8080;

//init function
const init = async () => {
  await db.connect();
};

//pre middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(verifyToken);
//router
app.use(router);

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
