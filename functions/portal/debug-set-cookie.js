import { isSecureRequest, makeRedirectResponse } from "../_portal";

function buildCookie(secure) {
  const parts = ["portal_debug=1", "Path=/", "Max-Age=600", "HttpOnly", "SameSite=Lax"];
  if (secure) parts.push("Secure");
  return parts.join("; ");
}

export function onRequestGet(context) {
  const secure = isSecureRequest(context.request);
  const response = makeRedirectResponse("/portal/debug?from=debug-set-cookie", 303);
  response.headers.append("Set-Cookie", buildCookie(secure));
  return response;
}

export function onRequestPost(context) {
  return onRequestGet(context);
}
