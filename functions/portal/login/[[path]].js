import { makeRedirectResponse } from "../../_portal";

export function onRequest() {
  return makeRedirectResponse("/portal/login", 302);
}
