import { makeRedirectResponse } from "../../_portal";
import { onRequestGet as onPortalLoginGet } from "../login";

export function onRequest(context) {
  const extraPath = String(context.params.path || "").trim();
  if (!extraPath) {
    return onPortalLoginGet(context);
  }
  return makeRedirectResponse("/portal/login", 302);
}
