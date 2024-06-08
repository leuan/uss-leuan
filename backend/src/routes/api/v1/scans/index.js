const router = require("express").Router();
const codeqlRoutes = require("./codeql");
const zapRoutes = require("./zap")

router.use("/zap", zapRoutes)
router.use("/codeql", codeqlRoutes);

module.exports = router;
