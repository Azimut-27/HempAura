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

export const createCheckoutSession = (items) =>
  request("/api/checkout/create-session", {
    method: "POST",
    body: JSON.stringify({
      items: items.map(({ productId, quantity }) => ({ productId, quantity })),
    }),
  });

export const getCheckoutStatus = (sessionId) =>
  request(`/api/checkout/status?session_id=${encodeURIComponent(sessionId)}`);
