function adminMiddleware(req, res, next) {
  if (!req.user) {
    return res.status(401).json({ message: "unauthorized" });
  }

  if (!req.user.creatorId) {
    return res.status(403).json({ message: "forbidden" });
  }

  next();
}

module.exports = adminMiddleware;