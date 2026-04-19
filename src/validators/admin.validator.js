const z = require('zod');

const createCourseHandlerSchema = z.object({
    body: z.object({
        title: z.string().min(1, "title is required"),
        price: z.number().min(0, "price must be a positive number") 
    }),
    params: z.object({}),
    query: z.object({})
})

const publishUnpublishSchema = z.object({
    body: z.object({}),
    params: z.object({
        id: z.string().min(1, "id is required")
    }),
    query: z.object({})
})

module.exports = {
    createCourseHandlerSchema,
    publishUnpublishSchema
}