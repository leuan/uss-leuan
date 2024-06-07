const loggingConfig = require("../config/logging");
const log = require("pino")(loggingConfig);
const projectService = require("../services/project.service");
const objIdValidator = require("../utils/objectIdValidator.utils");

const publicMethods = {
  getProjects: async (req, res, next) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const name = req.query.name || "";

    try {
      const response = await projectService.getWithPagination(
        page,
        limit,
        name
      );
      return res.status(200).json(response);
    } catch (e) {
      next(e);
    }
  },

  postProject: async (req, res, next) => {
    const { name, zapUrl } = req.body;
    try {
      new URL(zapUrl);
    } catch (_) {
      const err = new Error("Invalid url");
      err.statusCode = 400;
      return next(err);
    }

    if (!name) {
      const err = new Error("Invalid or missing name");
      err.statusCode = 400;
      return next(err);
    }
    try {
      const projectId = await projectService.create({ name, zapUrl }, req.user);
      return res.status(200).json({ projectId });
    } catch (e) {
      next(e);
    }
  },

  getProjectById: async (req, res, next) => {
    const { projectId } = req.params;

    log.info(projectId);
    let objId;
    try {
      objId = objIdValidator(projectId);
    } catch (e) {
      next(e);
    }

    try {
      const project = await projectService.getById(objId);
      return res.status(200).json({
        result: project,
      });
    } catch (e) {
      next(e);
    }
  },
};

module.exports = { ...publicMethods };
