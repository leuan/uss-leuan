const router = require("express").Router();
const zapRoutes = require("./zap");

router.use("/zap", zapRoutes);

module.exports = router;
