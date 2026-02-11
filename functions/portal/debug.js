import {
  isSecureRequest,
  loadPortalConfig,
  makeNoStoreResponse,
  parseCookies,
  verifySessionToken,
} from "../_portal";

export async function onRequestGet(context) {
  const requestUrl = new URL(context.request.url);
  const nowUnix = Math.floor(Date.now() / 1000);
  const cookies = parseCookies(context.request.headers.get("Cookie"));
  const portalSessionToken = cookies.portal_session || "";

  let configLoaded = false;
  let configError = "";
  let clientCount = 0;
  let authSecretPresent = false;
  let sessionValid = false;
  let sessionClientId = null;
  let sessionExpUnix = null;
  let secondsUntilExpiry = null;
  let sessionError = "";

  try {
    const config = await loadPortalConfig(context.env);
    configLoaded = true;
    clientCount = config.clientMap.size;
    authSecretPresent = !!config.authSecret;

    if (portalSessionToken) {
      try {
        const session = await verifySessionToken(portalSessionToken, config.authSecret);
        if (session) {
          sessionValid = true;
          sessionClientId = session.clientId;
          sessionExpUnix = session.exp;
          secondsUntilExpiry = Math.max(0, session.exp - nowUnix);
        } else {
          sessionError = "Token present but invalid or expired.";
        }
      } catch {
        sessionError = "Token verification threw an error.";
      }
    }
  } catch (error) {
    configError = String(error?.message || error || "unknown config error");
  }

  return makeNoStoreResponse(
    JSON.stringify(
      {
        timestamp: new Date().toISOString(),
        requestPath: requestUrl.pathname,
        requestHost: requestUrl.host,
        requestOrigin: requestUrl.origin,
        secureRequest: isSecureRequest(context.request),
        hasCookieHeader: !!context.request.headers.get("Cookie"),
        cookieNames: Object.keys(cookies),
        hasPortalSessionCookie: !!portalSessionToken,
        configLoaded,
        configError,
        authSecretPresent,
        clientCount,
        sessionValid,
        sessionClientId,
        sessionExpUnix,
        nowUnix,
        secondsUntilExpiry,
        sessionError,
      },
      null,
      2
    ),
    {
      status: 200,
      headers: { "Content-Type": "application/json; charset=utf-8" },
    }
  );
}
