import {
  buildLoginRedirect,
  buildUpstreamRequestHeaders,
  buildUpstreamUrl,
  loadPortalConfig,
  makeNoStoreResponse,
  normalizeClientId,
  readAuthorizedSession,
  transformProxyResponse,
} from "../../../_portal";

function methodAllowsBody(method) {
  return method !== "GET" && method !== "HEAD";
}

export async function onRequest(context) {
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

  const clientRecord = config.clientMap.get(clientId);
  const requestUrl = new URL(context.request.url);
  const wildcardPath = context.params.path || "";
  const upstreamUrl = buildUpstreamUrl(clientRecord.upstream, wildcardPath, requestUrl.search);
  const headers = buildUpstreamRequestHeaders(context.request.headers);
  const init = {
    method: context.request.method,
    headers,
    redirect: "manual",
  };

  if (methodAllowsBody(context.request.method)) {
    init.body = context.request.body;
  }

  let upstreamResponse;
  try {
    upstreamResponse = await fetch(upstreamUrl.toString(), init);
  } catch {
    return makeNoStoreResponse("Failed to load upstream preview.", { status: 502 });
  }

  return transformProxyResponse(upstreamResponse, { upstreamUrl, clientId });
}
