const z = require('zod');

const createCourseHandlerSchema = z.object({
    body: z.object({
        title: z.string().min(1, "title is required"),
        description: z.string().optional(),
        price: z.coerce.number().min(0, "price must be a positive number") 
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

const createSectionHandlerScheme = z.object({
    body: z.object({
        title: z.string().min(1, "title is required"),
        courseId: z.string().min(1, "courseId is required")
    }),
    params: z.object({}),
    query: z.object({})
})

const createLectureHandlerScheme = z.object({
    body: z.object({
        title: z.string().min(1, "title is required"),
        videoUrl: z.string().optional(),
        sectionId: z.string().min(1, "courseId is required"),
    }),
    params: z.object({}),
    query: z.object({})
})

const uploadThumbnailScheme = z.object({
    body: z.object({}),
    params: z.object({
        courseId: z.string().min(1, "courseId is required")
    }),
    query: z.object({})
})

const uploadLectureVideoScheme = z.object({
    body: z.object({}),
    params: z.object({
        lectureId: z.coerce.string().min(1, "lectureId is required"),
        sectionId: z.coerce.string().min(1, "sectionId is required")
    }),
    query: z.object({})
})


module.exports = {
    createCourseHandlerSchema,
    publishUnpublishSchema,
    createSectionHandlerScheme,
    createLectureHandlerScheme,
    uploadThumbnailScheme,
    uploadLectureVideoScheme
}
