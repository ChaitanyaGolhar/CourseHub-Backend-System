const { getPublishedCourses, findCourseById } = require("../repositories/course.repo");
const { isAlreadyPurchased, createPurchase, getUserPurchases } = require("../repositories/purchase.repo");


async function getCourses(req, res) {
  try {
    let { page, limit } = req.validateData.query;

    if(page <= 0 || limit <= 0){
      return res.status(400).json({
        message: "invalid pagination params"
      })
    }
    
    const offset = (page - 1) * limit;
  
    const courses = await getPublishedCourses(limit, offset);
    return res.json({
       page,
       limit,
       count: courses.length,
       courses 
      });
    
  } catch (e) {
    console.error(e)
    return res.status(500).json({
      message: "internal server error"
    })
  }
}

async function purchaseCourse(req, res) {
  try {
    const courseId = req.validateData.params.id;

    const course = await findCourseById(courseId);

    if (!course) {
      return res.status(404).json({ message: "course not found" });
    }

    if (!course.is_published) {
      return res.status(400).json({ message: "course not available" });
    }

    const exists = await isAlreadyPurchased(req.user.id, courseId);

    if (exists) {
      return res.status(400).json({ message: "already purchased" });
    }

    try {
      await createPurchase(req.user.id, courseId);
    } catch (e) {
      if (e.code === "23505") {
        return res.status(400).json({ message: "already purchased" });
      }
      throw e;
    }

    return res.status(201).json({ message: "purchase successful" });
  } catch {
    return res.status(500).json({ message: "internal server error" });
  }
}

async function getPurchasedCourses(req, res) {
  const courses = await getUserPurchases(req.user.id);
  return res.json({ courses });
}

module.exports = {
  getCourses,
  purchaseCourse,
  getPurchasedCourses
};