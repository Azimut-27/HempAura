import crypto from "node:crypto";
import { serverConfig } from "../config/serverConfig.js";

export function generateOrderNumber(date = new Date()) {
  const stamp = date.toISOString().slice(0, 10).replaceAll("-", "");
  const random = crypto.randomBytes(3).toString("hex").toUpperCase();
  return `${serverConfig.orderNumberPrefix}-${stamp}-${random}`;
}
