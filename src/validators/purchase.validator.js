const z = require('zod');

const purchaseCourseSchema = z.object({
    body: z.object({}),
    params: z.object({
        id: z.coerce.number().int().positive()
    }),
    query: z.object({})
});

module.exports = {
    purchaseCourseSchema
};