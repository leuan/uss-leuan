const router = require("express").Router();
const testController = require("../../../controllers/test.controller")

router.get('/test', testController.testGet)

module.exports = router;
