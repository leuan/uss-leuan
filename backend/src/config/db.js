const { MongoClient } = require("mongodb");
const loggingConfig = require("./logging");
const log = require("pino")(loggingConfig);

const privateMethods = {
  getConnectionString: () => {
    if (process.env.NODE_ENV === "production" && !process.env.MONGO_URI) {
      log.error("MONGO_URI environment variable is not set!");
      return;
    }

    if (process.env.NODE_ENV === "production" && process.env.MONGO_URI) {
      return process.env.MONGO_URI;
    }

    return "mongodb://localhost:27017";
  },
};

const client = new MongoClient(privateMethods.getConnectionString(), {
  minPoolSize: 2,
  maxPoolSize: 10,
});

let db;

const collections = {
  Projects: {
    getCollection: () => {
      return db.collection("projects");
    },
  },
};

const publicMethods = {
  connect: async () => {
    const connectionString = privateMethods.getConnectionString();

    if (!db) {
      log.info("Initializing MongoDB client");

      try {
        await client.connect();
        db = client.db("uss-db");
      } catch (e) {
        log.error(`DB connect error ${e}`);
      } finally {
        return db;
      }
    }
  },
  shutdown: async () => {
    if (client && client.isConnected()) {
      try {
        await client.close();
      } catch (e) {
        log.error(`DB disconnect error: ${e}`);
      }
    }
  },
};

module.exports = { ...publicMethods, ...collections };
