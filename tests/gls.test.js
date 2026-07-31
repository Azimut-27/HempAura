import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  GlsApiError,
  GlsClient,
  getGlsPasswordHash,
  getGlsPasswordHashWithAlgorithm,
} from "../server/shipping/glsClient.js";
import {
  getDeliveryAddress,
  splitGlsStreetAddress,
} from "../server/shipping/glsShipment.js";

const clientConfig = {
  baseUrl:
    "https://api.test.mygls.si/ParcelService.svc/json/PrintLabels",
  username: "stakingforge@gmail.com",
  clientNumber: 490007000,
  password: "password",
  passwordHashAlgorithm: "sha256",
  webshopEngine: "HempAura",
  printerType: "A4_2x2",
  printPosition: 1,
  hidePhoneNumberOnLabels: false,
  timeoutMs: 1000,
};

beforeEach(() => {
  vi.restoreAllMocks();
});

describe("GLS Slovenia client", () => {
  it("hashes the password as a SHA-256 integer byte array", () => {
    const bytes = getGlsPasswordHash("password");
    expect(bytes).toHaveLength(32);
    expect(Buffer.from(bytes).toString("hex")).toBe(
      "5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8"
    );
  });

  it("supports SHA-512 password byte arrays for GLS accounts that require it", () => {
    const bytes = getGlsPasswordHashWithAlgorithm("password", "sha512");
    expect(bytes).toHaveLength(64);
    expect(Buffer.from(bytes).toString("hex")).toBe(
      "b109f3bbbc244eb82441917ed06d618b9008dd09b3befd1b5e07394c706a8bb980b1d7785e5976ec049b46df5f1326af5a2ea6d103fd07c95385ffab0cacbc86"
    );
  });

  it("splits a Slovenian delivery address without putting letters in HouseNumber", () => {
    expect(splitGlsStreetAddress("Slovenska cesta 15A", "stanovanje 4")).toEqual(
      {
        street: "Slovenska cesta",
        houseNumber: "15",
        houseNumberInfo: "A, stanovanje 4",
      }
    );
  });

  it("uses billing address as the GLS delivery fallback when shipping is missing", () => {
    const deliveryAddress = getDeliveryAddress({
      public_order_number: "HA-20260731-2BD127",
      customer_name: "Martin Jancar",
      customer_email: "martin@example.com",
      shipping_address_json: null,
      billing_address_json: {
        name: "Martin Jancar",
        line1: "Slovenska cesta 10",
        line2: "",
        postal_code: "1000",
        city: "Ljubljana",
        country: "SI",
        phone: "031123456",
        email: "martin@example.com",
      },
      order_items: [],
    });

    expect(deliveryAddress).toMatchObject({
      Name: "Martin Jancar",
      CountryIsoCode: "SI",
      ZipCode: "1000",
      City: "Ljubljana",
      Street: "Slovenska cesta",
      HouseNumber: "10",
    });
  });

  it("posts a PrintLabels request and decodes the PDF byte array", async () => {
    const pdf = Buffer.from("%PDF-1.7 test");
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: vi.fn().mockResolvedValue({
        Labels: Array.from(pdf),
        PrintLabelsErrorList: [],
        PrintLabelsInfoList: [
          {
            ClientReference: "HA-20260730-ABC123",
            ParcelId: 123,
            ParcelNumber: 456789,
          },
        ],
      }),
    });
    const client = new GlsClient(clientConfig, fetchMock);
    const parcel = {
      ClientNumber: 490007000,
      ClientReference: "HA-20260730-ABC123",
    };

    const result = await client.printLabels([parcel]);
    const request = JSON.parse(fetchMock.mock.calls[0][1].body);

    expect(fetchMock).toHaveBeenCalledWith(
      clientConfig.baseUrl,
      expect.objectContaining({ method: "POST" })
    );
    expect(request.Password).toEqual(
      getGlsPasswordHashWithAlgorithm("password", "sha256")
    );
    expect(request.Password).not.toContain("password");
    expect(request.ParcelList).toEqual([parcel]);
    expect(result.label.equals(pdf)).toBe(true);
    expect(result.labelInfo[0]).toMatchObject({
      parcelId: 123,
      parcelNumber: "456789",
    });
  });

  it("turns a GLS error list into a safe typed error", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: vi.fn().mockResolvedValue({
        Labels: null,
        PrintLabelsErrorList: [
          {
            ErrorCode: 13,
            ErrorDescription: "Parcel validation issue",
            ClientReferenceList: ["HA-20260730-ABC123"],
          },
        ],
        PrintLabelsInfoList: [],
      }),
    });
    const client = new GlsClient(clientConfig, fetchMock);

    await expect(
      client.printLabels([{ ClientNumber: 490007000 }])
    ).rejects.toMatchObject({
      name: "GlsApiError",
      errors: [
        expect.objectContaining({
          code: 13,
          description: "Parcel validation issue",
        }),
      ],
    });
  });

  it("rejects non-Slovenian GLS endpoint hosts", () => {
    expect(
      () =>
        new GlsClient(
          { ...clientConfig, baseUrl: "https://attacker.example/PrintLabels" },
          vi.fn()
        )
    ).toThrow(GlsApiError);
  });
});
