import axios from "axios";
import AuthService from "../session/AuthService";
import { API_URL } from "./app-config";

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
    if (status === 401) {
      AuthService.removeAuth();
      if (window.location.pathname !== "/login") {
        window.location.assign("/login");
      }
    }

    const data = error.response?.data;
    const message =
      data?.message ||
      (typeof data === "string" ? data : null) ||
      error.message ||
      "Something went wrong";

    return Promise.reject(new Error(message));
  }
);

export default client;
