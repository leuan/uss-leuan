const loggingConfig = require("../config/logging");
const log = require("pino")(loggingConfig);
const zapService = require("../services/zap.service");
const objIdValidator = require("../utils/objectIdValidator.utils");
const codeqlService = require("../services/codeql.service");

const publicMethods = {
  getZapSpiderScan: async (req, res, next) => {
    const { projectId } = req.params;
    let objId;
    try {
      objId = objIdValidator(projectId);
    } catch (e) {
      next(e);
    }

    try {
      const results = await zapService.getSpiderScan(objId);
      return res.status(200).json(results);
    } catch (e) {
      next(e);
    }
  },

  postZapSpiderScan: async (req, res, next) => {
    const { projectId, spiderType } = req.body;

    if (spiderType !== "crawler" && spiderType !== "ajaxSpider") {
      const e = new Error("Invalid spider type");
      e.statusCode("401");
      next(e);
    }

    let objId;
    try {
      objId = objIdValidator(projectId);
    } catch (e) {
      next(e);
    }

    try {
      const scanId = await zapService.runSpiderScan(objId, spiderType);
      return res.status(200).json({ scanId: scanId });
    } catch (e) {
      next(e);
    }
  },

  getZapActiveScan: async (req, res, next) => {
    const { projectId } = req.params;
    let objId;
    try {
      objId = objIdValidator(projectId);
    } catch (e) {
      next(e);
    }

    try {
      const results = await zapService.getActiveScan(objId);
      return res.status(200).json(results);
    } catch (e) {
      next(e);
    }
  },

  postZapActiveScan: async (req, res, next) => {
    const { projectId } = req.body;

    let objId;
    try {
      objId = objIdValidator(projectId);
    } catch (e) {
      next(e);
    }

    try {
      const scanId = await zapService.runActiveScan(objId);
      return res.status(200).json({ scanId: scanId });
    } catch (e) {
      next(e);
    }
  },

  postCodeqlImport: async (req, res, next) => {
    const { projectId } = req.body;

    let objId;
    try {
      objId = objIdValidator(projectId);
    } catch (e) {
      next(e);
    }

    try {
      await codeqlService.import(objId);
      return res.status(200).json({ message: "Imported successfully!" });
    } catch (e) {
      next(e);
    }
  },

  getCodeqlAlerts: async (req, res, next) => {
    const { projectId } = req.params;
    let objId;
    try {
      objId = objIdValidator(projectId);
    } catch (e) {
      next(e);
    }

    try {
      const alerts = await codeqlService.getAlerts(objId);
      return res.status(200).json({ results: alerts });
    } catch (e) {
      next(e);
    }
  },
};

module.exports = { ...publicMethods };
