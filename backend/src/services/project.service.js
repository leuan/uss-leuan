const loggingConfig = require("../config/logging");
const log = require("pino")(loggingConfig);
const DB = require("../config/db");
const { ObjectId } = require("bson");

const publicMethods = {
  getWithPagination: async (page, limit, name) => {
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

      return {
        results: items,
        total: totalItems,
        page,
        limit,
        totalPages: Math.ceil(totalItems / limit),
      };
    } catch (e) {
      e.status = "DB Error";
      throw e;
    }
  },

  create: async (
    data = {
      name: "",
      zapUrl: "",
    },
    user
  ) => {
    const projectToSave = {
      name: data.name,
      zapUrl: data.zapUrl,
      createdAt: new Date().toISOString(),
      user: user?.preferred_username,
    };

    try {
      const projectsDB = DB.Projects.getCollection();
      const projectId = (await projectsDB.insertOne(projectToSave)).insertedId;
      return projectId;
    } catch (e) {
      e.status = "DB Error";
      throw e;
    }
  },

  getById: async (id) => {
    try {
      const projectsDB = DB.Projects.getCollection();
      const project = await projectsDB.findOne({ _id: id });
      return project;
    } catch (e) {
      e.status = "DB Error";
      throw e;
    }
  },
};

module.exports = { ...publicMethods };