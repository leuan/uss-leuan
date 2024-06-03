const ZapClient = require("zaproxy");
const zapConfig = {
  apiKey: process.env.ZAP_API_KEY,
  proxy: {
    host: process.env.ZAP_HOST,
    port: process.env.ZAP_PORT,
  },
};
const zaproxy = new ZapClient(zapConfig);
const loggingConfig = require("../config/logging");
const log = require("pino")(loggingConfig);

const publicMethods = {
  getScanStatus: async (req, res) => {
    const { scanId } = req.query;
    const scanStatus = Number((await zaproxy.ajaxSpider.status(scanId)).status);
    if (scanStatus === 100) {
      const results = (await zaproxy.ajaxSpider.results).results;
      return res
        .status(200)
        .json({ complete: true, results: results, status: scanStatus });
    }
    return res.status(200).json({ complete: false, status: scanStatus });
  },

  postStartScan: async (req, res) => {
    const { targetUrl } = req.body;
    log.info("Target URL: " + targetUrl);

    const scanId = (await zaproxy.ajaxSpider.scan({ url: targetUrl })).scan;
    console.log(`Started scan with ID: ${scanId}`);

    return res.status(200).json({ scanId: scanId });
  },
};

module.exports = { ...publicMethods };
