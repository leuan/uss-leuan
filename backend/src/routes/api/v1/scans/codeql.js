const router = require("express").Router();
const scanController = require("../../../../controllers/scan.controller");

router.get("/:projectId", scanController.getCodeqlAlerts);
router.post("/", scanController.postCodeqlImport);


module.exports = router;
