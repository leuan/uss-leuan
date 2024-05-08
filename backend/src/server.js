const express = require("express");
const loggingConfig = require("./config/logging");
const log = require("pino")(loggingConfig);

const app = express();
const port = 8080;

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.listen(port, () => {
  log.info(`Server is running on port ${port}`);
});
