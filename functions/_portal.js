const DEFAULT_TTL_SECONDS = 900;
const SESSION_COOKIE_NAME = "portal_session";
const LOGIN_PATH = "/portal/login";
const CLIENT_ID_PATTERN = /^[a-z0-9](?:[a-z0-9_-]{0,63})$/;

const textEncoder = new TextEncoder();
const textDecoder = new TextDecoder();

function base64UrlEncodeBytes(bytes) {
  let binary = "";
  for (let i = 0; i < bytes.length; i += 1) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function base64UrlEncodeString(value) {
  return base64UrlEncodeBytes(textEncoder.encode(value));
}

function base64UrlDecodeBytes(value) {
  const normalized = String(value || "").replace(/-/g, "+").replace(/_/g, "/");
  const padLength = (4 - (normalized.length % 4)) % 4;
  const padded = normalized + "=".repeat(padLength);
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

function timingSafeEqualBytes(a, b) {
  if (!(a instanceof Uint8Array) || !(b instanceof Uint8Array)) return false;
  if (a.length !== b.length) return false;
  let mismatch = 0;
  for (let i = 0; i < a.length; i += 1) {
    mismatch |= a[i] ^ b[i];
  }
  return mismatch === 0;
}

function timingSafeEqualStrings(a, b) {
  const left = textEncoder.encode(String(a ?? ""));
  const right = textEncoder.encode(String(b ?? ""));
  return timingSafeEqualBytes(left, right);
}

async function sha256Hex(value) {
  const bytes = textEncoder.encode(String(value ?? ""));
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  const digestBytes = new Uint8Array(digest);
  let out = "";
  for (const byte of digestBytes) {
    out += byte.toString(16).padStart(2, "0");
  }
  return out;
}

async function importHmacKey(secret) {
  return crypto.subtle.importKey(
    "raw",
    textEncoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
}

async function signPayload(payloadBase64Url, secret) {
  const key = await importHmacKey(secret);
  const signature = await crypto.subtle.sign("HMAC", key, textEncoder.encode(payloadBase64Url));
  return base64UrlEncodeBytes(new Uint8Array(signature));
}

export function normalizeClientId(value) {
  const normalized = String(value ?? "").trim().toLowerCase();
  if (!CLIENT_ID_PATTERN.test(normalized)) return "";
  return normalized;
}

function isLocalHttpUrl(urlObj) {
  return (
    urlObj.protocol === "http:" &&
    (urlObj.hostname === "localhost" ||
      urlObj.hostname === "127.0.0.1" ||
      urlObj.hostname === "0.0.0.0")
  );
}

function parseClientRecord(record) {
  if (typeof record === "string") {
    return {
      upstream: record,
      password: null,
      passwordHashHex: null,
    };
  }

  if (!record || typeof record !== "object") {
    throw new Error("Each client map value must be a string or object.");
  }

  const upstream = record.upstream || record.upstreamUrl || record.url;
  if (typeof upstream !== "string" || !upstream.trim()) {
    throw new Error("Each client record must include an upstream URL.");
  }

  const password = typeof record.password === "string" ? record.password : null;
  const passwordHashHex =
    typeof record.passwordHashHex === "string" ? record.passwordHashHex.toLowerCase() : null;

  return { upstream, password, passwordHashHex };
}

function validateUpstreamUrl(rawUrl) {
  let urlObj;
  try {
    urlObj = new URL(rawUrl);
  } catch {
    throw new Error(`Invalid upstream URL: ${rawUrl}`);
  }

  const validProtocol = urlObj.protocol === "https:" || isLocalHttpUrl(urlObj);
  if (!validProtocol) {
    throw new Error(`Upstream must be https (or localhost http): ${rawUrl}`);
  }

  return urlObj.toString();
}

function parseSessionTtlSeconds(rawTtl) {
  if (rawTtl == null || rawTtl === "") return DEFAULT_TTL_SECONDS;
  const parsed = Number.parseInt(String(rawTtl), 10);
  if (!Number.isFinite(parsed) || parsed <= 0) return DEFAULT_TTL_SECONDS;
  return parsed;
}

export function isSecureRequest(request) {
  const url = new URL(request.url);
  if (url.protocol === "https:") return true;
  const forwardedProto = request.headers.get("x-forwarded-proto");
  return forwardedProto === "https";
}

export function parseCookies(cookieHeader) {
  const out = {};
  if (!cookieHeader) return out;
  const parts = String(cookieHeader).split(";");
  for (const part of parts) {
    const separator = part.indexOf("=");
    if (separator <= 0) continue;
    const key = part.slice(0, separator).trim();
    const value = part.slice(separator + 1).trim();
    try {
      out[key] = decodeURIComponent(value);
    } catch {
      out[key] = value;
    }
  }
  return out;
}

function serializeCookie(name, value, options = {}) {
  const segments = [`${name}=${encodeURIComponent(value)}`];
  segments.push(`Path=${options.path || "/"}`);
  if (Number.isFinite(options.maxAge)) {
    segments.push(`Max-Age=${Math.max(0, Math.floor(options.maxAge))}`);
  }
  if (options.httpOnly !== false) segments.push("HttpOnly");
  if (options.sameSite) segments.push(`SameSite=${options.sameSite}`);
  if (options.secure) segments.push("Secure");
  return segments.join("; ");
}

function withNoStoreHeaders(headers) {
  headers.set("Cache-Control", "private, no-store");
  headers.set("Pragma", "no-cache");
  headers.set("Expires", "0");
  return headers;
}

export function makeNoStoreResponse(body, init = {}) {
  const headers = new Headers(init.headers || {});
  withNoStoreHeaders(headers);
  return new Response(body, { ...init, headers });
}

export function makeRedirectResponse(location, status = 302, init = {}) {
  const headers = new Headers(init.headers || {});
  headers.set("Location", location);
  withNoStoreHeaders(headers);
  return new Response(null, { ...init, status, headers });
}

function isLoginPath(pathname) {
  return pathname === "/portal/login" || pathname === "/portal/login/";
}

export function buildLoginRedirect(request, reason) {
  const currentUrl = new URL(request.url);
  if (isLoginPath(currentUrl.pathname)) {
    return makeNoStoreResponse("Unauthorized", { status: 401 });
  }

  const loginUrl = new URL(LOGIN_PATH, currentUrl.origin);
  const nextPath = `${currentUrl.pathname}${currentUrl.search}`;
  if (nextPath.startsWith("/portal/")) {
    loginUrl.searchParams.set("next", nextPath);
  }
  if (reason) {
    loginUrl.searchParams.set("reason", reason);
  }
  return makeRedirectResponse(`${loginUrl.pathname}${loginUrl.search}`, 302);
}

export async function loadPortalConfig(env) {
  const authSecret = typeof env.PORTAL_AUTH_SECRET === "string" ? env.PORTAL_AUTH_SECRET.trim() : "";
  if (!authSecret) {
    throw new Error("Missing PORTAL_AUTH_SECRET.");
  }

  const rawClientMap = typeof env.CLIENT_MAP_JSON === "string" ? env.CLIENT_MAP_JSON.trim() : "";
  if (!rawClientMap) {
    throw new Error("Missing CLIENT_MAP_JSON.");
  }

  let parsedMap;
  try {
    parsedMap = JSON.parse(rawClientMap);
  } catch {
    throw new Error("CLIENT_MAP_JSON is not valid JSON.");
  }

  if (!parsedMap || typeof parsedMap !== "object" || Array.isArray(parsedMap)) {
    throw new Error("CLIENT_MAP_JSON must be a JSON object.");
  }

  const clientMap = new Map();
  for (const [rawClientId, rawRecord] of Object.entries(parsedMap)) {
    const clientId = normalizeClientId(rawClientId);
    if (!clientId) {
      throw new Error(`Invalid client ID in CLIENT_MAP_JSON: ${rawClientId}`);
    }
    const record = parseClientRecord(rawRecord);
    clientMap.set(clientId, {
      upstream: validateUpstreamUrl(record.upstream),
      password: record.password,
      passwordHashHex: record.passwordHashHex,
    });
  }

  if (clientMap.size === 0) {
    throw new Error("CLIENT_MAP_JSON must include at least one client.");
  }

  const sessionTtlSeconds = parseSessionTtlSeconds(env.SESSION_TTL_SECONDS);
  const sharedPassword = typeof env.PORTAL_PASSWORD === "string" ? env.PORTAL_PASSWORD : "";

  if (!sharedPassword) {
    for (const [clientId, record] of clientMap.entries()) {
      if (!record.password && !record.passwordHashHex) {
        throw new Error(
          `Client "${clientId}" has no password source. Set PORTAL_PASSWORD or per-client password/passwordHashHex.`
        );
      }
    }
  }

  return {
    authSecret,
    sharedPassword,
    sessionTtlSeconds,
    clientMap,
  };
}

export async function createSessionToken(clientId, ttlSeconds, authSecret) {
  const nowSeconds = Math.floor(Date.now() / 1000);
  const payload = {
    cid: clientId,
    iat: nowSeconds,
    exp: nowSeconds + ttlSeconds,
  };
  const payloadBase64Url = base64UrlEncodeString(JSON.stringify(payload));
  const signatureBase64Url = await signPayload(payloadBase64Url, authSecret);
  return `${payloadBase64Url}.${signatureBase64Url}`;
}

export async function verifySessionToken(token, authSecret) {
  if (typeof token !== "string" || !token.includes(".")) return null;
  const [payloadBase64Url, signatureBase64Url] = token.split(".");
  if (!payloadBase64Url || !signatureBase64Url) return null;

  let signatureBytes;
  try {
    signatureBytes = base64UrlDecodeBytes(signatureBase64Url);
  } catch {
    return null;
  }

  const expectedSignatureBase64Url = await signPayload(payloadBase64Url, authSecret);
  let expectedSignatureBytes;
  try {
    expectedSignatureBytes = base64UrlDecodeBytes(expectedSignatureBase64Url);
  } catch {
    return null;
  }

  if (!timingSafeEqualBytes(signatureBytes, expectedSignatureBytes)) return null;

  let payload;
  try {
    payload = JSON.parse(textDecoder.decode(base64UrlDecodeBytes(payloadBase64Url)));
  } catch {
    return null;
  }

  const clientId = normalizeClientId(payload?.cid);
  const exp = Number(payload?.exp);
  const iat = Number(payload?.iat);
  const now = Math.floor(Date.now() / 1000);

  if (!clientId) return null;
  if (!Number.isFinite(exp) || !Number.isFinite(iat)) return null;
  if (exp <= now) return null;
  if (iat > now + 60) return null;

  return { clientId, exp, iat };
}

export function buildSessionCookie(token, ttlSeconds, secure) {
  return serializeCookie(SESSION_COOKIE_NAME, token, {
    path: "/",
    maxAge: ttlSeconds,
    httpOnly: true,
    sameSite: "Lax",
    secure,
  });
}

export function buildSessionClearCookie(secure) {
  return serializeCookie(SESSION_COOKIE_NAME, "", {
    path: "/",
    maxAge: 0,
    httpOnly: true,
    sameSite: "Lax",
    secure,
  });
}

export async function readAuthorizedSession(request, config) {
  const cookies = parseCookies(request.headers.get("Cookie"));
  const token = cookies[SESSION_COOKIE_NAME];
  if (!token) return null;

  let session;
  try {
    session = await verifySessionToken(token, config.authSecret);
  } catch {
    return null;
  }
  if (!session) return null;
  if (!config.clientMap.has(session.clientId)) return null;
  return session;
}

export async function verifyCredentials(config, clientId, password) {
  const record = config.clientMap.get(clientId);
  if (!record) return false;
  const candidate = String(password ?? "");
  if (!candidate) return false;

  if (record.passwordHashHex) {
    const enteredHash = await sha256Hex(candidate);
    return timingSafeEqualStrings(enteredHash, record.passwordHashHex);
  }

  if (record.password) {
    return timingSafeEqualStrings(candidate, record.password);
  }

  if (!config.sharedPassword) {
    return false;
  }

  return timingSafeEqualStrings(candidate, config.sharedPassword);
}

export function sanitizeNextPath(nextCandidate, clientId) {
  const nextRaw = typeof nextCandidate === "string" ? nextCandidate.trim() : "";
  if (!nextRaw || !nextRaw.startsWith("/") || nextRaw.startsWith("//")) {
    return null;
  }

  let parsed;
  try {
    parsed = new URL(nextRaw, "https://portal.local");
  } catch {
    return null;
  }

  const pathname = parsed.pathname;
  const allowedPortalPath = `/portal/${clientId}`;
  const allowedProxyPath = `/portal/proxy/${clientId}`;

  if (pathname === allowedPortalPath || pathname.startsWith(`${allowedPortalPath}/`)) {
    return `${pathname}${parsed.search}`;
  }
  if (pathname === allowedProxyPath || pathname.startsWith(`${allowedProxyPath}/`)) {
    return `${pathname}${parsed.search}`;
  }

  return null;
}

export function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, (char) => {
    switch (char) {
      case "&":
        return "&amp;";
      case "<":
        return "&lt;";
      case ">":
        return "&gt;";
      case '"':
        return "&quot;";
      case "'":
        return "&#39;";
      default:
        return char;
    }
  });
}

function trimSlashes(value) {
  return String(value || "").replace(/^\/+/, "").replace(/\/+$/, "");
}

export function buildUpstreamUrl(upstreamBaseUrl, wildcardPath, searchString) {
  const base = new URL(upstreamBaseUrl);
  const baseHadTrailingSlash = base.pathname.endsWith("/");
  const cleanBasePath = trimSlashes(base.pathname);
  const cleanWildcard = trimSlashes(wildcardPath);
  const pathSegments = [];
  if (cleanBasePath) pathSegments.push(cleanBasePath);
  if (cleanWildcard) pathSegments.push(cleanWildcard);
  base.pathname = `/${pathSegments.join("/")}`;
  if (base.pathname === "/" && !cleanBasePath && !cleanWildcard) {
    base.pathname = "/";
  }
  if (!cleanWildcard && baseHadTrailingSlash && !base.pathname.endsWith("/")) {
    base.pathname += "/";
  }
  if (!base.pathname.endsWith("/") && String(wildcardPath || "").endsWith("/")) {
    base.pathname += "/";
  }
  base.search = searchString || "";
  return base;
}

export function buildUpstreamRequestHeaders(originalHeaders) {
  const headers = new Headers(originalHeaders);
  headers.delete("host");
  headers.delete("cookie");
  headers.delete("cf-connecting-ip");
  headers.delete("cf-ipcountry");
  headers.delete("cf-ray");
  headers.delete("x-forwarded-for");
  headers.delete("x-forwarded-host");
  headers.delete("x-forwarded-proto");
  headers.delete("x-real-ip");
  return headers;
}

function rewriteLocationHeader(value, upstreamUrl, clientId) {
  if (!value) return null;
  let target;
  try {
    target = new URL(value, upstreamUrl);
  } catch {
    return null;
  }

  if (target.origin !== upstreamUrl.origin) return null;

  const proxyPrefix = `/portal/proxy/${clientId}`;
  return `${proxyPrefix}${target.pathname}${target.search}${target.hash}`;
}

export function transformProxyResponse(upstreamResponse, options) {
  const { upstreamUrl, clientId } = options;
  const headers = new Headers(upstreamResponse.headers);

  headers.delete("x-frame-options");
  headers.delete("content-security-policy");
  headers.delete("content-security-policy-report-only");
  headers.delete("set-cookie");
  headers.delete("clear-site-data");

  const locationHeader = headers.get("location");
  if (locationHeader) {
    const rewrittenLocation = rewriteLocationHeader(locationHeader, upstreamUrl, clientId);
    if (!rewrittenLocation) {
      return makeNoStoreResponse("Blocked cross-origin upstream redirect.", { status: 502 });
    }
    headers.set("location", rewrittenLocation);
  }

  headers.set("Vary", "Cookie");
  headers.set("X-Robots-Tag", "noindex, nofollow");
  withNoStoreHeaders(headers);

  return new Response(upstreamResponse.body, {
    status: upstreamResponse.status,
    statusText: upstreamResponse.statusText,
    headers,
  });
}
