const storageKey = (userId) => `savedRoomIds:${userId ?? "guest"}`;

const normalizeIds = (value) =>
  Array.isArray(value) ? value.filter((id) => id !== null && id !== undefined).map(String) : [];

export const getSavedRoomIds = (userId) => {
  try {
    return normalizeIds(JSON.parse(localStorage.getItem(storageKey(userId)) || "[]"));
  } catch {
    return [];
  }
};

export const isRoomSaved = (userId, roomId) =>
  roomId != null && getSavedRoomIds(userId).includes(String(roomId));

export const toggleSavedRoom = (userId, roomId) => {
  const id = String(roomId);
  const current = getSavedRoomIds(userId);
  const saved = !current.includes(id);
  const ids = saved ? [...current, id] : current.filter((item) => item !== id);
  localStorage.setItem(storageKey(userId), JSON.stringify(ids));
  return { saved, ids };
};

export const removeSavedRoom = (userId, roomId) => {
  const ids = getSavedRoomIds(userId).filter((item) => item !== String(roomId));
  localStorage.setItem(storageKey(userId), JSON.stringify(ids));
  return ids;
};
