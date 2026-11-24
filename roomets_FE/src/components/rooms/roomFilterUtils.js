export const ROOM_FILTER_KEYS = [
  "location",
  "minRent",
  "maxRent",
  "roomType",
  "gender",
  "food",
  "foodPreference",
];

export const createRoomFilterValues = (source = {}) => ({
  location: source.location || "",
  minRent: source.minRent || "",
  maxRent: source.maxRent || "",
  roomType: source.roomType || "",
  gender: source.gender || "",
  food: source.food || "",
  foodPreference: source.foodPreference || "",
  sort: source.sort || "recommended",
});

export const toRoomFilterQuery = (values) => {
  const query = new URLSearchParams();
  Object.entries(values).forEach(([key, value]) => {
    if (value && !(key === "sort" && value === "recommended")) {
      query.set(key, value);
    }
  });
  return query;
};
