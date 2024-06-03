const router = require("express").Router();
const zapRoutes = require("./zap.js");

router.use("/zap", zapRoutes);

module.exports = router;
