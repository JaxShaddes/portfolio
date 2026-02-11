import {
  buildLoginRedirect,
  escapeHtml,
  loadPortalConfig,
  makeNoStoreResponse,
  normalizeClientId,
  readAuthorizedSession,
} from "../_portal";

function renderClientPage(clientId) {
  const safeClientId = escapeHtml(clientId);
  const iframeSrc = `/portal/proxy/${encodeURIComponent(clientId)}/`;
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Portal Preview ${safeClientId}</title>
  <style>
    body {
      margin: 0;
      min-height: 100vh;
      font-family: "Inter", "Segoe UI", sans-serif;
      color: #111111;
      background: linear-gradient(165deg, #f5f6f1 0%, #e9ecf3 100%);
      display: grid;
      grid-template-rows: auto 1fr;
    }
    .topbar {
      padding: 14px 18px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 1px solid rgba(17, 17, 17, 0.14);
      background: rgba(255, 255, 255, 0.82);
      backdrop-filter: blur(6px);
    }
    .title {
      margin: 0;
      font-weight: 700;
      letter-spacing: -0.03em;
      font-size: clamp(1rem, 2vw, 1.2rem);
    }
    .client {
      margin-left: 8px;
      padding: 3px 8px;
      border-radius: 999px;
      border: 1px solid rgba(17, 17, 17, 0.16);
      font-family: ui-monospace, "SFMono-Regular", Menlo, Consolas, monospace;
      font-size: 0.72rem;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      background: rgba(255, 255, 255, 0.55);
    }
    .actions {
      display: flex;
      gap: 8px;
      align-items: center;
    }
    .link {
      text-decoration: none;
      border-radius: 999px;
      padding: 8px 12px;
      border: 1px solid rgba(17, 17, 17, 0.18);
      color: #111111;
      font-size: 0.7rem;
      letter-spacing: 0.11em;
      text-transform: uppercase;
      background: rgba(255, 255, 255, 0.7);
    }
    .frame-wrap {
      padding: 16px;
      min-height: 0;
      display: grid;
    }
    iframe {
      width: 100%;
      height: calc(100vh - 78px);
      border: 1px solid rgba(17, 17, 17, 0.16);
      border-radius: 12px;
      background: white;
    }
  </style>
</head>
<body>
  <header class="topbar">
    <h1 class="title">
      Client Portal <span class="client">${safeClientId}</span>
    </h1>
    <div class="actions">
      <a class="link" href="/portal/logout">Logout</a>
    </div>
  </header>
  <main class="frame-wrap">
    <iframe src="${iframeSrc}" title="Client Preview ${safeClientId}" loading="eager"></iframe>
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

  const clientId = normalizeClientId(context.params.clientId);
  if (!clientId || !config.clientMap.has(clientId)) {
    return buildLoginRedirect(context.request, "unauthorized");
  }

  const session = await readAuthorizedSession(context.request, config);
  if (!session) {
    return buildLoginRedirect(context.request, "expired");
  }
  if (session.clientId !== clientId) {
    return buildLoginRedirect(context.request, "client_mismatch");
  }

  return makeNoStoreResponse(renderClientPage(clientId), {
    status: 200,
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}

export function onRequestPost(context) {
  return buildLoginRedirect(context.request, "unauthorized");
}
