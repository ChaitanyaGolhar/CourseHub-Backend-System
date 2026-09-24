const request = require("supertest");

jest.mock("../src/repositories/creator.repo");
jest.mock("../src/repositories/course.repo");

const app = require("../src/app");
const creatorRepo = require("../src/repositories/creator.repo");
const courseRepo = require("../src/repositories/course.repo");
const { client: redis } = require("../src/config/redis");
const { bearer } = require("./helpers");

const plainUser = () => bearer({ userId: 50, creatorId: null });
const creator = (creatorId = 7) => bearer({ userId: 50, creatorId });

describe("POST /api/creator/create", () => {
  it("creates a creator profile for the token's user", async () => {
    creatorRepo.findCreatorByUserId.mockResolvedValue(undefined);
    creatorRepo.findCreatorByHandle.mockResolvedValue(undefined);
    creatorRepo.createCreator.mockResolvedValue({ id: 7, user_id: 50, handle: "dana_codes", brand_name: "Dana" });

    const res = await request(app)
      .post("/api/creator/create")
      .set("Authorization", plainUser())
      .send({ handle: "dana_codes", brandName: "Dana" });

    expect(res.status).toBe(201);
    expect(res.body.data.handle).toBe("dana_codes");
    expect(creatorRepo.createCreator).toHaveBeenCalledWith(50, "dana_codes", "Dana");
  });

  it("rejects a user who is already a creator", async () => {
    creatorRepo.findCreatorByUserId.mockResolvedValue({ id: 7 });

    const res = await request(app)
      .post("/api/creator/create")
      .set("Authorization", plainUser())
      .send({ handle: "dana_codes" });

    expect(res.status).toBe(400);
    expect(res.body.message).toBe("creator already exists");
    expect(creatorRepo.createCreator).not.toHaveBeenCalled();
  });

  it("rejects a handle that is already taken", async () => {
    creatorRepo.findCreatorByUserId.mockResolvedValue(undefined);
    creatorRepo.findCreatorByHandle.mockResolvedValue({ id: 8, handle: "dana_codes" });

    const res = await request(app)
      .post("/api/creator/create")
      .set("Authorization", plainUser())
      .send({ handle: "dana_codes" });

    expect(res.status).toBe(400);
    expect(res.body.message).toBe("handle already taken");
    expect(creatorRepo.createCreator).not.toHaveBeenCalled();
  });

  it.each([
    ["too short", "ab", "handle too short"],
    ["too long", "a".repeat(31), "handle too long"],
    ["uppercase", "Dana", "invalid handle format"],
    ["with spaces", "dana codes", "invalid handle format"]
  ])("rejects a handle that is %s", async (_label, handle, message) => {
    const res = await request(app)
      .post("/api/creator/create")
      .set("Authorization", plainUser())
      .send({ handle });

    expect(res.status).toBe(400);
    expect(res.body.details).toContainEqual({ path: "body.handle", message });
    expect(creatorRepo.findCreatorByUserId).not.toHaveBeenCalled();
  });

  it("requires authentication", async () => {
    const res = await request(app).post("/api/creator/create").send({ handle: "dana_codes" });

    expect(res.status).toBe(401);
  });
});

describe("GET /api/creator/:handle/courses", () => {
  it("loads from the database on a cache miss and caches the result for 60s", async () => {
    redis.get.mockResolvedValue(null);
    creatorRepo.findCreatorByHandle.mockResolvedValue({ id: 7, handle: "dana_codes", brand_name: "Dana" });
    courseRepo.getPublishedCoursesByCreatorId.mockResolvedValue([{ id: 1, title: "SQL" }]);

    const res = await request(app).get("/api/creator/dana_codes/courses");

    expect(res.status).toBe(200);
    const expected = {
      creator: { id: 7, handle: "dana_codes", brandName: "Dana" },
      courses: [{ id: 1, title: "SQL" }]
    };
    expect(res.body.data).toEqual(expected);
    expect(redis.set).toHaveBeenCalledWith(
      "public:courses:dana_codes", JSON.stringify(expected), { EX: 60 }
    );
  });

  it("serves a cache hit without querying the database", async () => {
    const cached = { creator: { id: 7, handle: "dana_codes", brandName: "Dana" }, courses: [] };
    redis.get.mockResolvedValue(JSON.stringify(cached));

    const res = await request(app).get("/api/creator/dana_codes/courses");

    expect(res.status).toBe(200);
    expect(res.body.data).toEqual(cached);
    expect(creatorRepo.findCreatorByHandle).not.toHaveBeenCalled();
  });

  it("falls back to the database when redis is down", async () => {
    redis.get.mockRejectedValue(new Error("ECONNREFUSED"));
    redis.set.mockRejectedValue(new Error("ECONNREFUSED"));
    creatorRepo.findCreatorByHandle.mockResolvedValue({ id: 7, handle: "dana_codes", brand_name: null });
    courseRepo.getPublishedCoursesByCreatorId.mockResolvedValue([]);

    const res = await request(app).get("/api/creator/dana_codes/courses");

    expect(res.status).toBe(200);
    expect(res.body.data.creator.handle).toBe("dana_codes");
  });

  it("returns 404 for an unknown handle", async () => {
    redis.get.mockResolvedValue(null);
    creatorRepo.findCreatorByHandle.mockResolvedValue(undefined);

    const res = await request(app).get("/api/creator/nobody/courses");

    expect(res.status).toBe(404);
    expect(res.body.message).toBe("creator not found");
    expect(redis.set).not.toHaveBeenCalled();
  });
});

describe("PATCH /api/creator/course/:courseId/publish", () => {
  it("publishes a course scoped to the token's creator", async () => {
    courseRepo.publishCourseRepo.mockResolvedValue({ id: 4, is_published: true });

    const res = await request(app)
      .patch("/api/creator/course/4/publish")
      .set("Authorization", creator(7));

    expect(res.status).toBe(200);
    expect(res.body.data.is_published).toBe(true);
    expect(courseRepo.publishCourseRepo).toHaveBeenCalledWith("4", 7);
  });

  it("returns 404 when the course belongs to another creator", async () => {
    courseRepo.publishCourseRepo.mockResolvedValue(undefined);

    const res = await request(app)
      .patch("/api/creator/course/4/publish")
      .set("Authorization", creator(8));

    expect(res.status).toBe(404);
    expect(res.body.message).toBe("course not found or forbidden");
  });

  it("forbids users who are not creators", async () => {
    const res = await request(app)
      .patch("/api/creator/course/4/publish")
      .set("Authorization", plainUser());

    expect(res.status).toBe(403);
    expect(res.body.message).toBe("forbidden");
    expect(courseRepo.publishCourseRepo).not.toHaveBeenCalled();
  });

  it("requires authentication", async () => {
    const res = await request(app).patch("/api/creator/course/4/publish");

    expect(res.status).toBe(401);
  });

  it("rejects a non-numeric course id", async () => {
    const res = await request(app)
      .patch("/api/creator/course/abc/publish")
      .set("Authorization", creator(7));

    expect(res.status).toBe(400);
    expect(courseRepo.publishCourseRepo).not.toHaveBeenCalled();
  });
});

describe("POST /api/creator/course/:courseId/section", () => {
  it("appends a section after the current highest order index", async () => {
    courseRepo.getMaxSectionOrder.mockResolvedValue(2);
    courseRepo.createSectionRepo.mockResolvedValue({ id: 12, title: "Joins", order_index: 3 });

    const res = await request(app)
      .post("/api/creator/course/4/section")
      .set("Authorization", creator(7))
      .send({ title: "Joins" });

    expect(res.status).toBe(201);
    expect(courseRepo.createSectionRepo).toHaveBeenCalledWith({
      title: "Joins", courseId: "4", creatorId: 7, orderIndex: 3
    });
  });

  it("requires a title", async () => {
    const res = await request(app)
      .post("/api/creator/course/4/section")
      .set("Authorization", creator(7))
      .send({ title: "" });

    expect(res.status).toBe(400);
    expect(res.body.details).toContainEqual({ path: "body.title", message: "title required" });
  });

  it("returns 404 when the course is not owned by the creator", async () => {
    courseRepo.getMaxSectionOrder.mockResolvedValue(0);
    courseRepo.createSectionRepo.mockResolvedValue(undefined);

    const res = await request(app)
      .post("/api/creator/course/4/section")
      .set("Authorization", creator(8))
      .send({ title: "Joins" });

    expect(res.status).toBe(404);
  });
});
