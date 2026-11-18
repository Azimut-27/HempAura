import { z } from "zod";
import { serverConfig } from "../../server/config/serverConfig.js";
import { hasValidBearerToken } from "../../server/lib/adminAuth.js";
import {
  safeError,
  sendJson,
  validateSameOrigin,
} from "../../server/lib/http.js";
import { database } from "../../server/repositories/database.js";

const updateSchema = z
  .object({
    orderNumber: z.string().trim().toUpperCase().regex(/^HA-\d{8}-[A-F0-9]{6}$/),
    fulfillmentStatus: z.enum(["unfulfilled", "processing", "fulfilled", "cancelled"]).optional(),
    paymentStatus: z.enum(["paid", "unpaid", "cod_pending", "proforma_pending", "cancelled", "refunded"]).optional(),
  })
  .strict();

const partnerUpdateSchema = z
  .object({
    partnerId: z.string().uuid(),
    status: z.enum(["pending", "active", "paused", "ended"]).optional(),
    customerDiscountPercent: z.number().min(0).max(100).optional(),
    commissionRatePercent: z.number().min(0).max(100).optional(),
    publicCode: z
      .string()
      .trim()
      .toUpperCase()
      .regex(/^[A-Z0-9][A-Z0-9_-]{2,31}$/)
      .optional(),
    notes: z.string().max(3000).optional(),
  })
  .strict();

const partnerCreateSchema = z
  .object({
    resource: z.literal("partner"),
    displayName: z.string().trim().min(2).max(120),
    contactEmail: z.string().trim().toLowerCase().email().max(254).optional().or(z.literal("")),
    publicCode: z
      .string()
      .trim()
      .toUpperCase()
      .regex(/^[A-Z0-9][A-Z0-9_-]{2,31}$/),
    customerDiscountPercent: z.number().min(0).max(100).default(10),
    commissionRatePercent: z.number().min(0).max(100).default(15),
    status: z.enum(["pending", "active", "paused", "ended"]).default("active"),
    notes: z.string().max(3000).optional().default(""),
  })
  .strict();

export default async function handler(request, response) {
  if (!serverConfig.adminDashboardToken || serverConfig.adminDashboardToken.length < 8) {
    sendJson(response, 503, {
      message: "ADMIN_DASHBOARD_TOKEN ni nastavljen ali je prekratek.",
    });
    return;
  }
  if (!hasValidBearerToken(request, ...(serverConfig.adminDashboardTokens || [serverConfig.adminDashboardToken]))) {
    sendJson(response, 401, { message: "Napačno administratorsko geslo." });
    return;
  }

  if (request.method === "GET") {
    try {
      const [orders, contacts, partners] = await Promise.all([
        database.listAdminOrders(75),
        database.listAdminContactSubmissions(100).catch((err) => {
          safeError(err, "admin-contacts-list");
          return [];
        }),
        database.listAdminReferralPartners(150).catch((err) => {
          safeError(err, "admin-partners-list");
          return [];
        }),
      ]);
      sendJson(response, 200, {
        orders,
        contacts: contacts || [],
        partners: partners || [],
      });
    } catch (error) {
      safeError(error, "admin-orders-list");
      sendJson(response, 500, { message: "Naročil trenutno ni mogoče naložiti." });
    }
    return;
  }

  if (request.method === "POST") {
    if (!validateSameOrigin(request)) {
      sendJson(response, 403, { message: "Zahteva ni dovoljena." });
      return;
    }

    const parsed = partnerCreateSchema.safeParse(request.body);
    if (!parsed.success) {
      sendJson(response, 400, {
        message: "Preveri podatke novega partnerja (ime in koda 3–32 znakov brez presledkov).",
      });
      return;
    }

    try {
      const taken = await database.isReferralCodeTaken(parsed.data.publicCode);
      if (taken) {
        sendJson(response, 409, {
          message: `Promocijska koda ${parsed.data.publicCode} je že zasedena.`,
        });
        return;
      }

      const partner = await database.createPartnerApplication({
        displayName: parsed.data.displayName,
        contactEmail: parsed.data.contactEmail || null,
        publicCode: parsed.data.publicCode,
        customerDiscountPercent: parsed.data.customerDiscountPercent,
        commissionRateBps: Math.round(parsed.data.commissionRatePercent * 100),
        status: parsed.data.status,
        notes: parsed.data.notes || null,
      });
      sendJson(response, 201, { partner });
    } catch (error) {
      const msg = String(error?.message || "").toLowerCase();
      if (msg.includes("duplicate") || msg.includes("unique") || msg.includes("23505")) {
        sendJson(response, 409, { message: "Ta promocijska koda je že zasedena." });
        return;
      }
      safeError(error, "admin-partner-create");
      sendJson(response, 500, { message: "Partnerja ni bilo mogoče dodati." });
    }
    return;
  }

  if (request.method === "PATCH") {
    if (!validateSameOrigin(request)) {
      sendJson(response, 403, { message: "Zahteva ni dovoljena." });
      return;
    }

    if (request.body?.partnerId) {
      const parsedPartner = partnerUpdateSchema.safeParse(request.body);
      if (!parsedPartner.success) {
        sendJson(response, 400, { message: "Neveljavni podatki za posodobitev partnerja." });
        return;
      }
      try {
        const updates = {};
        if (parsedPartner.data.status !== undefined) updates.status = parsedPartner.data.status;
        if (parsedPartner.data.customerDiscountPercent !== undefined) {
          updates.customerDiscountPercent = parsedPartner.data.customerDiscountPercent;
        }
        if (parsedPartner.data.commissionRatePercent !== undefined) {
          updates.commissionRateBps = Math.round(parsedPartner.data.commissionRatePercent * 100);
        }
        if (parsedPartner.data.publicCode !== undefined) {
          updates.publicCode = parsedPartner.data.publicCode;
        }
        if (parsedPartner.data.notes !== undefined) updates.notes = parsedPartner.data.notes;

        const partner = await database.updateAdminReferralPartner(
          parsedPartner.data.partnerId,
          updates
        );
        if (!partner) {
          sendJson(response, 404, { message: "Partner ni bil najden." });
          return;
        }
        sendJson(response, 200, { partner });
      } catch (error) {
        const msg = String(error?.message || "").toLowerCase();
        if (msg.includes("duplicate") || msg.includes("unique") || msg.includes("23505")) {
          sendJson(response, 409, { message: "Ta promocijska koda je že zasedena." });
          return;
        }
        safeError(error, "admin-partner-update");
        sendJson(response, 500, { message: "Partnerja ni bilo mogoče posodobiti." });
      }
      return;
    }

    if (request.body?.contactId) {
      const { contactId, status } = request.body;
      const validStatuses = ["new", "read", "replied", "archived"];
      if (!contactId || !validStatuses.includes(status)) {
        sendJson(response, 400, { message: "Neveljaven status sporočila." });
        return;
      }
      try {
        const contact = await database.setAdminContactSubmissionStatus(contactId, status);
        sendJson(response, 200, { contact });
      } catch (error) {
        safeError(error, "admin-contact-status-update");
        sendJson(response, 500, { message: "Statusa sporočila ni bilo mogoče posodobiti." });
      }
      return;
    }

    const parsed = updateSchema.safeParse(request.body);
    if (!parsed.success) {
      sendJson(response, 400, { message: "Neveljavna sprememba naročila." });
      return;
    }
    try {
      let order = null;
      if (parsed.data.fulfillmentStatus) {
        order = await database.setAdminOrderFulfillmentStatus(
          parsed.data.orderNumber,
          parsed.data.fulfillmentStatus
        );
      }
      if (parsed.data.paymentStatus) {
        order = await database.setAdminOrderPaymentStatus(
          parsed.data.orderNumber,
          parsed.data.paymentStatus
        );
      }
      if (!order) {
        sendJson(response, 404, { message: "Naročilo ni bilo najdeno." });
        return;
      }
      sendJson(response, 200, { order });
    } catch (error) {
      safeError(error, "admin-order-update");
      sendJson(response, 500, { message: "Statusa naročila ni bilo mogoče posodobiti." });
    }
    return;
  }

  if (request.method === "DELETE") {
    if (!validateSameOrigin(request)) {
      sendJson(response, 403, { message: "Zahteva ni dovoljena." });
      return;
    }

    const partnerId = request.body?.partnerId || request.query?.partnerId;
    if (partnerId) {
      try {
        const deleted = await database.deleteAdminReferralPartner(partnerId);
        if (!deleted) {
          sendJson(response, 404, { message: "Partner ni bil najden." });
          return;
        }
        sendJson(response, 200, { success: true, partnerId });
      } catch (error) {
        const msg = String(error?.message || "").toLowerCase();
        if (msg.includes("foreign key") || msg.includes("23503")) {
          sendJson(response, 409, {
            message:
              "Partnerja z zabeleženimi naročili ni mogoče izbrisati; namesto tega mu spremeni status v 'Zaključeno'.",
          });
          return;
        }
        safeError(error, "admin-partner-delete");
        sendJson(response, 500, { message: "Partnerja ni bilo mogoče izbrisati." });
      }
      return;
    }

    const contactId = request.body?.contactId || request.query?.contactId;
    if (contactId) {
      try {
        await database.deleteAdminContactSubmission(contactId);
        sendJson(response, 200, { success: true, contactId });
      } catch (error) {
        safeError(error, "admin-contact-delete");
        sendJson(response, 500, { message: "Sporočila ni bilo mogoče izbrisati." });
      }
      return;
    }

    const orderNumber = request.body?.orderNumber || request.query?.orderNumber;
    if (!orderNumber || !/^HA-\d{8}-[A-F0-9]{6}$/.test(String(orderNumber).trim().toUpperCase())) {
      sendJson(response, 400, { message: "Neveljavna številka naročila za izbris." });
      return;
    }
    try {
      const deleted = await database.deleteAdminOrder(String(orderNumber).trim().toUpperCase());
      if (!deleted) {
        sendJson(response, 404, { message: "Naročilo ni bilo najdeno." });
        return;
      }
      sendJson(response, 200, { success: true, orderNumber });
    } catch (error) {
      safeError(error, "admin-order-delete");
      sendJson(response, 500, { message: "Naročila ni bilo mogoče izbrisati." });
    }
    return;
  }

  response.setHeader("Allow", "GET, POST, PATCH, DELETE");
  sendJson(response, 405, { message: "Metoda ni dovoljena." });
}
