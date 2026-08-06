import { escapeHtml } from "../lib/http.js";

function layout(title, body) {
  return `<!doctype html>
  <html lang="sl">
    <body style="margin:0;background:#f7f1e7;color:#1c211d;font-family:Arial,sans-serif">
      <div style="max-width:640px;margin:0 auto;padding:32px 20px">
        <div style="background:#17382c;color:#fffaf1;padding:24px;font-size:28px;font-family:Georgia,serif">HerbaGallus</div>
        <div style="background:#fffaf1;padding:28px">
          <h1 style="color:#17382c;font-family:Georgia,serif;font-size:32px">${escapeHtml(title)}</h1>
          ${body}
        </div>
      </div>
    </body>
  </html>`;
}

const p = (value) =>
  `<p style="font-size:15px;line-height:1.7">${escapeHtml(value)}</p>`;

function orderItemsList(items = []) {
  if (!items.length) return "";
  const rows = items
    .map(
      (item) =>
        `<li style="margin:0 0 8px">${escapeHtml(item.name)} × ${escapeHtml(
          String(item.quantity)
        )}</li>`
    )
    .join("");
  return `<ul style="font-size:15px;line-height:1.6;padding-left:20px">${rows}</ul>`;
}

export function ContactNotificationEmail(data) {
  const reply = `mailto:${encodeURIComponent(data.email)}?subject=${encodeURIComponent(
    `Re: ${data.subject}`
  )}`;
  return layout(
    "Novo kontaktno sporočilo",
    [
      p(`Čas: ${data.submittedAt}`),
      p(`Ime: ${data.name}`),
      p(`E-pošta: ${data.email}`),
      p(`Naročilo: ${data.orderNumber || "ni navedeno"}`),
      p(`Zadeva: ${data.subject}`),
      `<div style="white-space:pre-wrap;border-left:3px solid #b99552;padding:12px">${escapeHtml(data.message)}</div>`,
      `<p><a href="${reply}" style="color:#17382c;font-weight:bold">Odgovori stranki</a></p>`,
    ].join("")
  );
}

export function ContactAcknowledgementEmail(data) {
  return layout(
    "Prejeli smo tvoje sporočilo",
    [
      p(`Hvala, ${data.name}. Tvoje sporočilo smo prejeli.`),
      p(`Zadeva: ${data.subject}`),
      p(`Predviden čas odgovora: ${data.responseTime}.`),
      p(`Za dodatno pomoč piši na ${data.supportEmail}.`),
      p("Ekipa ne daje zdravstvenih nasvetov. Za zdravstvena vprašanja se obrni na ustreznega strokovnjaka."),
    ].join("")
  );
}

export function ContactNotificationText(data) {
  return [
    "HerbaGallus — novo kontaktno sporočilo",
    "",
    `Čas: ${data.submittedAt}`,
    `Ime: ${data.name}`,
    `E-pošta: ${data.email}`,
    `Naročilo: ${data.orderNumber || "ni navedeno"}`,
    `Zadeva: ${data.subject}`,
    "",
    data.message,
  ].join("\n");
}

export function ContactAcknowledgementText(data) {
  return [
    `Hvala, ${data.name}. Tvoje sporočilo smo prejeli.`,
    "",
    `Zadeva: ${data.subject}`,
    `Predviden čas odgovora: ${data.responseTime}.`,
    `Za dodatno pomoč piši na ${data.supportEmail}.`,
    "",
    "Ekipa ne daje zdravstvenih nasvetov. Za zdravstvena vprašanja se obrni na ustreznega strokovnjaka.",
  ].join("\n");
}

export function NewsletterConfirmationEmail({ confirmationUrl }) {
  return layout(
    "Potrdi prijavo na HerbaGallus novice",
    [
      p("Za dokončanje prijave potrdi svoj e-poštni naslov."),
      `<p><a href="${escapeHtml(confirmationUrl)}" style="display:inline-block;background:#17382c;color:#fffaf1;padding:14px 20px;text-decoration:none;font-weight:bold">Potrdi prijavo</a></p>`,
      p("Če se nisi prijavil/-a, sporočilo preprosto prezri."),
    ].join("")
  );
}

export function OrderConfirmationEmail({
  name,
  orderNumber,
  items,
  shipping,
  total,
  supportEmail,
}) {
  return layout(
    "Plačilo je potrjeno",
    [
      p(`Pozdravljen/-a${name ? ` ${name}` : ""}, hvala za naročilo.`),
      p(`Številka naročila: ${orderNumber}`),
      orderItemsList(items),
      p(`Dostava: ${shipping}.`),
      p(`Skupaj: ${total}.`),
      p("Ko bo naročilo odpremljeno, boš prejel/-a novo obvestilo."),
      p(`Za pomoč piši na ${supportEmail}.`),
    ].join("")
  );
}

export function NewOrderNotificationEmail({
  orderNumber,
  customerEmail,
  items,
  shipping,
  total,
}) {
  return layout(
    "Novo plačano naročilo",
    [
      p(`Naročilo: ${orderNumber}`),
      p(`Stranka: ${customerEmail}`),
      orderItemsList(items),
      p(`Dostava: ${shipping}.`),
      p(`Skupaj: ${total}.`),
    ].join("")
  );
}

export function ShippingUpdateEmail() {
  return layout(
    "Posodobitev dostave",
    p("TODO(owner): pred uporabo poveži potrjene podatke o pošiljki in dostavnem partnerju.")
  );
}
