import { createHash } from "node:crypto";
import { serverConfig } from "../config/serverConfig.js";

function requiredText(value, fieldName) {
  const normalized = String(value || "").trim();
  if (!normalized) throw new Error(`${fieldName} is required for GLS.`);
  return normalized;
}

function optionalText(value) {
  const normalized = String(value || "").trim();
  return normalized || null;
}

export function splitGlsStreetAddress(line1, line2 = "") {
  const normalized = requiredText(line1, "Delivery street").replace(
    /\s+/g,
    " "
  );
  const match = normalized.match(/^(.+?)\s+(\d+)(.*)$/u);
  if (!match) {
    throw new Error(
      "Delivery address must contain a street name and numeric house number."
    );
  }

  const street = match[1].trim();
  const houseNumber = match[2];
  const suffix = match[3].trim();
  const houseNumberInfo = [suffix, optionalText(line2)]
    .filter(Boolean)
    .join(", ");

  return {
    street: requiredText(street, "Delivery street"),
    houseNumber,
    houseNumberInfo: houseNumberInfo || null,
  };
}

function getPickupAddress() {
  const pickup = serverConfig.gls.pickupAddress;
  if (!/^\d+$/.test(pickup.houseNumber)) {
    throw new Error(
      "GLS_PICKUP_HOUSE_NUMBER must contain digits only; put additions in GLS_PICKUP_HOUSE_NUMBER_INFO."
    );
  }
  return {
    Name: requiredText(pickup.name, "GLS_PICKUP_NAME"),
    CountryIsoCode: requiredText(
      pickup.countryIsoCode,
      "GLS_PICKUP_COUNTRY"
    ).toUpperCase(),
    ZipCode: requiredText(pickup.zipCode, "GLS_PICKUP_ZIP"),
    City: requiredText(pickup.city, "GLS_PICKUP_CITY"),
    Street: requiredText(pickup.street, "GLS_PICKUP_STREET"),
    HouseNumber: pickup.houseNumber,
    HouseNumberInfo: optionalText(pickup.houseNumberInfo),
    ContactName: optionalText(pickup.contactName),
    ContactPhone: optionalText(pickup.contactPhone),
    ContactEmail: optionalText(pickup.contactEmail),
  };
}

export function getDeliveryAddress(order) {
  const address = order.shipping_address_json || order.billing_address_json;
  if (!address || typeof address !== "object") {
    throw new Error("Order does not contain a shipping or billing address.");
  }
  const street = splitGlsStreetAddress(address.line1, address.line2);
  const country = requiredText(
    address.country,
    "Delivery country"
  ).toUpperCase();
  if (country !== "SI") {
    throw new Error("Only Slovenian GLS deliveries are enabled.");
  }

  return {
    Name: requiredText(
      address.name || order.customer_name,
      "Delivery recipient name"
    ),
    CountryIsoCode: country,
    ZipCode: requiredText(address.postal_code, "Delivery postal code"),
    City: requiredText(address.city, "Delivery city"),
    Street: street.street,
    HouseNumber: street.houseNumber,
    HouseNumberInfo: street.houseNumberInfo,
    ContactName: optionalText(address.name || order.customer_name),
    ContactPhone: optionalText(address.phone),
    ContactEmail: optionalText(address.email || order.customer_email),
  };
}

function parcelContent(order) {
  const itemNames = (order.order_items || [])
    .map((item) => item.sku_snapshot || item.name_snapshot)
    .filter(Boolean);
  return [`HempAura ${order.public_order_number}`, ...itemNames]
    .join(" | ")
    .slice(0, 100);
}

export function buildGlsParcel(order) {
  if (!order?.public_order_number) {
    throw new Error("A valid paid order is required.");
  }
  return {
    ClientNumber: serverConfig.gls.clientNumber,
    ClientReference: order.public_order_number,
    Count: 1,
    Content: parcelContent(order),
    PickupAddress: getPickupAddress(),
    DeliveryAddress: getDeliveryAddress(order),
    ServiceList: [],
  };
}

export function getGlsEnvironment() {
  return new URL(serverConfig.gls.baseUrl).hostname.startsWith("api.test.")
    ? "test"
    : "live";
}

export function getGlsRequestFingerprint(order) {
  const parcel = buildGlsParcel(order);
  return createHash("sha256")
    .update(JSON.stringify(parcel))
    .digest("hex");
}
