import AuthService from "../session/AuthService";

const http = {
  HEADERS: () => ({
    Accept: "application/json",
    "Content-Type": "application/json",
  }),
  AUTH_HEADERS: () => ({
    Accept: "application/json",
    "Content-Type": "application/json",
    Authorization: `Bearer ${AuthService.getToken() || ""}`,
  }),
  MULTIPART_HEADERS: () => ({
    Accept: "application/json",
  }),
};

export default http;
