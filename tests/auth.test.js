const request = require("supertest");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

// authLimiter allows 10 requests per window; rate limiting has its own test file.
jest.mock("../src/middleware/rateLimit.middleware", () => {
  const pass = (req, res, next) => next();
  return { globalLimiter: pass, authLimiter: pass };
});
jest.mock("../src/repositories/user.repo");
jest.mock("../src/repositories/creator.repo");
jest.mock("google-auth-library", () => {
  const verifyIdToken = jest.fn();
  return {
    OAuth2Client: jest.fn(() => ({ verifyIdToken })),
    __verifyIdToken: verifyIdToken
  };
});

const app = require("../src/app");
const userRepo = require("../src/repositories/user.repo");
const creatorRepo = require("../src/repositories/creator.repo");
const { __verifyIdToken: verifyIdToken } = require("google-auth-library");

describe("POST /api/auth/signup", () => {
  const valid = { email: "alice@example.test", password: "hunter22" };

  it("creates a local user with a bcrypt hash and returns 201", async () => {
    userRepo.findUserByEmail.mockResolvedValue(undefined);
    userRepo.createUser.mockResolvedValue({ id: 1, email: valid.email });

    const res = await request(app).post("/api/auth/signup").send(valid);

    expect(res.status).toBe(201);
    expect(res.body).toEqual({ success: true, message: "signup successful" });
    expect(userRepo.findUserByEmail).toHaveBeenCalledWith(valid.email);
    expect(userRepo.createUser).toHaveBeenCalledTimes(1);

    const saved = userRepo.createUser.mock.calls[0][0];
    expect(saved.email).toBe(valid.email);
    expect(saved.provider).toBe("local");
    expect(saved.password).not.toBe(valid.password);
    await expect(bcrypt.compare(valid.password, saved.password)).resolves.toBe(true);
  });

  it("does not return the password or its hash", async () => {
    userRepo.findUserByEmail.mockResolvedValue(undefined);
    userRepo.createUser.mockResolvedValue({ id: 1, email: valid.email, password: "$2b$hash" });

    const res = await request(app).post("/api/auth/signup").send(valid);

    expect(res.status).toBe(201);
    expect(JSON.stringify(res.body)).not.toMatch(/password|\$2b\$/);
  });

  it("rejects an email that is already registered", async () => {
    userRepo.findUserByEmail.mockResolvedValue({ id: 7, email: valid.email });

    const res = await request(app).post("/api/auth/signup").send(valid);

    expect(res.status).toBe(400);
    expect(res.body).toEqual({ success: false, message: "email already in use" });
    expect(userRepo.createUser).not.toHaveBeenCalled();
  });

  it.each([
    ["missing email", { password: "hunter22" }, "body.email"],
    ["malformed email", { email: "not-an-email", password: "hunter22" }, "body.email"],
    ["missing password", { email: "alice@example.test" }, "body.password"],
    ["password shorter than 6", { email: "alice@example.test", password: "12345" }, "body.password"],
    ["non-string password", { email: "alice@example.test", password: 12345678 }, "body.password"]
  ])("rejects %s with 400 and field details", async (_label, body, path) => {
    const res = await request(app).post("/api/auth/signup").send(body);

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe("invalid input");
    expect(res.body.details.map(d => d.path)).toContain(path);
    expect(userRepo.findUserByEmail).not.toHaveBeenCalled();
    expect(userRepo.createUser).not.toHaveBeenCalled();
  });

  it("rejects an empty request body", async () => {
    const res = await request(app).post("/api/auth/signup");

    expect(res.status).toBe(400);
    expect(res.body.details.map(d => d.path)).toEqual(
      expect.arrayContaining(["body.email", "body.password"])
    );
  });

  it("returns 500 without leaking internals when the database fails", async () => {
    userRepo.findUserByEmail.mockRejectedValue(new Error("connection refused"));

    const res = await request(app).post("/api/auth/signup").send(valid);

    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
    expect(userRepo.createUser).not.toHaveBeenCalled();
  });
});

describe("POST /api/auth/login", () => {
  const email = "bob@example.test";
  const password = "correct-horse";
  let hash;

  beforeAll(async () => {
    hash = await bcrypt.hash(password, 4);
  });

  it("returns a signed JWT carrying userId, role and creatorId", async () => {
    userRepo.findUserByEmail.mockResolvedValue({ id: 5, email, password: hash, role: "user" });
    creatorRepo.findCreatorByUserId.mockResolvedValue({ id: 42, user_id: 5 });

    const res = await request(app).post("/api/auth/login").send({ email, password });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    const decoded = jwt.verify(res.body.data.token, process.env.JWT_SECRET);
    expect(decoded).toMatchObject({ userId: 5, role: "user", creatorId: 42 });
    expect(decoded.exp - decoded.iat).toBe(3600);
  });

  it("sets creatorId to null for users who are not creators", async () => {
    userRepo.findUserByEmail.mockResolvedValue({ id: 6, email, password: hash, role: "user" });
    creatorRepo.findCreatorByUserId.mockResolvedValue(undefined);

    const res = await request(app).post("/api/auth/login").send({ email, password });

    expect(res.status).toBe(200);
    expect(jwt.decode(res.body.data.token).creatorId).toBeNull();
  });

  it("rejects a wrong password with a generic message", async () => {
    userRepo.findUserByEmail.mockResolvedValue({ id: 5, email, password: hash, role: "user" });

    const res = await request(app).post("/api/auth/login").send({ email, password: "wrong-password" });

    expect(res.status).toBe(400);
    expect(res.body.message).toBe("invalid credentials");
    expect(res.body.data).toBeUndefined();
  });

  it("gives an unknown email the same response as a wrong password", async () => {
    userRepo.findUserByEmail.mockResolvedValue(undefined);

    const res = await request(app).post("/api/auth/login").send({ email, password });

    expect(res.status).toBe(400);
    expect(res.body.message).toBe("invalid credentials");
    expect(creatorRepo.findCreatorByUserId).not.toHaveBeenCalled();
  });

  it("validates input before touching the database", async () => {
    const res = await request(app).post("/api/auth/login").send({ email: "bob" });

    expect(res.status).toBe(400);
    expect(res.body.message).toBe("invalid input");
    expect(userRepo.findUserByEmail).not.toHaveBeenCalled();
  });
});

describe("POST /api/auth/google", () => {
  const googlePayload = {
    email: "carol@example.test",
    sub: "google-sub-123",
    name: "Carol",
    picture: "https://example.test/avatar.png",
    email_verified: true
  };

  function googleReturns(payload) {
    verifyIdToken.mockResolvedValue({ getPayload: () => payload });
  }

  it("creates a new google user and returns a token", async () => {
    googleReturns(googlePayload);
    userRepo.findUserByGoogleId.mockResolvedValue(undefined);
    userRepo.findUserByEmail.mockResolvedValue(undefined);
    userRepo.createUser.mockResolvedValue({
      id: 9, email: googlePayload.email, name: "Carol", avatar: googlePayload.picture, role: "user"
    });
    creatorRepo.findCreatorByUserId.mockResolvedValue(undefined);

    const res = await request(app).post("/api/auth/google").send({ idToken: "fake-id-token" });

    expect(res.status).toBe(200);
    expect(verifyIdToken).toHaveBeenCalledWith({
      idToken: "fake-id-token",
      audience: process.env.GOOGLE_CLIENT_ID
    });
    expect(userRepo.createUser).toHaveBeenCalledWith(expect.objectContaining({
      email: googlePayload.email, googleId: "google-sub-123", provider: "google"
    }));
    expect(res.body.data.user).toEqual({
      id: 9, email: googlePayload.email, name: "Carol", avatar: googlePayload.picture, role: "user"
    });
    expect(jwt.verify(res.body.data.token, process.env.JWT_SECRET).userId).toBe(9);
  });

  it("links google to an existing local account with the same email", async () => {
    googleReturns(googlePayload);
    userRepo.findUserByGoogleId.mockResolvedValue(undefined);
    userRepo.findUserByEmail.mockResolvedValue({ id: 3, provider: "local", google_id: null });
    userRepo.linkGoogleToUser.mockResolvedValue({ id: 3, email: googlePayload.email, role: "user" });
    creatorRepo.findCreatorByUserId.mockResolvedValue(undefined);

    const res = await request(app).post("/api/auth/google").send({ idToken: "fake-id-token" });

    expect(res.status).toBe(200);
    expect(userRepo.linkGoogleToUser).toHaveBeenCalledWith(3, "google-sub-123");
    expect(userRepo.createUser).not.toHaveBeenCalled();
  });

  it("requires an idToken", async () => {
    const res = await request(app).post("/api/auth/google").send({});

    expect(res.status).toBe(400);
    expect(res.body.message).toBe("idToken required");
    expect(verifyIdToken).not.toHaveBeenCalled();
  });

  it("rejects an email google has not verified", async () => {
    googleReturns({ ...googlePayload, email_verified: false });

    const res = await request(app).post("/api/auth/google").send({ idToken: "fake-id-token" });

    expect(res.status).toBe(400);
    expect(res.body.message).toBe("email not verified by google");
    expect(userRepo.createUser).not.toHaveBeenCalled();
  });

  it("fails without creating a user when google rejects the token", async () => {
    verifyIdToken.mockRejectedValue(new Error("Invalid token signature"));

    const res = await request(app).post("/api/auth/google").send({ idToken: "forged" });

    expect(res.status).not.toBe(200);
    expect(res.body.data).toBeUndefined();
    expect(res.body.success).toBe(false);
    expect(userRepo.createUser).not.toHaveBeenCalled();
  });
});
