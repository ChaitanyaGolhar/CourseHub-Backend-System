// Fake values only. dotenv never overrides variables that are already set,
// so a local .env cannot leak into the test run.
process.env.DOTENV_CONFIG_QUIET = "true";
process.env.JWT_SECRET = "test-jwt-secret-not-real";
process.env.PGURI = "postgres://fake:fake@localhost:5432/fake";
process.env.REDIS_PUBLIC_URL = "redis://localhost:6379";
process.env.RAZORPAY_KEY_ID = "rzp_test_fake_key";
process.env.RAZORPAY_KEY_SECRET = "fake-razorpay-secret";
process.env.RAZORPAY_WEBHOOK_SECRET = "fake-webhook-secret";
process.env.GOOGLE_CLIENT_ID = "fake-client-id.apps.googleusercontent.com";

// Silent logger: the real one spawns a pino-pretty worker thread.
jest.mock("../src/config/logger", () => require("pino")({ level: "silent" }));

// Any query that reaches the real pool means a repository was not mocked.
// Plain functions (not jest.fn) so resetMocks cannot strip the guard.
jest.mock("../src/config/db", () => {
  const unexpected = () => {
    throw new Error("unexpected database access in tests");
  };
  return { query: unexpected, connect: unexpected };
});

jest.mock("../src/config/redis", () => ({
  client: { get: jest.fn(), set: jest.fn() },
  connectRedis: jest.fn()
}));

jest.mock("../src/config/razorpay", () => ({
  orders: { create: jest.fn() }
}));
