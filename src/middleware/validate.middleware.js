const AppError = require("../utils/AppError");

function validate(schema) {
  return (req, res, next) => {
    const result = schema.safeParse({
      body: req.body || {},
      params: req.params || {},
      query: req.query || {}
    });

    if (!result.success) {
      const details = result.error.issues.map(i => ({
        path: i.path.join("."),
        message: i.message
      }));
      return next(new AppError("invalid input", 400, details));
    }

    req.validatedData = result.data;
    next();
  };
}

module.exports = validate;