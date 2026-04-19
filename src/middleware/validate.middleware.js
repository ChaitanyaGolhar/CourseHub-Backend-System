const { z } = require("zod")

function validate(schema){
    return (req, res, next) => {
        const result = schema.safeParse({
            body: req.body || {},
            params: req.params || {},
            query: req.query || {}
        });

        if (!result.success) {
            return res.status(400).json({
                success: false,
                errors: result.error.errors.map(e => ({
                field: e.path.join('.'),
                message: e.message
                }))
            });
        }

        req.validateData = result.data;
        next();
    }
}

module.exports = validate;