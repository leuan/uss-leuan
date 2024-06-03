const router = require("express").Router();
const zapTestRoutes = require("../../../../controllers/zap.controller");

router.get("/", zapTestRoutes.getScanStatus);
router.post("/", zapTestRoutes.postStartScan)

module.exports = router;
