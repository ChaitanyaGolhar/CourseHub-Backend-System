const { getCourseById } = require("../repositories/course.repo");

const { alreadyPurchased, createPurchase } = require("../repositories/purchase.repo");
const AppError = require("../utils/AppError");

async function purchaseCourse(req, res) {
    const userId = req.user.id;
    const courseId = req.validatedData.params.courseId;

    const course = await getCourseById(courseId);

    if (!course) {
      throw new AppError("course not found", 404);
    }

    if (!course.is_published) {
      throw new AppError("course not published", 400);
    }

    const exists = await alreadyPurchased(userId, courseId);

    if (exists) {
      throw new AppError("course already purchased", 400);
    }

    try {
      await createPurchase(userId, courseId);
    } catch (e) {
      if (e.code === "23505") {
        return res.status(400).json({
          success: false,
          message: "course already purchased",
        });
      }
      throw e;
    }

    return res.status(201).json({
      success: true,
      message: "course purchased successfully",
      data: {
        course_id: courseId,
      },
    });
}

module.exports = { purchaseCourse };