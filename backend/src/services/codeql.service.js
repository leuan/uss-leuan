const loggingConfig = require("../config/logging");
const log = require("pino")(loggingConfig);
const DB = require("../config/db");
const codeqlParser = require("../utils/codeqlParser");
const path = require("path");
const projectService = require("./project.service");

const publicMethods = {
  import: async (projectId) => {
    const project = await projectService.getById(projectId);

    const results = await codeqlParser(
      `/app/codeql-output/${project.scanFileName}.sarif`
    );

    const reportToSave = {
      alerts: results,
      importDate: new Date().toISOString(),
      projectId: project._id,
    };

    try {
      await projectService.updateById(projectId, {
        lastCodeqlImport: reportToSave.importDate,
      });
      const codeqlDB = await DB.CodeqlReports.getCollection();
      codeqlDB.insertOne(reportToSave);
    } catch (e) {
      e.statusCode = 500;
      throw e;
    }
  },

  getAlerts: async (projectId) => {
    try {
      const codeqlDB = await DB.CodeqlReports.getCollection();
      log.info(codeqlDB);
      const result = await codeqlDB.findOne(
        { projectId: projectId },
        { sort: { createdAt: -1 } }
      );

      return result.alerts;
    } catch (e) {
      e.statusCode = 500;
      throw e;
    }
  },
};

module.exports = { ...publicMethods };
