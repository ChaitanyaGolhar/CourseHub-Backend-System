const { findCourseById, getCoursesWithCount, getSectionsByCourse, getLecturesByCourse } = require("../repositories/course.repo");
const { isAlreadyPurchased, createPurchase, getUserPurchases } = require("../repositories/purchase.repo");
const { getCourseContentService } = require("../services/course.service");
const AppError = require("../utils/AppError");


async function getCourses(req, res) {
    let { page, limit } = req.validateData.query;
    
    const offset = (page - 1) * limit;
  
    const { courses, total } = await getCoursesWithCount(limit, offset);

    const totalPages = Math.ceil(total / limit);

    return res.json({
      success: true,
       data: {
      courses,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    }
      });
}

async function purchaseCourse(req, res) {
    const courseId = req.validateData.params.id;

    const course = await findCourseById(courseId);

    if (!course) {
      throw new AppError("course not found", 404);
    }

    if (!course.is_published) {
      throw new AppError("course not published", 400);
    }

    const exists = await isAlreadyPurchased(req.user.id, courseId);

    if (exists) {
     throw new AppError("already purchased", 400);
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

async function getCourseContent(req, res){
  const courseId = req.validatedData.params.id;

  const data = await getCourseContentService({
    courseId,
    user: req.user || null
  });

  return res.json({
    success: true,
    data
  });
}

module.exports = {
  getCourses,
  purchaseCourse,
  getPurchasedCourses,
  getCourseContent
};