const loggingConfig = require("../config/logging");
const log = require("pino")(loggingConfig);
const DB = require("../config/db");
const { ObjectId } = require("bson");

const publicMethods = {
  getProjects: async (req, res, next) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const name = req.query.name || "";

    //no of items to skip
    const skip = (page - 1) * limit;

    const query = name ? { name: { $regex: name, $options: "i" } } : {};

    try {
      const projectsDB = DB.Projects.getCollection();
      const totalItems = await projectsDB.countDocuments(query);
      const items = await projectsDB
        .find(query)
        .skip(skip)
        .limit(limit)
        .toArray();
      return res.status(200).json({
        results: items,
        total: totalItems,
        page,
        limit,
        totalPages: Math.ceil(totalItems / limit),
      });
    } catch (e) {
      e.status = "DB Error";
      next(e);
    }
  },

  postProject: async (req, res, next) => {
    const { name, zapUrl } = req.body;
    try {
      new URL(zapUrl);
    } catch (_) {
      const err = new Error("Invalid url");
      err.statusCode = 400;
      return next(err);
    }

    const projectToSave = {
      name,
      zapUrl,
      createdAt: new Date().toISOString(),
    };

    try {
      const projectsDB = DB.Projects.getCollection();
      const projectId = (await projectsDB.insertOne(projectToSave)).insertedId;
      return res.status(200).json({ projectId });
    } catch (e) {
      e.status = "DB Error";
      next(e);
    }
  },

  getProjectById: async (req, res, next) => {
    const { projectId } = req.params;

    log.info(projectId);
    let objId;
    try {
      objId = ObjectId.createFromHexString(projectId);
    } catch (e) {
      log.error(e);
      return res.status(200).json({ result: null });
    }

    try {
      const projectsDB = DB.Projects.getCollection();
      const project = await projectsDB.findOne({ _id: objId });
      return res.status(200).json({
        result: project,
      });
    } catch (e) {
      e.status = "DB Error";
      next(e);
    }
  },
};

module.exports = { ...publicMethods };
