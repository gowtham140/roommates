import axios from "axios";
import AuthService from "../session/AuthService";
import { SESSION_EXPIRED_EVENT } from "../session/sessionEvents";
import { API_URL } from "./app-config";

const PUBLIC_AUTH_PATH = /^\/api\/auth\/(login|register|send-otp|forgot-password|reset-password)(\?|$)/;

const client = axios.create({
  baseURL: API_URL,
  headers: { Accept: "application/json" },
});

client.interceptors.request.use((config) => {
  const token = AuthService.getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  if (typeof FormData !== "undefined" && config.data instanceof FormData) {
    delete config.headers["Content-Type"];
  }
  return config;
});

client.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const publicAuthRequest = PUBLIC_AUTH_PATH.test(error.config?.url || "");
    const sessionExpired = status === 401 && !publicAuthRequest;

    if (sessionExpired && typeof window !== "undefined") {
      window.dispatchEvent(new Event(SESSION_EXPIRED_EVENT));
    }

    const data = error.response?.data;
    const message =
      data?.message ||
      (typeof data === "string" ? data : null) ||
      error.message ||
      "Something went wrong";

    const authError = new Error(message);
    authError.status = status;
    authError.isSessionExpired = sessionExpired;
    return Promise.reject(authError);
  }
);

export default client;
