import client from "./AuthAPI";

const unwrap = (response) => response.data?.data;

export async function getRooms(params = {}) {
  return unwrap(await client.get("/api/rooms", { params }));
}

export async function getRoom(id) {
  return unwrap(await client.get(`/api/rooms/${id}`));
}

export async function getMyRooms() {
  return unwrap(await client.get("/api/rooms/mine"));
}

export async function createRoom(payload) {
  return unwrap(await client.post("/api/rooms", payload));
}

export async function updateRoom(id, payload) {
  return unwrap(await client.put(`/api/rooms/${id}`, payload));
}

export async function deleteRoom(id) {
  return unwrap(await client.delete(`/api/rooms/${id}`));
}

export async function deleteRoomImage(id, imageUrl) {
  return unwrap(
    await client.delete(`/api/rooms/${id}/images`, { params: { imageUrl } })
  );
}

export async function uploadImages(files) {
  const formData = new FormData();
  Array.from(files || []).forEach((file) => formData.append("files", file));
  return unwrap(await client.post("/api/uploads", formData));
}
