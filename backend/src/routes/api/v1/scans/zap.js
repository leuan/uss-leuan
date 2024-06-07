const router = require("express").Router();
const scanController = require("../../../../controllers/scan.controller");

router.get("/spider/:projectId", scanController.getZapSpiderScan);
router.post("/spider", scanController.postZapSpiderScan);
router.get("/active/:projectId", scanController.getZapActiveScan);
router.post("/active", scanController.postZapActiveScan);

module.exports = router;
