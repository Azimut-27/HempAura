import { beforeEach, describe, expect, it, vi } from "vitest";

function mockResponse() {
  return {
    statusCode: 200,
    headers: {},
    body: "",
    status(code) {
      this.statusCode = code;
      return this;
    },
    setHeader(name, value) {
      this.headers[name] = value;
      return this;
    },
    end(body) {
      this.body = body;
      return this;
    },
  };
}

beforeEach(() => {
  vi.resetModules();
  vi.unstubAllEnvs();
});

describe("public API validation", () => {
  it("contact endpoint rejects invalid submissions", async () => {
    const { default: handler } = await import("../api/contact.js");
    const response = mockResponse();
    await handler(
      {
        method: "POST",
        headers: { origin: "http://localhost:5173" },
        body: { name: "", email: "bad", subject: "", message: "", consent: false },
        socket: { remoteAddress: "127.0.0.1" },
      },
      response
    );
    expect(response.statusCode).toBe(400);
  });

  it("newsletter endpoint returns an already-subscribed state", async () => {
    vi.doMock("../api/repositories/database.js", () => ({
      database: {
        getNewsletterSubscriber: vi.fn().mockResolvedValue({
          email: "oseba@example.com",
          status: "confirmed",
        }),
      },
    }));
    const { default: handler } = await import("../api/newsletter/subscribe.js");
    const response = mockResponse();
    await handler(
      {
        method: "POST",
        headers: { origin: "http://localhost:5173" },
        body: {
          email: "oseba@example.com",
          consent: true,
          consentTextVersion: "2026-07-16",
          website: "",
        },
        socket: { remoteAddress: "127.0.0.2" },
      },
      response
    );
    expect(response.statusCode).toBe(200);
    expect(JSON.parse(response.body).message).toMatch(/že potrjeno/);
  });

  it("checkout endpoint rejects client-supplied prices", async () => {
    vi.stubEnv("VITE_PAYMENTS_ENABLED", "true");
    const { default: handler } = await import("../api/checkout/create-session.js");
    const response = mockResponse();
    await handler(
      {
        method: "POST",
        headers: { origin: "http://localhost:5173" },
        body: {
          items: [{ productId: "cbd-oil-5", quantity: 1, priceCents: 1 }],
        },
        socket: { remoteAddress: "127.0.0.3" },
      },
      response
    );
    expect(response.statusCode).toBe(400);
  });

  it("webhook rejects a bad signature", async () => {
    vi.doMock("../api/payments/index.js", () => ({
      getPaymentProvider: () => ({
        verifyWebhook: vi.fn().mockRejectedValue(new Error("bad signature")),
      }),
    }));
    const { default: handler } = await import("../api/webhooks/stripe.js");
    const response = mockResponse();
    await handler({ method: "POST", headers: {} }, response);
    expect(response.statusCode).toBe(400);
  });

  it("duplicate payment events do not create a second order", async () => {
    vi.doMock("../api/payments/index.js", () => ({
      getPaymentProvider: () => ({
        verifyWebhook: vi.fn().mockResolvedValue({
          id: "evt_duplicate",
          type: "checkout.session.completed",
          livemode: false,
          data: { object: { id: "cs_test_duplicate" } },
        }),
      }),
    }));
    vi.doMock("../api/repositories/database.js", () => ({
      database: {
        claimPaymentEvent: vi.fn().mockResolvedValue(null),
      },
    }));
    const { default: handler } = await import("../api/webhooks/stripe.js");
    const response = mockResponse();
    await handler({ method: "POST", headers: {} }, response);
    expect(response.statusCode).toBe(200);
    expect(JSON.parse(response.body).duplicate).toBe(true);
  });
});
