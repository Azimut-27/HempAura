import { createHash } from "node:crypto";

const ALLOWED_GLS_HOSTS = new Set(["api.test.mygls.si", "api.mygls.si"]);
const ALLOWED_PRINTER_TYPES = new Set([
  "A4_2x2",
  "A4_4x1",
  "Connect",
  "Thermo",
  "ShipItThermoPdf",
]);

export function getGlsPasswordHash(password) {
  const hash = createHash("sha256").update(password).digest();
  return Array.from(hash);
}

export class GlsApiError extends Error {
  constructor(message, { status = null, errors = [], cause } = {}) {
    super(message, { cause });
    this.name = "GlsApiError";
    this.status = status;
    this.errors = errors;
  }
}

function assertGlsEndpoint(baseUrl) {
  let url;
  try {
    url = new URL(baseUrl);
  } catch {
    throw new GlsApiError("GLS_BASE_URL is not a valid URL.");
  }
  if (
    url.protocol !== "https:" ||
    !ALLOWED_GLS_HOSTS.has(url.hostname) ||
    url.pathname !== "/ParcelService.svc/json/PrintLabels"
  ) {
    throw new GlsApiError(
      "GLS_BASE_URL must use the Slovenian MyGLS PrintLabels HTTPS endpoint."
    );
  }
  return url.toString();
}

function assertClientConfig(config) {
  const missing = [];
  if (!config.username) missing.push("GLS_USERNAME");
  if (!Number.isInteger(config.clientNumber)) missing.push("GLS_CLIENT_NUMBER");
  if (!config.password) missing.push("GLS_PASSWORD");
  if (missing.length) {
    throw new GlsApiError(`Missing GLS configuration: ${missing.join(", ")}`);
  }
  if (!ALLOWED_PRINTER_TYPES.has(config.printerType)) {
    throw new GlsApiError("GLS_PRINTER_TYPE is not supported.");
  }
  if (
    !Number.isInteger(config.printPosition) ||
    config.printPosition < 1 ||
    config.printPosition > 4
  ) {
    throw new GlsApiError("GLS_PRINT_POSITION must be between 1 and 4.");
  }
}

function decodeLabel(labels) {
  if (Array.isArray(labels)) {
    if (
      labels.length === 0 ||
      labels.some(
        (value) => !Number.isInteger(value) || value < 0 || value > 255
      )
    ) {
      throw new GlsApiError("GLS returned an invalid label byte array.");
    }
    return Buffer.from(labels);
  }
  if (typeof labels === "string" && labels.length > 0) {
    return Buffer.from(labels, "base64");
  }
  throw new GlsApiError("GLS did not return a printable label.");
}

function normalizeErrors(errors) {
  if (!Array.isArray(errors)) return [];
  return errors.map((error) => ({
    code: Number.isInteger(error?.ErrorCode) ? error.ErrorCode : null,
    description: String(error?.ErrorDescription || "Unknown GLS error").slice(
      0,
      500
    ),
    clientReferences: Array.isArray(error?.ClientReferenceList)
      ? error.ClientReferenceList.map(String)
      : [],
  }));
}

export class GlsClient {
  constructor(config, fetchImplementation = globalThis.fetch) {
    assertClientConfig(config);
    if (typeof fetchImplementation !== "function") {
      throw new GlsApiError("A fetch implementation is required.");
    }
    this.config = config;
    this.endpoint = assertGlsEndpoint(config.baseUrl);
    this.fetch = fetchImplementation;
  }

  async printLabels(parcelList) {
    if (!Array.isArray(parcelList) || parcelList.length === 0) {
      throw new GlsApiError("At least one GLS parcel is required.");
    }

    const controller = new AbortController();
    const timeout = setTimeout(
      () => controller.abort(),
      this.config.timeoutMs || 15_000
    );

    let response;
    try {
      response = await this.fetch(this.endpoint, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json; charset=utf-8",
        },
        body: JSON.stringify({
          Username: this.config.username,
          Password: getGlsPasswordHash(this.config.password),
          WebshopEngine: this.config.webshopEngine,
          ParcelList: parcelList,
          PrintPosition: this.config.printPosition,
          ShowPrintDialog: false,
          TypeOfPrinter: this.config.printerType,
          HidePhoneNumberOnLabels: this.config.hidePhoneNumberOnLabels,
        }),
        signal: controller.signal,
      });
    } catch (error) {
      const message =
        error?.name === "AbortError"
          ? "GLS request timed out."
          : "GLS request failed.";
      throw new GlsApiError(message, { cause: error });
    } finally {
      clearTimeout(timeout);
    }

    let payload;
    try {
      payload = await response.json();
    } catch (error) {
      throw new GlsApiError("GLS returned a non-JSON response.", {
        status: response.status,
        cause: error,
      });
    }

    const errors = normalizeErrors(payload?.PrintLabelsErrorList);
    if (!response.ok || errors.length > 0) {
      const details = errors
        .map((error) => `${error.code ?? "?"}: ${error.description}`)
        .join("; ");
      throw new GlsApiError(
        details || `GLS returned HTTP ${response.status}.`,
        { status: response.status, errors }
      );
    }

    const label = decodeLabel(payload?.Labels);
    const labelInfo = Array.isArray(payload?.PrintLabelsInfoList)
      ? payload.PrintLabelsInfoList
      : [];
    if (labelInfo.length === 0) {
      throw new GlsApiError("GLS returned no parcel information.");
    }

    return {
      label,
      labelInfo: labelInfo.map((info) => ({
        clientReference: String(info?.ClientReference || ""),
        parcelId: Number.isInteger(info?.ParcelId)
          ? info.ParcelId
          : Number(info?.ParcelId),
        parcelNumber: String(info?.ParcelNumber || ""),
      })),
    };
  }
}
