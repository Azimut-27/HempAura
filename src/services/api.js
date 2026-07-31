async function request(path, options = {}) {
  const response = await fetch(path, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(payload.message || "Zahteve trenutno ni bilo mogoče dokončati.");
  }
  return payload;
}

export const submitContact = (data) =>
  request("/api/contact", { method: "POST", body: JSON.stringify(data) });

export const subscribeNewsletter = (data) =>
  request("/api/newsletter/subscribe", {
    method: "POST",
    body: JSON.stringify(data),
  });

export const unsubscribeNewsletter = (data) =>
  request("/api/newsletter/unsubscribe", {
    method: "POST",
    body: JSON.stringify(data),
  });

export const createCheckoutSession = (items, referralCode = "", language = "sl") =>
  request("/api/checkout/create-session", {
    method: "POST",
    body: JSON.stringify({
      items: items.map(({ productId, quantity }) => ({ productId, quantity })),
      ...(referralCode ? { referralCode } : {}),
      language,
    }),
  });

export const getReferralPreview = (code, subtotalCents) =>
  request(
    `/api/referrals/preview?code=${encodeURIComponent(code)}&subtotal_cents=${encodeURIComponent(
      subtotalCents
    )}`
  );

export const getCheckoutStatus = (sessionId) =>
  request(`/api/checkout/status?session_id=${encodeURIComponent(sessionId)}`);

export const getAdminOrders = (token) =>
  request("/api/admin/orders", {
    headers: { Authorization: `Bearer ${token}` },
  });

export const updateAdminOrderStatus = (token, orderNumber, fulfillmentStatus) =>
  request("/api/admin/orders", {
    method: "PATCH",
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify({ orderNumber, fulfillmentStatus }),
  });

export async function downloadAdminGlsLabel(token, orderNumber, retry = false) {
  const response = await fetch("/api/shipping/gls/labels", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ orderNumber, retry }),
  });
  if (!response.ok) {
    const payload = await response.json().catch(() => ({}));
    throw new Error(payload.error || payload.message || "GLS nalepke ni bilo mogoče ustvariti.");
  }
  const blob = await response.blob();
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${orderNumber}-GLS-label.pdf`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}
