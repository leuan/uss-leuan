const router = require("express").Router();
const codeqlRoutes = require("./codeql");
const zapRoutes = require("./zap");
const dcRoutes = require("./dc");

router.use("/zap", zapRoutes);
router.use("/codeql", codeqlRoutes);
router.use("/dc", dcRoutes);

module.exports = router;
