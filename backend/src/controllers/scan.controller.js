const loggingConfig = require("../config/logging");
const log = require("pino")(loggingConfig);
const zapService = require("../services/zap.service");
const objIdValidator = require("../utils/objectIdValidator.utils");

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
};

module.exports = { ...publicMethods };
