import { serverConfig } from "../config/serverConfig.js";
import { getServerProduct } from "../data/serverProducts.js";
import { generateOrderNumber } from "../lib/orderNumber.js";
import {
  getClientIp,
  requireMethod,
  safeError,
  sendJson,
  validateSameOrigin,
} from "../lib/http.js";
import { rateLimit } from "../lib/rateLimit.js";
import { checkoutSchema } from "../lib/validation.js";
import { getPaymentProvider } from "../payments/index.js";
import { calculateShipping } from "../services/shipping.js";

export default async function handler(request, response) {
  if (!requireMethod(request, response, "POST")) return;
  if (!validateSameOrigin(request)) {
    sendJson(response, 403, { message: "Zahteve ni mogoče obdelati." });
    return;
  }
  if (!serverConfig.paymentsEnabled) {
    sendJson(response, 503, {
      message: "Prodaja še ni odprta. Plačilo ni bilo ustvarjeno.",
    });
    return;
  }

  const ip = getClientIp(request);
  const limit = rateLimit(`checkout:${ip}`, serverConfig.checkoutRateLimit);
  if (!limit.allowed) {
    response.setHeader("Retry-After", limit.retryAfterSeconds);
    sendJson(response, 429, { message: "Preveč poskusov. Poskusi znova pozneje." });
    return;
  }

  const parsed = checkoutSchema.safeParse(request.body);
  if (!parsed.success) {
    sendJson(response, 400, { message: "Košarica vsebuje neveljavne podatke." });
    return;
  }

  try {
    const items = parsed.data.items.map((line) => {
      const product = getServerProduct(line.productId);
      if (!product) throw new Error("Unknown product.");
      if (!product.active) throw new Error("Inactive product.");
      if (!Number.isInteger(product.priceCents) || product.priceCents < 0) {
        throw new Error("Product price is not configured.");
      }
      if (line.quantity > product.stock) throw new Error("Insufficient stock.");
      return {
        productId: product.id,
        name: product.name,
        sku: product.sku,
        quantity: line.quantity,
        unitPriceCents: product.priceCents,
      };
    });

    const subtotalCents = items.reduce(
      (sum, item) => sum + item.unitPriceCents * item.quantity,
      0
    );
    const shippingCents = calculateShipping({
      country: serverConfig.businessCountry,
      subtotalCents,
    });
    const provider = getPaymentProvider();
    const session = await provider.createCheckoutSession({
      orderReference: generateOrderNumber(),
      items,
      subtotalCents,
      shippingCents,
      currency: "EUR",
    });
    sendJson(response, 200, { id: session.id, url: session.url });
  } catch (error) {
    safeError(error, "checkout-create");
    sendJson(response, 400, {
      message: "Plačila ni bilo mogoče pripraviti. Preveri košarico ali poskusi pozneje.",
    });
  }
}
