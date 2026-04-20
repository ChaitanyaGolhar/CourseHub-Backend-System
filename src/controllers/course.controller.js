const { findCourseById, getCoursesWithCount, getSectionsByCourse, getLecturesByCourse } = require("../repositories/course.repo");
const { isAlreadyPurchased, createPurchase, getUserPurchases } = require("../repositories/purchase.repo");


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

async function getCourseContent(req, res){
  const courseId = req.validateData.params.id;

  const course = await findCourseById(courseId)

  if(!course){
    throw new AppError("Course not found", 404);
  }

  const sections = await getSectionsByCourse(courseId);
  const lectures = await getLecturesByCourse(courseId);

  let hasFullAccess = false;

  if (req.user) {
    if (course.creator_id === req.user.id) {
      hasFullAccess = true;
    } else {
      const purchased = await isAlreadyPurchased(req.user.id, courseId);
      if (purchased) {
        hasFullAccess = true;
      }
    }
  }

  const sectionMap = {};

  sections.forEach(section => {
    sectionMap[section.id] = {
      id: section.id,
      title: section.title,
      lectures: []
    }
  })

  lectures.forEach(lecture => {
  if (!hasFullAccess && !lecture.is_preview) {
    return;
  }

  if (sectionMap[lecture.section_id]) {
    sectionMap[lecture.section_id].lectures.push({
      id: lecture.id,
      title: lecture.title,
      video_url: lecture.video_url,
      is_preview: lecture.is_preview
    });
  }
});

  const structuredSections = Object.values(sectionMap);

  return res.json({
    success: true,
    data: {
      course: {
        id: course.id,
        title: course.title,
        description: course.description,
        thumbnail_url: course.thumbnail_url,
        sections: structuredSections
      },
      access: {
        fullAccess: hasFullAccess
      }
    }
  });

}

module.exports = {
  getCourses,
  purchaseCourse,
  getPurchasedCourses,
  getCourseContent
};