import client from "./AuthAPI";

const unwrap = (response) => response.data?.data;

export async function register(payload) {
  return unwrap(await client.post("/api/auth/register", payload));
}

export async function login(payload) {
  return unwrap(await client.post("/api/auth/login", payload));
}

export async function getMe() {
  return unwrap(await client.get("/api/auth/me"));
}

export async function updateMe(payload) {
  return unwrap(await client.put("/api/auth/me", payload));
}

export async function sendOtp(payload) {
  return unwrap(await client.post("/api/auth/send-otp", payload));
}

export async function forgotPassword(email) {
  return unwrap(await client.post("/api/auth/forgot-password", { email, purpose: "RESET_PASSWORD" }));
}

export async function resetPassword(payload) {
  return unwrap(await client.post("/api/auth/reset-password", payload));
}
