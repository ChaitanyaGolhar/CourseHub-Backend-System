const request = require("supertest");
const jwt = require("jsonwebtoken");

jest.mock("../src/repositories/user.repo");
jest.mock("../src/repositories/purchase.repo");

const app = require("../src/app");
const userRepo = require("../src/repositories/user.repo");
const purchaseRepo = require("../src/repositories/purchase.repo");
const { bearer } = require("./helpers");

describe("auth middleware (via GET /api/user/me)", () => {
  it("rejects a request with no Authorization header", async () => {
    const res = await request(app).get("/api/user/me");

    expect(res.status).toBe(401);
    expect(res.body.message).toBe("no token provided");
    expect(userRepo.findUserById).not.toHaveBeenCalled();
  });

  it.each([
    ["no Bearer prefix", t => t],
    ["wrong scheme", t => `Basic ${t}`],
    ["extra segments", t => `Bearer ${t} extra`]
  ])("rejects a header with %s", async (_label, format) => {
    const token = bearer({ userId: 1 }).slice("Bearer ".length);

    const res = await request(app).get("/api/user/me").set("Authorization", format(token));

    expect(res.status).toBe(401);
    expect(res.body.message).toBe("invalid token format");
  });

  it("rejects a token signed with a different secret", async () => {
    const forged = jwt.sign({ userId: 1, role: "admin" }, "some-other-secret");

    const res = await request(app).get("/api/user/me").set("Authorization", `Bearer ${forged}`);

    expect(res.status).toBe(401);
    expect(res.body.message).toBe("unauthorized");
    expect(userRepo.findUserById).not.toHaveBeenCalled();
  });

  it("rejects an expired token", async () => {
    const res = await request(app)
      .get("/api/user/me")
      .set("Authorization", bearer({ userId: 1 }, { expiresIn: -10 }));

    expect(res.status).toBe(401);
    expect(res.body.message).toBe("unauthorized");
  });
});

describe("GET /api/user/me", () => {
  it("returns the profile of the user identified by the token", async () => {
    userRepo.findUserById.mockResolvedValue({ id: 11, email: "dana@example.test", role: "user" });

    const res = await request(app).get("/api/user/me").set("Authorization", bearer({ userId: 11 }));

    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      success: true,
      data: { user: { id: 11, email: "dana@example.test", role: "user" } }
    });
    expect(userRepo.findUserById).toHaveBeenCalledWith(11);
  });

  it("returns 404 when the token's user no longer exists", async () => {
    userRepo.findUserById.mockResolvedValue(undefined);

    const res = await request(app).get("/api/user/me").set("Authorization", bearer({ userId: 404 }));

    expect(res.status).toBe(404);
    expect(res.body).toEqual({ success: false, message: "user not found" });
  });
});

describe("GET /api/user/me/courses", () => {
  it("lists the courses purchased by the token's user", async () => {
    const courses = [{ id: 1, title: "Intro to SQL" }, { id: 2, title: "Node Streams" }];
    purchaseRepo.getUserCourses.mockResolvedValue(courses);

    const res = await request(app).get("/api/user/me/courses").set("Authorization", bearer({ userId: 11 }));

    expect(res.status).toBe(200);
    expect(res.body.data.courses).toEqual(courses);
    expect(purchaseRepo.getUserCourses).toHaveBeenCalledWith(11);
  });

  it("requires authentication", async () => {
    const res = await request(app).get("/api/user/me/courses");

    expect(res.status).toBe(401);
    expect(purchaseRepo.getUserCourses).not.toHaveBeenCalled();
  });
});

describe("app-level routes", () => {
  it("GET /health reports ok", async () => {
    const res = await request(app).get("/health");

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ success: true, status: "ok" });
  });

  it("unknown routes return a JSON 404", async () => {
    const res = await request(app).get("/api/does-not-exist");

    expect(res.status).toBe(404);
    expect(res.body).toEqual({ success: false, message: "route not found" });
  });
});
