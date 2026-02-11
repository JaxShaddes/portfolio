import {
  buildSessionClearCookie,
  isSecureRequest,
  makeRedirectResponse,
} from "../_portal";

export function onRequestGet(context) {
  const secure = isSecureRequest(context.request);
  const response = makeRedirectResponse("/portal/login?reason=signed_out", 302);
  response.headers.append("Set-Cookie", buildSessionClearCookie(secure));
  return response;
}

export function onRequestPost(context) {
  return onRequestGet(context);
}
