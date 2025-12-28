const jwt = require("jsonwebtoken");

const accessSecretKey = `${process.env.ACCESS_SECRET_KEY}`;

async function isAuthenticated(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        code: 401,
        error: { message: "Authentication token is missing or invalid." },
      });
    }

    const accessToken = authHeader.split(" ")[1];
    try {
      const decodedToken = jwt.verify(accessToken, accessSecretKey);
      req.userId = decodedToken.userId;
      req.accessToken = accessToken;
      next();
    } catch (error) {
      return res.status(401).json({ error: "Invalid or expired access token" });
    }
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
}

module.exports = isAuthenticated;
