const { getPublishedCourses, findCourseById } = require("../repositories/course.repo");
const { isAlreadyPurchased, createPurchase, getUserPurchases } = require("../repositories/purchase.repo");


async function getCourses(req, res) {
  try {
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
    
  } catch (e) {
    console.error(e)
    return res.status(500).json({
      success: false,
      message: "internal server error"
    })
  }
}

async function purchaseCourse(req, res) {
  try {
    const courseId = req.validateData.params.id;

    const course = await findCourseById(courseId);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: "course not found"
      });
    }

    if (!course.is_published) {
      return res.status(400).json({
        success: false,
        message: "course not available"
      });
    }

    const exists = await isAlreadyPurchased(req.user.id, courseId);

    if (exists) {
      return res.status(400).json({
        success: false,
        message: "already purchased"
      });
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
  } catch {
    return res.status(500).json({ 
      success: false,
      message: "internal server error"
    });
  }
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