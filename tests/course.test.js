const request = require("supertest");

jest.mock("../src/repositories/course.repo");
jest.mock("../src/repositories/purchase.repo");

const app = require("../src/app");
const courseRepo = require("../src/repositories/course.repo");
const purchaseRepo = require("../src/repositories/purchase.repo");
const { bearer } = require("./helpers");

describe("GET /api/course", () => {
  it("returns published courses with pagination metadata", async () => {
    const courses = [{ id: 3, title: "C" }, { id: 2, title: "B" }];
    courseRepo.getCoursesWithCount.mockResolvedValue({ courses, total: 5 });

    const res = await request(app).get("/api/course?page=2&limit=2");

    expect(res.status).toBe(200);
    expect(courseRepo.getCoursesWithCount).toHaveBeenCalledWith(2, 2);
    expect(res.body.data).toEqual({
      courses,
      pagination: { page: 2, limit: 2, total: 5, totalPages: 3, hasNext: true, hasPrev: true }
    });
  });

  it("defaults to page 1", async () => {
    courseRepo.getCoursesWithCount.mockResolvedValue({ courses: [], total: 0 });

    const res = await request(app).get("/api/course");

    expect(res.status).toBe(200);
    expect(res.body.data.pagination).toMatchObject({ page: 1, hasPrev: false, hasNext: false });
    expect(courseRepo.getCoursesWithCount.mock.calls[0][1]).toBe(0);
  });

  it.each([
    ["page=0", "zero"],
    ["page=-1", "negative"],
    ["page=abc", "non-numeric"],
    ["limit=21", "over max limit"]
  ])("rejects %s (%s)", async (qs) => {
    const res = await request(app).get(`/api/course?${qs}`);

    expect(res.status).toBe(400);
    expect(res.body.message).toBe("invalid input");
    expect(courseRepo.getCoursesWithCount).not.toHaveBeenCalled();
  });
});

describe("GET /api/course/purchased", () => {
  it("returns the caller's purchases", async () => {
    purchaseRepo.getUserPurchases.mockResolvedValue([{ id: 8, title: "Owned" }]);

    const res = await request(app).get("/api/course/purchased").set("Authorization", bearer({ userId: 21 }));

    expect(res.status).toBe(200);
    expect(res.body.data.courses).toEqual([{ id: 8, title: "Owned" }]);
    expect(purchaseRepo.getUserPurchases).toHaveBeenCalledWith(21);
  });

  it("requires authentication", async () => {
    const res = await request(app).get("/api/course/purchased");

    expect(res.status).toBe(401);
    expect(purchaseRepo.getUserPurchases).not.toHaveBeenCalled();
  });
});

describe("GET /api/course/:id/content", () => {
  const course = {
    id: 4, title: "Postgres Deep Dive", description: "d", thumbnail_url: null,
    creator_id: 99, price: 500, is_published: true
  };
  const sections = [{ id: 10, title: "Basics" }, { id: 11, title: "Indexes" }];
  const lectures = [
    { id: 100, section_id: 10, title: "Welcome", video_url: "v/100", is_preview: true },
    { id: 101, section_id: 10, title: "Joins", video_url: "v/101", is_preview: false },
    { id: 102, section_id: 11, title: "B-trees", video_url: "v/102", is_preview: false }
  ];

  beforeEach(() => {
    courseRepo.findCourseById.mockResolvedValue(course);
    courseRepo.getSectionsByCourse.mockResolvedValue(sections);
    courseRepo.getLecturesByCourse.mockResolvedValue(lectures);
  });

  it("shows anonymous visitors only preview lectures", async () => {
    const res = await request(app).get("/api/course/4/content");

    expect(res.status).toBe(200);
    expect(res.body.data.access).toEqual({ fullAccess: false });
    const [basics, indexes] = res.body.data.course.sections;
    expect(basics.lectures.map(l => l.id)).toEqual([100]);
    expect(indexes.lectures).toEqual([]);
    expect(JSON.stringify(res.body)).not.toContain("v/101");
    expect(purchaseRepo.isAlreadyPurchased).not.toHaveBeenCalled();
  });

  it("treats an invalid token like an anonymous visitor", async () => {
    const res = await request(app)
      .get("/api/course/4/content")
      .set("Authorization", "Bearer not-a-real-jwt");

    expect(res.status).toBe(200);
    expect(res.body.data.access.fullAccess).toBe(false);
  });

  it("returns 404 for a course that does not exist", async () => {
    courseRepo.findCourseById.mockResolvedValue(undefined);

    const res = await request(app).get("/api/course/999/content");

    expect(res.status).toBe(404);
    expect(res.body.message).toBe("course not found");
    expect(courseRepo.getLecturesByCourse).not.toHaveBeenCalled();
  });

  it.each(["abc", "0", "-3"])("rejects a non-positive or non-numeric id: %s", async (id) => {
    const res = await request(app).get(`/api/course/${id}/content`);

    expect(res.status).toBe(400);
    expect(courseRepo.findCourseById).not.toHaveBeenCalled();
  });
});
