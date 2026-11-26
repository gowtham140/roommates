const storageKey = (userId) => `savedRoomIds:${userId ?? "guest"}`;

const normalizeIds = (value) =>
  Array.isArray(value)
    ? [...new Set(value.filter((id) => id !== null && id !== undefined).map(String))]
    : [];

const readIds = (userId) => {
  try {
    return normalizeIds(JSON.parse(localStorage.getItem(storageKey(userId)) || "[]"));
  } catch {
    return [];
  }
};

const writeIds = (userId, ids) => {
  const normalized = normalizeIds(ids);
  try {
    localStorage.setItem(storageKey(userId), JSON.stringify(normalized));
  } catch {
    return normalized;
  }
  return normalized;
};

export const getSavedRoomIds = (userId) => readIds(userId);

export const setSavedRoomIds = (userId, ids) => writeIds(userId, ids);

export const isRoomSaved = (userId, roomId) =>
  roomId != null && readIds(userId).includes(String(roomId));

export const toggleSavedRoom = (userId, roomId) => {
  const id = String(roomId);
  const current = readIds(userId);
  const saved = !current.includes(id);
  const ids = saved ? [...current, id] : current.filter((item) => item !== id);
  return { saved, ids: writeIds(userId, ids) };
};

export const removeSavedRoom = (userId, roomId) =>
  writeIds(
    userId,
    readIds(userId).filter((item) => item !== String(roomId))
  );

export const mergeGuestSavedRooms = (userId) => {
  if (userId == null) return readIds(null);

  const guestIds = readIds(null);
  const userIds = readIds(userId);
  const merged = writeIds(userId, [...userIds, ...guestIds]);
  writeIds(null, []);
  return merged;
};

export const pruneSavedRooms = (userId, validIds) => {
  const available = new Set((validIds || []).map(String));
  const current = readIds(userId);
  const kept = current.filter((id) => available.has(id));
  return kept.length === current.length ? current : writeIds(userId, kept);
};
