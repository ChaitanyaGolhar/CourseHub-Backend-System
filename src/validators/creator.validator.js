const { z } = require("zod");

const createCreatorSchema = z.object({
  body: z.object({
    handle: z
      .string()
      .min(3, "handle too short")
      .max(30, "handle too long")
      .regex(/^[a-z0-9_]+$/, "invalid handle format"),

    brandName: z.string().optional()
  }),
  params: z.object({}),
  query: z.object({})
});

const createCourseSchema = z.object({
  body: z.object({
    title: z.string().min(1, "title required"),
    description: z.string().optional(),
    price: z.coerce.number().min(0, "price must be positive")
  }),
  params: z.object({}),
  query: z.object({})
});

const getCreatorCoursesSchema = z.object({
  body: z.object({}),
  params: z.object({}),
  query: z.object({})
});

const updateCourseSchema = z.object({
  body: z.object({
    title: z.string().min(1).optional(),
    description: z.string().optional(),
    price: z.coerce.number().min(0).optional()
  }),
  params: z.object({
    courseId: z.coerce.number()
  }),
  query: z.object({})
});

const createSectionSchema = z.object({
  body: z.object({
    title: z.string().min(1, "title required")
  }),
  params: z.object({
    courseId: z.coerce.number()
  }),
  query: z.object({})
});

const createLectureSchema = z.object({
  body: z.object({
    title: z.string().min(1, "title required"),
    sectionId: z.coerce.number(),
    isPreview: z.boolean().optional()
  }),
  params: z.object({
    courseId: z.coerce.number()
  }),
  query: z.object({})
});

const updateLectureVideoSchema = z.object({
  body: z.object({}),
  params: z.object({
    courseId: z.coerce.number(),
    lectureId: z.coerce.number()
  }),
  query: z.object({})
});

const updateCourseThumbnailSchema = z.object({
  body: z.object({}),
  params: z.object({
    courseId: z.coerce.number()
  }),
  query: z.object({})
});

const publishUnpublishCourseSchema = z.object({
  body: z.object({}),
  params: z.object({
    courseId: z.coerce.number()
  }),
  query: z.object({})
});




module.exports = {
  createCreatorSchema,
  createCourseSchema,
  getCreatorCoursesSchema,
  updateCourseSchema,
  createSectionSchema,
  createLectureSchema,
  updateLectureVideoSchema,
  updateCourseThumbnailSchema,
  publishUnpublishCourseSchema
};