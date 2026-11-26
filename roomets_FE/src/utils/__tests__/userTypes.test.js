import { describe, expect, it } from "vitest";
import { canManageRooms, isAdmin, isOwner, isSeeker, USER_TYPES } from "../userTypes";

describe("userTypes", () => {
  it("allows only owners to manage rooms", () => {
    expect(canManageRooms({ userType: USER_TYPES.OWNER })).toBe(true);
    expect(canManageRooms({ userType: USER_TYPES.SEEKER })).toBe(false);
    expect(canManageRooms({ userType: USER_TYPES.ADMIN })).toBe(false);
    expect(canManageRooms(null)).toBe(false);
  });

  it("keeps role predicates aligned with stored user types", () => {
    expect(isAdmin({ userType: USER_TYPES.ADMIN })).toBe(true);
    expect(isOwner({ userType: USER_TYPES.OWNER })).toBe(true);
    expect(isSeeker({ userType: USER_TYPES.SEEKER })).toBe(true);
  });
});
