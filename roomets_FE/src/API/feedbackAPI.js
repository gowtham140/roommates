import client from "./AuthAPI";

export async function submitFeedback(payload) {
  return (await client.post("/api/feedback", payload)).data?.data;
}

export async function getAdminFeedback() {
  return (await client.get("/api/admin/feedback")).data?.data;
}
