const request = require("supertest");

jest.mock("../src/repositories/progress.repo");

const app = require("../src/app");
const progressRepo = require("../src/repositories/progress.repo");
const { bearer } = require("./helpers");

describe("POST /api/progress/lecture/:id/complete", () => {
  it("marks the lecture complete for the token's user", async () => {
    const row = { id: 1, user_id: 31, lecture_id: 55, is_completed: true };
    progressRepo.markLectureComplete.mockResolvedValue(row);

    const res = await request(app)
      .post("/api/progress/lecture/55/complete")
      .set("Authorization", bearer({ userId: 31 }));

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ success: true, data: row });
    expect(progressRepo.markLectureComplete).toHaveBeenCalledWith(31, 55);
  });

  it("ignores a userId supplied in the body", async () => {
    progressRepo.markLectureComplete.mockResolvedValue({});

    await request(app)
      .post("/api/progress/lecture/55/complete")
      .set("Authorization", bearer({ userId: 31 }))
      .send({ userId: 1 });

    expect(progressRepo.markLectureComplete).toHaveBeenCalledWith(31, 55);
  });

  it("requires authentication", async () => {
    const res = await request(app).post("/api/progress/lecture/55/complete");

    expect(res.status).toBe(401);
    expect(progressRepo.markLectureComplete).not.toHaveBeenCalled();
  });
});

describe("GET /api/progress/course/:id", () => {
  it("returns the completed lecture ids for the token's user", async () => {
    progressRepo.getUserProgressForCourse.mockResolvedValue([{ lecture_id: 5 }, { lecture_id: 9 }]);

    const res = await request(app)
      .get("/api/progress/course/4")
      .set("Authorization", bearer({ userId: 31 }));

    expect(res.status).toBe(200);
    expect(res.body.data).toEqual({ completedLectures: [5, 9] });
    expect(progressRepo.getUserProgressForCourse).toHaveBeenCalledWith(31, 4);
  });

  it("returns an empty list when nothing is completed", async () => {
    progressRepo.getUserProgressForCourse.mockResolvedValue([]);

    const res = await request(app)
      .get("/api/progress/course/4")
      .set("Authorization", bearer({ userId: 31 }));

    expect(res.status).toBe(200);
    expect(res.body.data.completedLectures).toEqual([]);
  });

  it("requires authentication", async () => {
    const res = await request(app).get("/api/progress/course/4");

    expect(res.status).toBe(401);
    expect(progressRepo.getUserProgressForCourse).not.toHaveBeenCalled();
  });
});
