import client from "./AuthAPI";

const unwrap = (response) => response.data?.data;

export async function getAdminUsers() {
  return unwrap(await client.get("/api/admin/users"));
}

export async function setUserBlocked(id, blocked) {
  const action = blocked ? "block" : "unblock";
  return unwrap(await client.patch(`/api/admin/users/${id}/${action}`));
}

export async function getAdminRooms() {
  return unwrap(await client.get("/api/admin/rooms"));
}

export async function setRoomBlocked(id, blocked) {
  const action = blocked ? "block" : "unblock";
  return unwrap(await client.patch(`/api/admin/rooms/${id}/${action}`));
}
