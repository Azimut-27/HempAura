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

export default async function handler(request, response) {
  if (!serverConfig.adminDashboardToken || serverConfig.adminDashboardToken.length < 32) {
    sendJson(response, 503, {
      message: "ADMIN_DASHBOARD_TOKEN ni nastavljen ali je prekratek.",
    });
    return;
  }
  if (!hasValidBearerToken(request, serverConfig.adminDashboardToken)) {
    sendJson(response, 401, { message: "Napačen administratorski ključ." });
    return;
  }

  if (request.method === "GET") {
    try {
      const [orders, contacts] = await Promise.all([
        database.listAdminOrders(75),
        database.listAdminContactSubmissions(100).catch((err) => {
          safeError(err, "admin-contacts-list");
          return [];
        }),
      ]);
      sendJson(response, 200, { orders, contacts: contacts || [] });
    } catch (error) {
      safeError(error, "admin-orders-list");
      sendJson(response, 500, { message: "Naročil trenutno ni mogoče naložiti." });
    }
    return;
  }

  if (request.method === "PATCH") {
    if (!validateSameOrigin(request)) {
      sendJson(response, 403, { message: "Zahteva ni dovoljena." });
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

  response.setHeader("Allow", "GET, PATCH, DELETE");
  sendJson(response, 405, { message: "Metoda ni dovoljena." });
}
