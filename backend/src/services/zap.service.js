const loggingConfig = require("../config/logging");
const log = require("pino")(loggingConfig);
const DB = require("../config/db");
const { apiConfig, spiderConfig, ajaxSpiderConfig } = require("../config/zap");
const ZapClient = require("zaproxy");
const projectService = require("./project.service");

const publicMethods = {
  runSpiderScan: async (projectId, type = "crawler") => {
    const zap = new ZapClient(apiConfig);
    const project = await projectService.getById(projectId);
    let scanId;
    try {
      if (type === "crawler") {
        scanId = (
          await zap.spider.scan({ ...spiderConfig, url: project.zapUrl })
        )?.scan;
      } else {
        await zap.ajaxSpider.scan({
          ...ajaxSpiderConfig,
          url: project.zapUrl,
        });
        scanId = null;
      }
    } catch (e) {
      e.status = "Zap Spider Scan Error";
      throw e;
    }

    const updateValues = {
      zap: {
        lastSpiderScan: new Date().toISOString(),
        scanId: scanId,
        spiderType: type,
      },
    };

    await projectService.updateById(projectId, updateValues);

    return scanId;
  },

  getSpiderScan: async (projectId) => {
    const zap = new ZapClient(apiConfig);
    const project = await projectService.getById(projectId);

    if (!project.zap.scanId && project.zap.scanType === "crawler") {
      const e = new Error("No scan run yet");
      e.statusCode = 404;
      throw e;
    }

    try {
      let scanStatus;
      if (project.zap.spiderType === "crawler") {
        scanStatus = Number(
          (await zap.spider.status(project.zap.scanId)).status
        );
      } else {
        scanStatus = (await zap.ajaxSpider.status()).status;
      }

      if (scanStatus === 100 || scanStatus === "stopped") {
        let results;
        if (project.zap.spiderType === "crawler") {
          results = (await zap.spider.results(project.zap.scanId)).results;
        } else {
          results = null;
        }
        return { complete: true, results: results, status: scanStatus };
      }
      return { complete: false, status: scanStatus };
    } catch (e) {
      e.status = "Zap API Error";
      throw e;
    }
  },
};

module.exports = { ...publicMethods };
