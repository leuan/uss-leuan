const router = require("express").Router();
const testRoutes = require("./test/index");

router.use("/test", testRoutes);

module.exports = router;
