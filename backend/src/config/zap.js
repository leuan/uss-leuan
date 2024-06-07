const config = {
  apiConfig: {
    apiKey: process.env.ZAP_API_KEY,
    proxy: {
      host: process.env.ZAP_HOST,
      port: process.env.ZAP_PORT,
    },
  },
  spiderConfig: {
    maxChilden: 5,
    recurse: true,
    subtreeOnly: false,
  },
  ajaxSpiderConfig: {
    inScope: false,
    subtreeOnly: true,
  },
};

module.exports = config;
