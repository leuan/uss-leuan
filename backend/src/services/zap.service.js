const loggingConfig = require("../config/logging");
const log = require("pino")(loggingConfig);
const DB = require("../config/db");
const {
  apiConfig,
  spiderConfig,
  ajaxSpiderConfig,
} = require("../config/zap");
const ZapClient = require("zaproxy");
const projectService = require("./project.service");
const { ObjectId } = require("bson");

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
        ...project.zap,
        lastSpiderScan: new Date().toISOString(),
        spiderScanId: scanId,
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
          (await zap.spider.status(project.zap.spiderScanId)).status
        );
      } else {
        scanStatus = (await zap.ajaxSpider.status()).status;
      }

      if (scanStatus === 100 || scanStatus === "stopped") {
        let results;
        if (project.zap.spiderType === "crawler") {
          results = (await zap.spider.results(project.zap.spiderScanId))
            .results;
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

  runActiveScan: async (projectId) => {
    const zap = new ZapClient(apiConfig);
    const project = await projectService.getById(projectId);
    let scanId;
    try {
      log.info(project.zapUrl);
      await zap.ascan.setOptionThreadPerHost({ integer: 2 });
      scanId = (await zap.ascan.scan({ url: project.zapUrl }))?.scan;
    } catch (e) {
      e.status = "Zap Active Scan Error";
      throw e;
    }

    const updateValues = {
      zap: {
        ...project.zap,
        lastActiveScan: new Date().toISOString(),
        activeScanFinished: false,
        activeScanId: scanId,
      },
    };

    await projectService.updateById(projectId, updateValues);

    return scanId;
  },

  getActiveScan: async (projectId) => {
    const zap = new ZapClient(apiConfig);
    const project = await projectService.getById(projectId);

    if (!project.zap.activeScanId) {
      const e = new Error("No scan run yet");
      e.statusCode = 404;
      throw e;
    }

    if (!project.zap.activeScanFinished) {
      try {
        let scanStatus;

        scanStatus = Number(
          (await zap.ascan.status(project.zap.activeScanId)).status
        );

        if (scanStatus === 100) {
          let results;
          results = await zap.core.alerts({ baseUrl: project.zapUrl });

          const alertsDB = DB.ZapAlerts.getCollection();
          alertsDB.insertOne({
            projectId: project._id,
            createdAt: new Date().toISOString(),
            alerts: results.alerts,
          });

          await projectService.updateById(projectId, {
            zap: {
              ...project.zap,
              activeScanFinished: true,
            },
          });

          return {
            complete: false,
            status: 99,
          };
        }
        return { complete: false, status: scanStatus };
      } catch (e) {
        e.status = "Zap API Error";
        throw e;
      }
    }

    try {
      const alertsDB = DB.ZapAlerts.getCollection();
      const alerts = await alertsDB.findOne(
        { projectId: project._id },
        { sort: { createdAt: -1 } }
      );
      return { complete: true, results: alerts.alerts, status: 100 };
    } catch (e) {
      e.status = "DB Error";
      throw e;
    }
  },
};

module.exports = { ...publicMethods };
