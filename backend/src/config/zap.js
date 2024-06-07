const config = {
  apiConfig: {
    apiKey: process.env.ZAP_API_KEY,
    proxy: {
      host: process.env.ZAP_HOST,
      port: process.env.ZAP_PORT,
    },
  },
  spiderConfig: {
    maxchilden: 5,
    recurse: true,
    subtreeonly: false,
  },
  ajaxSpiderConfig: {
    inscope: false,
    subtreeonly: true,
  },
  activeScanConfig: {
    recurse: true,
    inScopeonly: true,
  }
};

module.exports = config;
