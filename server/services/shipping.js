import { serverConfig } from "../config/serverConfig.js";

export function calculateShipping({ country, subtotalCents }) {
  if (country !== "SI") {
    throw new Error("Dostava v izbrano državo trenutno ni podprta.");
  }
  const standard = serverConfig.shipping.siStandardCents;
  if (!Number.isInteger(standard) || standard < 0) {
    throw new Error("Cena dostave še ni nastavljena.");
  }
  const threshold = serverConfig.shipping.siFreeThresholdCents;
  if (Number.isInteger(threshold) && subtotalCents >= threshold) return 0;
  return standard;
}
