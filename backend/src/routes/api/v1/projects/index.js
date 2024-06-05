const router = require("express").Router();
const projectController = require("../../../../controllers/project.controller");

router.get("/", projectController.getProjects);
router.get("/:projectId", projectController.getProjectById);
router.post("/", projectController.postProject);

module.exports = router;
