const { getCourseById } = require("../repositories/course.repo");

const { alreadyPurchased, createPurchase } = require("../repositories/purchase.repo");

async function purchaseCourse(req, res) {
  try {
    const userId = req.user.id;
    const courseId = req.validateData.params.id;

    const course = await getCourseById(courseId);

    if (!course) {
      return res.status(404).json({ 
        success: false,
        message: "course not found" });
    }

    if (!course.is_published) {
      return res.status(400).json({ 
        success: false,
        message: "course not available" });
    }

    const exists = await alreadyPurchased(userId, courseId);

    if (exists) {
      return res.status(400).json({
        success: false,
        message: "course already purchased",
      });
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
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "internal server error",
    });
  }
}

module.exports = { purchaseCourse };