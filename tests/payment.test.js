const request = require("supertest");
const crypto = require("crypto");

jest.mock("../src/repositories/course.repo");
jest.mock("../src/repositories/order.repo");
jest.mock("../src/repositories/purchase.repo");

const app = require("../src/app");
const razorpay = require("../src/config/razorpay");
const courseRepo = require("../src/repositories/course.repo");
const orderRepo = require("../src/repositories/order.repo");
const purchaseRepo = require("../src/repositories/purchase.repo");
const { bearer } = require("./helpers");

describe("POST /api/payment/create-order/:courseId", () => {
  it("creates a razorpay order in paise and records it", async () => {
    courseRepo.findCourseById.mockResolvedValue({ id: 4, price: 499, is_published: true });
    razorpay.orders.create.mockResolvedValue({ id: "order_fake_1", amount: 49900, currency: "INR" });

    const res = await request(app)
      .post("/api/payment/create-order/4")
      .set("Authorization", bearer({ userId: 60 }));

    expect(res.status).toBe(201);
    expect(res.body.data.id).toBe("order_fake_1");
    expect(razorpay.orders.create).toHaveBeenCalledWith(
      expect.objectContaining({ amount: 49900, currency: "INR" })
    );
    expect(orderRepo.createOrderInDB).toHaveBeenCalledWith({
      userId: 60, courseId: 4, amount: 499, razorpayOrderId: "order_fake_1"
    });
  });

  it.each([
    ["does not exist", undefined],
    ["is unpublished", { id: 4, price: 499, is_published: false }]
  ])("refuses when the course %s", async (_label, course) => {
    courseRepo.findCourseById.mockResolvedValue(course);

    const res = await request(app)
      .post("/api/payment/create-order/4")
      .set("Authorization", bearer({ userId: 60 }));

    expect(res.status).toBe(400);
    expect(res.body.message).toBe("Invalid or unpublished course");
    expect(razorpay.orders.create).not.toHaveBeenCalled();
    expect(orderRepo.createOrderInDB).not.toHaveBeenCalled();
  });

  it("requires authentication", async () => {
    const res = await request(app).post("/api/payment/create-order/4");

    expect(res.status).toBe(401);
    expect(razorpay.orders.create).not.toHaveBeenCalled();
  });

  it("does not record an order when razorpay fails", async () => {
    courseRepo.findCourseById.mockResolvedValue({ id: 4, price: 499, is_published: true });
    razorpay.orders.create.mockRejectedValue(new Error("razorpay unavailable"));

    const res = await request(app)
      .post("/api/payment/create-order/4")
      .set("Authorization", bearer({ userId: 60 }));

    expect(res.status).toBe(500);
    expect(orderRepo.createOrderInDB).not.toHaveBeenCalled();
  });
});

describe("POST /api/payment/webhook", () => {
  const captured = {
    event: "payment.captured",
    payload: { payment: { entity: { order_id: "order_fake_1", amount: 49900 } } }
  };

  function sign(body, secret = process.env.RAZORPAY_WEBHOOK_SECRET) {
    return crypto.createHmac("sha256", secret).update(JSON.stringify(body)).digest("hex");
  }

  it("marks the order paid and grants the purchase on payment.captured", async () => {
    orderRepo.findOrderByRazorpayId.mockResolvedValue({ id: 70, user_id: 60, course_id: 4, status: "created" });

    const res = await request(app)
      .post("/api/payment/webhook")
      .set("x-razorpay-signature", sign(captured))
      .send(captured);

    expect(res.status).toBe(200);
    expect(orderRepo.findOrderByRazorpayId).toHaveBeenCalledWith("order_fake_1");
    expect(orderRepo.updateOrderStatus).toHaveBeenCalledWith(70, "paid");
    expect(purchaseRepo.createPurchase).toHaveBeenCalledWith(60, 4, 499);
  });

  it("is idempotent for an order that is already paid", async () => {
    orderRepo.findOrderByRazorpayId.mockResolvedValue({ id: 70, user_id: 60, course_id: 4, status: "paid" });

    const res = await request(app)
      .post("/api/payment/webhook")
      .set("x-razorpay-signature", sign(captured))
      .send(captured);

    expect(res.status).toBe(200);
    expect(orderRepo.updateOrderStatus).not.toHaveBeenCalled();
    expect(purchaseRepo.createPurchase).not.toHaveBeenCalled();
  });

  it("rejects a payload signed with the wrong secret", async () => {
    const res = await request(app)
      .post("/api/payment/webhook")
      .set("x-razorpay-signature", sign(captured, "attacker-secret"))
      .send(captured);

    expect(res.status).toBe(400);
    expect(res.body.message).toBe("Invalid signature");
    expect(orderRepo.findOrderByRazorpayId).not.toHaveBeenCalled();
    expect(purchaseRepo.createPurchase).not.toHaveBeenCalled();
  });

  it("rejects a payload altered after signing", async () => {
    const signature = sign(captured);
    const tampered = {
      ...captured,
      payload: { payment: { entity: { order_id: "order_someone_else", amount: 49900 } } }
    };

    const res = await request(app)
      .post("/api/payment/webhook")
      .set("x-razorpay-signature", signature)
      .send(tampered);

    expect(res.status).toBe(400);
    expect(purchaseRepo.createPurchase).not.toHaveBeenCalled();
  });

  it("rejects a request with no signature header", async () => {
    const res = await request(app).post("/api/payment/webhook").send(captured);

    expect(res.status).toBe(400);
    expect(orderRepo.findOrderByRazorpayId).not.toHaveBeenCalled();
  });

  it("acknowledges other event types without side effects", async () => {
    const failed = { event: "payment.failed", payload: {} };

    const res = await request(app)
      .post("/api/payment/webhook")
      .set("x-razorpay-signature", sign(failed))
      .send(failed);

    expect(res.status).toBe(200);
    expect(orderRepo.findOrderByRazorpayId).not.toHaveBeenCalled();
  });
});
