import { timingSafeEqual } from "node:crypto";

export function hasValidBearerToken(request, ...expectedTokens) {
  const authorization = request.headers.authorization || "";
  if (!authorization.startsWith("Bearer ")) return false;

  const provided = authorization.slice(7);
  return expectedTokens.some((expected) => {
    if (!expected || expected.length < 32) return false;
    const expectedBuffer = Buffer.from(expected);
    const providedBuffer = Buffer.from(provided);
    return (
      expectedBuffer.length === providedBuffer.length &&
      timingSafeEqual(expectedBuffer, providedBuffer)
    );
  });
}
