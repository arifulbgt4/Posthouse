const { decrypt } = require("../utils/encryption");

function authenticate(req, res, next) {
  const {
    "x-auth-iv": iv,
    "x-auth-encrypt": encrypt,
    "x-auth-tag": authTag,
  } = req.headers;

  if (!encrypt || !iv || !authTag) {
    return res.send(401).json({ error: "Unauthorized" });
  }

  const decryptedKey = decrypt(encrypt, iv, authTag);

  if (decryptedKey !== process.env.SECRET_KEY) {
    return res.send(401).json({ error: "Unauthorized" });
  }

  return next();
}

module.exports = { authenticate };
