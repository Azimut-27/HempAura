import { timingSafeEqual } from "node:crypto";
import { z } from "zod";
import { serverConfig } from "../../../server/config/serverConfig.js";
import { safeError, sendJson } from "../../../server/lib/http.js";
import { database } from "../../../server/repositories/database.js";
import {
  GlsApiError,
  GlsClient,
} from "../../../server/shipping/glsClient.js";
import {
  buildGlsParcel,
  getGlsEnvironment,
  getGlsRequestFingerprint,
} from "../../../server/shipping/glsShipment.js";

const requestSchema = z
  .object({
    orderNumber: z
      .string()
      .trim()
      .toUpperCase()
      .regex(/^HA-\d{8}-[A-F0-9]{6}$/),
    retry: z.boolean().optional().default(false),
  })
  .strict();

function hasValidAdminToken(request) {
  const expected = serverConfig.gls.adminToken;
  if (!expected || expected.length < 32) return false;
  const authorization = request.headers.authorization || "";
  if (!authorization.startsWith("Bearer ")) return false;
  const provided = authorization.slice(7);
  const expectedBuffer = Buffer.from(expected);
  const providedBuffer = Buffer.from(provided);
  return (
    expectedBuffer.length === providedBuffer.length &&
    timingSafeEqual(expectedBuffer, providedBuffer)
  );
}

function sendLabel(response, orderNumber, labelBase64, parcelNumber) {
  const label = Buffer.from(labelBase64, "base64");
  response.status(200);
  response.setHeader("Content-Type", "application/pdf");
  response.setHeader("Content-Length", String(label.length));
  response.setHeader(
    "Content-Disposition",
    `attachment; filename="${orderNumber}-GLS-label.pdf"`
  );
  response.setHeader("Cache-Control", "private, no-store");
  if (parcelNumber) response.setHeader("X-GLS-Parcel-Number", parcelNumber);
  response.end(label);
}

export default async function handler(request, response) {
  if (request.method !== "POST") {
    response.setHeader("Allow", "POST");
    sendJson(response, 405, { message: "Method not allowed." });
    return;
  }
  if (!serverConfig.gls.adminToken || serverConfig.gls.adminToken.length < 32) {
    sendJson(response, 503, {
      message: "GLS_ADMIN_TOKEN must be configured with at least 32 characters.",
    });
    return;
  }
  if (!hasValidAdminToken(request)) {
    sendJson(response, 401, { message: "Invalid GLS administrator token." });
    return;
  }

  const parsed = requestSchema.safeParse(request.body);
  if (!parsed.success) {
    sendJson(response, 400, { message: "Invalid GLS label request." });
    return;
  }

  let shipment;
  try {
    const order = await database.getPaidOrderForGls(parsed.data.orderNumber);
    if (!order) {
      sendJson(response, 404, { message: "Order not found." });
      return;
    }
    if (order.payment_status !== "paid") {
      sendJson(response, 409, {
        message: "A GLS label can only be created for a paid order.",
      });
      return;
    }

    const requestFingerprint = getGlsRequestFingerprint(order);
    shipment = await database.claimGlsShipment(
      {
        orderId: order.id,
        environment: getGlsEnvironment(),
        clientReference: order.public_order_number,
        requestFingerprint,
      },
      parsed.data.retry
    );

    if (!shipment.claimed) {
      if (shipment.status === "label_created" && shipment.label_pdf_base64) {
        sendLabel(
          response,
          order.public_order_number,
          shipment.label_pdf_base64,
          shipment.parcel_number
        );
        return;
      }
      sendJson(response, 409, {
        message:
          shipment.status === "failed"
            ? "The previous GLS attempt failed. Retry with retry=true after correcting the cause."
            : "A GLS label request for this order is already being processed.",
        status: shipment.status,
        error: shipment.error_message || null,
      });
      return;
    }

    const client = new GlsClient(serverConfig.gls);
    const result = await client.printLabels([buildGlsParcel(order)]);
    const parcel = result.labelInfo[0];
    const labelBase64 = result.label.toString("base64");
    await database.updateGlsShipment(shipment.id, {
      status: "label_created",
      parcel_id: parcel.parcelId,
      parcel_number: parcel.parcelNumber,
      label_mime_type: "application/pdf",
      label_pdf_base64: labelBase64,
      error_code: null,
      error_message: null,
      label_created_at: new Date().toISOString(),
      label_expires_at: new Date(
        Date.now() + 90 * 24 * 60 * 60 * 1000
      ).toISOString(),
    });
    await database.updateOrderFulfillmentStatus(order.id, "processing");
    sendLabel(
      response,
      order.public_order_number,
      labelBase64,
      parcel.parcelNumber
    );
  } catch (error) {
    safeError(error, "gls-print-label");
    if (shipment?.id) {
      try {
        await database.updateGlsShipment(shipment.id, {
          status: "failed",
          error_code:
            error instanceof GlsApiError && error.errors[0]?.code
              ? error.errors[0].code
              : null,
          error_message: String(error?.message || "GLS label failed.").slice(
            0,
            500
          ),
        });
      } catch (databaseError) {
        safeError(databaseError, "gls-print-label-update");
      }
    }
    sendJson(response, error instanceof GlsApiError ? 502 : 500, {
      message:
        error instanceof GlsApiError
          ? "GLS rejected or could not complete the label request."
          : "The GLS label could not be created.",
      error: String(error?.message || "Unknown error").slice(0, 500),
    });
  }
}

