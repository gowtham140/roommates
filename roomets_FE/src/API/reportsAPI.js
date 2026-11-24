import client from "./AuthAPI";

export async function submitReport(payload) {
  return (await client.post("/api/reports", payload)).data?.data;
}
