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
    fulfillmentStatus: z.enum(["unfulfilled", "processing", "fulfilled", "cancelled"]),
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
      const orders = await database.listAdminOrders(75);
      sendJson(response, 200, { orders });
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
    const parsed = updateSchema.safeParse(request.body);
    if (!parsed.success) {
      sendJson(response, 400, { message: "Neveljavna sprememba naročila." });
      return;
    }
    try {
      const order = await database.setAdminOrderFulfillmentStatus(
        parsed.data.orderNumber,
        parsed.data.fulfillmentStatus
      );
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

  response.setHeader("Allow", "GET, PATCH");
  sendJson(response, 405, { message: "Metoda ni dovoljena." });
}
