const loggingConfig = require("./../config/logging");
const log = require("pino")(loggingConfig);

const handleError = (error, req, res, next) => {
  error.statusCode = error.statusCode || 500;
  error.status = error.status || "error";
  error.message = error.message || "Unknown Error";
  log.error(error);
  res
    .status(error.statusCode)
    .json({ status: error.status, message: error.message });
};

module.exports = handleError;
