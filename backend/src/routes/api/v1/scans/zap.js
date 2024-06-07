const router = require("express").Router();
const scanController = require("../../../../controllers/scan.controller");

router.get("/spider/:projectId", scanController.getZapSpiderScan);
router.post("/spider", scanController.postZapSpiderScan);

module.exports = router;
