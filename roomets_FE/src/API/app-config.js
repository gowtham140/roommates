const raw = import.meta.env.VITE_API_URL || "https://roommates-ky68.onrender.com";

export const API_URL = raw.replace(/\/+$/, "") + "/";
export const API_ORIGIN = raw.replace(/\/+$/, "");

export const resolveImageUrl = (src) => {
  if (!src || typeof src !== "string") return "";
  if (/^(https?:)?\/\/|^blob:|^data:/.test(src)) return src;
  return `${API_ORIGIN}${src.startsWith("/") ? "" : "/"}${src}`;
};
