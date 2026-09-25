import * as APPCONFIG from "./app-config.js";
import auth from "./AuthAPI.js";
import http from "./http.js";

export function createUser(form) {
  return auth({
    method: "post",
    headers: http.MULTIPART_HEADERS(),
    url: `${APPCONFIG.API_URL}api/createUser`,
    data: form,
  });
}