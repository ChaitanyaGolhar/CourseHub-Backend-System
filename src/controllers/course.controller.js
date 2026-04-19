const { th } = require("zod/locales");
const { getPublishedCourses, findCourseById } = require("../repositories/course.repo");
const { isAlreadyPurchased, createPurchase, getUserPurchases } = require("../repositories/purchase.repo");


async function getCourses(req, res) {
    let { page, limit } = req.validateData.query;
    
    const offset = (page - 1) * limit;
  
    const courses = await getPublishedCourses(limit, offset);
    return res.json({
      success: true,
       page,
       limit,
       count: courses.length,
       data: { courses }
      });
}

async function purchaseCourse(req, res) {
    const courseId = req.validateData.params.id;

    const course = await findCourseById(courseId);

    if (!course) {
      throw new Error("course not found", 404);
    }

    if (!course.is_published) {
      throw new Error("course not published", 400);
    }

    const exists = await isAlreadyPurchased(req.user.id, courseId);

    if (exists) {
     throw new Error("already purchased", 400);
    }

    try {
      await createPurchase(req.user.id, courseId);
    } catch (e) {
      if (e.code === "23505") {
        return res.status(400).json({ 
          success: false,
          message: "already purchased"
        });
      }
      throw e;
    }

    return res.status(201).json({ 
      success: true,
      message: "purchase successful"
    });
}

async function getPurchasedCourses(req, res) {
  const courses = await getUserPurchases(req.user.id);
  return res.json({ 
    success: true,
    data: { courses }
  });
}

module.exports = {
  getCourses,
  purchaseCourse,
  getPurchasedCourses
};