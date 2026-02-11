import {
  buildLoginRedirect,
  escapeHtml,
  loadPortalConfig,
  makeNoStoreResponse,
  normalizeClientId,
  readAuthorizedSession,
  sanitizeNextPath,
} from "../_portal";

function reasonMessage(reason) {
  if (reason === "invalid_credentials") return "Invalid client ID or password.";
  if (reason === "expired") return "Session expired. Please sign in again.";
  if (reason === "unauthorized") return "Please sign in to continue.";
  if (reason === "client_mismatch") return "That session is not allowed for this client.";
  if (reason === "signed_out") return "You have been signed out.";
  return "";
}

function renderLoginPage({ clientId, reason, next }) {
  const safeClientId = escapeHtml(clientId);
  const safeReason = escapeHtml(reasonMessage(reason));
  const safeNext = escapeHtml(next || "");

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Client Portal Login</title>
  <style>
    :root { color-scheme: light; }
    body {
      margin: 0;
      min-height: 100vh;
      font-family: "Inter", "Segoe UI", sans-serif;
      background:
        radial-gradient(1200px 500px at 85% -10%, rgba(62, 126, 188, 0.18), transparent 60%),
        radial-gradient(900px 500px at -20% 120%, rgba(11, 34, 67, 0.14), transparent 60%),
        #f3f4ef;
      color: #111111;
      display: grid;
      place-items: center;
      padding: 24px;
    }
    .card {
      width: min(540px, 100%);
      background: rgba(255, 255, 255, 0.84);
      border: 1px solid rgba(17, 17, 17, 0.12);
      border-radius: 18px;
      padding: 28px;
      box-shadow: 0 18px 45px rgba(17, 17, 17, 0.1);
      backdrop-filter: blur(6px);
    }
    h1 {
      margin: 0 0 10px;
      font-size: clamp(1.8rem, 3vw, 2.4rem);
      letter-spacing: -0.04em;
      line-height: 0.95;
    }
    p {
      margin: 0;
      color: rgba(17, 17, 17, 0.72);
      font-size: 0.95rem;
    }
    form { margin-top: 24px; display: grid; gap: 14px; }
    label {
      display: grid;
      gap: 7px;
      font-size: 0.72rem;
      letter-spacing: 0.12em;
      text-transform: uppercase;
      color: rgba(17, 17, 17, 0.72);
    }
    input {
      border: 1px solid rgba(17, 17, 17, 0.22);
      border-radius: 10px;
      padding: 12px 13px;
      font-size: 0.95rem;
      background: rgba(255, 255, 255, 0.92);
      color: #111111;
    }
    input:focus {
      outline: 2px solid rgba(54, 100, 156, 0.4);
      outline-offset: 1px;
      border-color: rgba(54, 100, 156, 0.5);
    }
    button {
      margin-top: 6px;
      border: 0;
      border-radius: 999px;
      padding: 12px 16px;
      font-size: 0.75rem;
      letter-spacing: 0.16em;
      text-transform: uppercase;
      color: #f3f4ef;
      background: linear-gradient(100deg, #0f1723, #2b435f);
      cursor: pointer;
    }
    .error {
      margin-top: 16px;
      padding: 10px 12px;
      border-radius: 10px;
      border: 1px solid rgba(183, 54, 54, 0.3);
      background: rgba(183, 54, 54, 0.08);
      color: #7a2020;
      font-size: 0.84rem;
    }
    .meta {
      margin-top: 14px;
      font-size: 0.74rem;
      color: rgba(17, 17, 17, 0.56);
      letter-spacing: 0.08em;
      text-transform: uppercase;
    }
  </style>
</head>
<body>
  <main class="card" role="main">
    <h1>Client Portal</h1>
    <p>Authenticate to load your protected preview through the secure proxy.</p>
    ${safeReason ? `<div class="error">${safeReason}</div>` : ""}
    <form method="POST" action="/portal/auth">
      <input type="hidden" name="next" value="${safeNext}" />
      <label>
        Client ID
        <input name="clientId" value="${safeClientId}" required maxlength="64" autocomplete="off" />
      </label>
      <label>
        Password
        <input name="password" type="password" required autocomplete="current-password" />
      </label>
      <button type="submit">Sign In</button>
    </form>
    <div class="meta">Session cookie expires after 15 minutes by default.</div>
  </main>
</body>
</html>`;
}

export async function onRequestGet(context) {
  let config;
  try {
    config = await loadPortalConfig(context.env);
  } catch (error) {
    return makeNoStoreResponse(`Portal configuration error: ${error.message}`, { status: 500 });
  }

  const session = await readAuthorizedSession(context.request, config);
  const currentUrl = new URL(context.request.url);
  const requestedClientId = normalizeClientId(currentUrl.searchParams.get("clientId") || "");
  const requestedNext = currentUrl.searchParams.get("next") || "";
  const reason = currentUrl.searchParams.get("reason") || "";

  if (session) {
    const safeNext = sanitizeNextPath(requestedNext, session.clientId);
    const target = safeNext || `/portal/${session.clientId}`;
    return makeNoStoreResponse(null, {
      status: 302,
      headers: { Location: target },
    });
  }

  return makeNoStoreResponse(
    renderLoginPage({
      clientId: requestedClientId,
      reason,
      next: requestedNext,
    }),
    {
      status: 200,
      headers: { "Content-Type": "text/html; charset=utf-8" },
    }
  );
}

export function onRequestPost(context) {
  return buildLoginRedirect(context.request, "unauthorized");
}
