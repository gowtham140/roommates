import client from "./AuthAPI";

const unwrap = (response) => response.data?.data;

export async function sendEnquiry(roomId, message) {
  return unwrap(await client.post(`/api/rooms/${roomId}/enquiries`, { message }));
}

export async function getSentEnquiries() {
  return unwrap(await client.get("/api/enquiries/sent"));
}

export async function getReceivedEnquiries() {
  return unwrap(await client.get("/api/enquiries/received"));
}

export async function getNewEnquiryCount() {
  return unwrap(await client.get("/api/enquiries/count"));
}

export async function updateEnquiryStatus(id, status) {
  return unwrap(await client.patch(`/api/enquiries/${id}/status`, null, { params: { status } }));
}
