import { serverConfig } from "../config/serverConfig.js";
import { StripePaymentProvider } from "./stripeProvider.js";

export function getPaymentProvider() {
  if (serverConfig.paymentProvider === "stripe") return new StripePaymentProvider();
  throw new Error(`Unsupported payment provider: ${serverConfig.paymentProvider}`);
}
