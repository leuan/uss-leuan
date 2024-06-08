const router = require("express").Router();
const scanController = require("../../../../controllers/scan.controller");

router.get("/:projectId", scanController.getDCDependencies);
router.post("/", scanController.postDCImport);

module.exports = router;
