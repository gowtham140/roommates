const runtimeConfig = typeof window !== "undefined" ? window.__APP_CONFIG__ || {} : {};
const raw = runtimeConfig.API_URL || import.meta.env.VITE_API_URL || "http://localhost:8080/";

export const API_URL = raw.replace(/\/+$/, "") + "/";
export const API_ORIGIN = raw.replace(/\/+$/, "");

export const resolveImageUrl = (src) => {
  if (!src || typeof src !== "string") return "";
  if (/^(https?:)?\/\/|^blob:|^data:/.test(src)) return src;
  return `${API_ORIGIN}${src.startsWith("/") ? "" : "/"}${src}`;
};
