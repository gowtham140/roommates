export const USER_TYPES = Object.freeze({
  ADMIN: "1",
  OWNER: "2",
  SEEKER: "3",
});

export const isAdmin = (user) => user?.userType === USER_TYPES.ADMIN;
export const isOwner = (user) => user?.userType === USER_TYPES.OWNER;
export const isSeeker = (user) => user?.userType === USER_TYPES.SEEKER;
export const canManageRooms = (user) => isOwner(user);
