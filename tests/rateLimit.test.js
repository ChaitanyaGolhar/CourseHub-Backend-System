const request = require("supertest");

jest.mock("../src/repositories/user.repo");

const app = require("../src/app");
const userRepo = require("../src/repositories/user.repo");

describe("auth rate limiting", () => {
  it("allows 10 auth attempts per window, then responds 429", async () => {
    userRepo.findUserByEmail.mockResolvedValue(undefined);
    const attempt = () =>
      request(app).post("/api/auth/login").send({ email: "eve@example.test", password: "guess-123" });

    for (let i = 0; i < 10; i++) {
      const res = await attempt();
      expect(res.status).toBe(400);
    }

    const blocked = await attempt();
    expect(blocked.status).toBe(429);
    expect(blocked.body).toEqual({ success: false, message: "Too many requests, try again later" });
    expect(userRepo.findUserByEmail).toHaveBeenCalledTimes(10);
  });
});
