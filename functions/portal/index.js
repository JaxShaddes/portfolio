import { makeRedirectResponse } from "../_portal";

export function onRequestGet() {
  return makeRedirectResponse("/portal/login", 302);
}
