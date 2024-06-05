const jwt = require("jsonwebtoken");
const axios = require("axios");
const NodeCache = require("node-cache");

const keyCache = new NodeCache({ stdTTL: 86400, checkperiod: 86400 * 0.5 });

const getKeycloakPublicKey = async () => {
  let publicKey = keyCache.get("keycloakPK");
  if (publicKey) {
    return publicKey;
  } else {
    try {
      console.log(
        `${process.env.API_KC_URL}/idp/realms/${process.env.API_REALM_NAME}/protocol/openid-connect/certs`
      );
      const response = await axios.get(
        `${process.env.API_KC_URL}/realms/${process.env.API_REALM_NAME}/protocol/openid-connect/certs`
      );
      const key = response.data.keys[0].x5c[0];
      const keyToCache = `-----BEGIN CERTIFICATE-----\n${key}\n-----END CERTIFICATE-----`;
      keyCache.set("keycloakPK", keyToCache)
      return keyToCache;
    } catch (error) {
      console.error("Error fetching public key:", error);
      return null;
    }
  }
};

const verifyToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    const err = new Error("Missing token");
    err.statusCode = 401;
  }
  const token = authHeader.split(" ")[1];
  const publicKey = await getKeycloakPublicKey();

  if (!publicKey) {
    next(new Error("Failed to fetch public key"));
    return;
  }

  jwt.verify(token, publicKey, { algorithms: ["RS256"] }, (err, decoded) => {
    if (err) {
      const err = new Error("Invalid Token");
      err.statusCode = 401;
      next(err);
      return;
    }
    req.user = decoded;
    next();
  });
};

module.exports = verifyToken;
