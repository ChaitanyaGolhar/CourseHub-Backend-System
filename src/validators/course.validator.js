const { z } = require("zod");

const getCoursesSchema = z.object({
    body: z.object({}),
    params: z.object({}),
    query: z.object({
        page : z.coerce.number().int().positive().default(1),
        limit: z.coerce.number().int().positive().max(20).default(1)
    })
})

const purchaseCourseSchema = z.object({
    body: z.object({}),
    params: z.object({
        id: z.coerce.number().int().positive()
    }),
    query: z.object({})
})


module.exports = {
    getCoursesSchema,
    purchaseCourseSchema,
    
}