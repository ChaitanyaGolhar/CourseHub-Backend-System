const jwt = require("jsonwebtoken");

function authMiddleware(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({
         message: "no token provided" 
        });
    }

    const parts = authHeader.split(" ");

    if (parts.length !== 2 || parts[0] !== "Bearer") {
      return res.status(401).json({
         message: "invalid token format" 
        });
    }

    const decoded = jwt.verify(parts[1], process.env.JWT_SECRET);

    req.user = {
      id: decoded.userId,
      role: decoded.role,
      creatorId: decoded.creatorId
    };

    next();
  } catch (err) {
    return res.status(401).json({
         message: "unauthorized" 
        });
  }
}

module.exports = authMiddleware;