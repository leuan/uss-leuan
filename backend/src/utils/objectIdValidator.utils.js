const { ObjectId } = require("bson");

const validate = (id = "") => {
  try {
    const objId = ObjectId.createFromHexString(id);
    return objId;
  } catch (e) {
    e.statusCode = 404;
    throw e;
  }
};

module.exports = validate;
