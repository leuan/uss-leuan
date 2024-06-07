const router = require("express").Router();
const testRoutes = require("./test/index");
const projectRoutes = require("./projects/index");
const scanRoutes = require("./scans/index");

router.use("/projects", projectRoutes);
router.use("/test", testRoutes);
router.use("/scans", scanRoutes);

module.exports = router;
