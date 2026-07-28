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
  it("accepts same-origin Vercel requests when site URL is not configured", async () => {
    const { validateSameOrigin } = await import("../server/lib/http.js");
    expect(
      validateSameOrigin({
        headers: {
          origin: "https://hemp-aura.vercel.app",
          host: "hemp-aura.vercel.app",
          "x-forwarded-proto": "https",
        },
      })
    ).toBe(true);
  });

  it("rejects cross-origin requests", async () => {
    const { validateSameOrigin } = await import("../server/lib/http.js");
    expect(
      validateSameOrigin({
        headers: {
          origin: "https://attacker.example",
          host: "hemp-aura.vercel.app",
          "x-forwarded-proto": "https",
        },
      })
    ).toBe(false);
  });

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

  it("contact endpoint sends the owner email without Supabase or a public domain", async () => {
    const sendEmail = vi.fn().mockResolvedValue({ id: "email_test" });
    vi.doMock("../server/services/email.js", () => ({ sendEmail }));
    const { default: handler } = await import("../api/contact.js");
    const response = mockResponse();
    await handler(
      {
        method: "POST",
        headers: { origin: "http://localhost:5173" },
        body: {
          name: "Martin Jancar",
          email: "martin@example.com",
          subject: "Vprasanje",
          message: "Zanima me vec informacij o izdelku.",
          consent: true,
          website: "",
        },
        socket: { remoteAddress: "127.0.0.9" },
      },
      response
    );
    expect(response.statusCode).toBe(200);
    expect(sendEmail).toHaveBeenCalledTimes(1);
    expect(sendEmail).toHaveBeenCalledWith(
      expect.objectContaining({
        replyTo: "martin@example.com",
        to: "stakingforge@gmail.com",
      })
    );
  });

  it("contact endpoint sends customer acknowledgement only when enabled", async () => {
    vi.stubEnv("RESEND_FROM_EMAIL", "HempAura <noreply@example.com>");
    vi.stubEnv("CONTACT_CUSTOMER_ACK_ENABLED", "true");
    const sendEmail = vi.fn().mockResolvedValue({ id: "email_test" });
    vi.doMock("../server/services/email.js", () => ({ sendEmail }));
    const { default: handler } = await import("../api/contact.js");
    const response = mockResponse();
    await handler(
      {
        method: "POST",
        headers: { origin: "http://localhost:5173" },
        body: {
          name: "Martin Jancar",
          email: "martin@example.com",
          subject: "Vprasanje",
          message: "Zanima me vec informacij o izdelku.",
          consent: true,
          website: "",
        },
        socket: { remoteAddress: "127.0.0.10" },
      },
      response
    );
    expect(response.statusCode).toBe(200);
    expect(sendEmail).toHaveBeenCalledTimes(2);
  });

  it("newsletter endpoint returns an already-subscribed state", async () => {
    vi.doMock("../server/repositories/database.js", () => ({
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
          items: [
            {
              productId: "hempaura-cbd-kapljice-5",
              quantity: 1,
              priceCents: 1,
            },
          ],
        },
        socket: { remoteAddress: "127.0.0.3" },
      },
      response
    );
    expect(response.statusCode).toBe(400);
  });

  it("webhook rejects a bad signature", async () => {
    vi.doMock("../server/payments/index.js", () => ({
      getPaymentProvider: () => ({
        verifyWebhook: vi.fn().mockRejectedValue(new Error("bad signature")),
      }),
    }));
    const { default: handler } = await import("../api/webhooks/stripe.js");
    const response = mockResponse();
    await handler({ method: "POST", headers: {} }, response);
    expect(response.statusCode).toBe(400);
  });

  it("stores a paid order and sends idempotent customer and owner emails", async () => {
    const event = {
      id: "evt_paid",
      type: "checkout.session.completed",
      livemode: false,
      data: { object: { id: "cs_test_paid" } },
    };
    const payment = {
      sessionId: "cs_test_paid",
      paymentId: "pi_test_paid",
      paymentStatus: "paid",
      customerEmail: "martin@example.com",
      customerName: "Martin",
      shippingAddress: { country: "SI" },
      billingAddress: { country: "SI" },
      currency: "EUR",
      totalCents: 3490,
      subtotalCents: 3100,
      shippingCents: 390,
      taxCents: 0,
      orderReference: "HA-20260728-ABC123",
      cart: [{ productId: "hempaura-cbd-kapljice-5", quantity: 1 }],
    };
    vi.doMock("../server/payments/index.js", () => ({
      getPaymentProvider: () => ({
        verifyWebhook: vi.fn().mockResolvedValue(event),
        retrievePayment: vi.fn().mockResolvedValue(event.data.object),
        normalizePaymentEvent: vi.fn().mockReturnValue(payment),
      }),
    }));
    const database = {
      claimPaymentEvent: vi.fn().mockResolvedValue({ id: "payment_event" }),
      getOrderByProviderSession: vi.fn().mockResolvedValue(null),
      createOrderWithItems: vi.fn().mockResolvedValue({
        id: "3dbf0c82-376f-43e7-a469-cf5653a596a8",
        public_order_number: payment.orderReference,
      }),
      claimOrderEmailDelivery: vi
        .fn()
        .mockImplementation((_orderId, kind) => ({ id: `delivery-${kind}` })),
      updateOrderEmailDelivery: vi.fn().mockResolvedValue({}),
      updatePaymentEvent: vi.fn().mockResolvedValue({}),
    };
    vi.doMock("../server/repositories/database.js", () => ({ database }));
    const sendEmail = vi.fn().mockResolvedValue({ id: "email_test" });
    vi.doMock("../server/services/email.js", () => ({
      isEmailConfigured: () => true,
      sendEmail,
    }));

    const { default: handler } = await import("../api/webhooks/stripe.js");
    const response = mockResponse();
    await handler({ method: "POST", headers: {} }, response);

    expect(response.statusCode).toBe(200);
    expect(database.createOrderWithItems).toHaveBeenCalledTimes(1);
    expect(sendEmail).toHaveBeenCalledTimes(2);
    expect(sendEmail).toHaveBeenCalledWith(
      expect.objectContaining({
        to: "martin@example.com",
        idempotencyKey:
          "hempaura-customer_confirmation-3dbf0c82-376f-43e7-a469-cf5653a596a8",
      })
    );
    expect(database.updatePaymentEvent).toHaveBeenCalledWith("evt_paid", {
      processed_at: expect.any(String),
      status: "processed",
    });
  });

  it("duplicate payment events do not create a second order", async () => {
    vi.doMock("../server/payments/index.js", () => ({
      getPaymentProvider: () => ({
        verifyWebhook: vi.fn().mockResolvedValue({
          id: "evt_duplicate",
          type: "checkout.session.completed",
          livemode: false,
          data: { object: { id: "cs_test_duplicate" } },
        }),
      }),
    }));
    vi.doMock("../server/repositories/database.js", () => ({
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
