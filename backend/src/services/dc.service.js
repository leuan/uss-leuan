const loggingConfig = require("../config/logging");
const log = require("pino")(loggingConfig);
const DB = require("../config/db");
const dcParser = require("../utils/dc-parser.utils.js");
const path = require("path");
const projectService = require("./project.service");

const publicMethods = {
  import: async (projectId) => {
    const project = await projectService.getById(projectId);

    const results = await dcParser(
      `/app/dc-output/${project.scanFileName}.json`
    );

    const reportToSave = {
      dependencies: results,
      importDate: new Date().toISOString(),
      projectId: project._id,
    };

    try {
      await projectService.updateById(projectId, {
        lastDependencyCheckImport: reportToSave.importDate,
      });
      const dcDB = await DB.DependencyCheckReports.getCollection();
      dcDB.insertOne(reportToSave);
    } catch (e) {
      e.statusCode = 500;
      throw e;
    }
  },

  getDependencies: async (projectId) => {
    try {
      const dcDB = await DB.DependencyCheckReports.getCollection();
      const result = await dcDB.findOne(
        { projectId: projectId },
        { sort: { createdAt: -1 } }
      );

      return result.dependencies;
    } catch (e) {
      e.statusCode = 500;
      throw e;
    }
  },
};

module.exports = { ...publicMethods };
