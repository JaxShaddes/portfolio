import {
  buildSessionCookie,
  createSessionToken,
  isSecureRequest,
  loadPortalConfig,
  makeNoStoreResponse,
  makeRedirectResponse,
  normalizeClientId,
  sanitizeNextPath,
  verifyCredentials,
} from "../_portal";

function buildLoginErrorRedirect(reason, clientId, next) {
  const url = new URL("https://portal.local/portal/login");
  if (reason) url.searchParams.set("reason", reason);
  if (clientId) url.searchParams.set("clientId", clientId);
  if (next) url.searchParams.set("next", next);
  return `${url.pathname}${url.search}`;
}

export async function onRequestPost(context) {
  let config;
  try {
    config = await loadPortalConfig(context.env);
  } catch (error) {
    return makeNoStoreResponse(`Portal configuration error: ${error.message}`, { status: 500 });
  }

  let formData;
  try {
    formData = await context.request.formData();
  } catch {
    const redirectPath = buildLoginErrorRedirect("invalid_credentials");
    return makeRedirectResponse(redirectPath, 302);
  }

  const clientId = normalizeClientId(formData.get("clientId"));
  const password = String(formData.get("password") || "");
  const nextRaw = String(formData.get("next") || "");

  if (!clientId || !password) {
    const redirectPath = buildLoginErrorRedirect("invalid_credentials", clientId, nextRaw);
    return makeRedirectResponse(redirectPath, 302);
  }

  const credentialsValid = await verifyCredentials(config, clientId, password);
  if (!credentialsValid) {
    const redirectPath = buildLoginErrorRedirect("invalid_credentials", clientId, nextRaw);
    return makeRedirectResponse(redirectPath, 302);
  }

  const token = await createSessionToken(clientId, config.sessionTtlSeconds, config.authSecret);
  const secure = isSecureRequest(context.request);
  const setCookie = buildSessionCookie(token, config.sessionTtlSeconds, secure);
  const safeNext = sanitizeNextPath(nextRaw, clientId);
  const target = safeNext || `/portal/${clientId}`;
  const response = makeRedirectResponse(target, 302);
  response.headers.append("Set-Cookie", setCookie);
  return response;
}

export function onRequestGet() {
  return makeRedirectResponse("/portal/login", 302);
}
