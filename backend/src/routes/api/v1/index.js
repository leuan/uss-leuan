const router = require("express").Router();
const testRoutes = require("./test/index");
const projectRoutes = require("./projects/index");

router.use("/projects", projectRoutes);
router.use("/test", testRoutes);

module.exports = router;
