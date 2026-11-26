import { beforeEach, describe, expect, it } from "vitest";
import {
  getSavedRoomIds,
  isRoomSaved,
  mergeGuestSavedRooms,
  pruneSavedRooms,
  removeSavedRoom,
  setSavedRoomIds,
  toggleSavedRoom,
} from "../savedRooms";

describe("savedRooms", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("deduplicates ids and ignores empty values", () => {
    expect(setSavedRoomIds(null, ["1", 1, undefined, "2", "1"])).toEqual(["1", "2"]);
    expect(getSavedRoomIds(null)).toEqual(["1", "2"]);
  });

  it("toggles and removes saved rooms", () => {
    expect(toggleSavedRoom(null, 7)).toEqual({ saved: true, ids: ["7"] });
    expect(isRoomSaved(null, "7")).toBe(true);
    expect(toggleSavedRoom(null, "7")).toEqual({ saved: false, ids: [] });
    setSavedRoomIds(null, ["3", "4"]);
    expect(removeSavedRoom(null, 3)).toEqual(["4"]);
  });

  it("merges guest likes into a user and clears the guest list", () => {
    setSavedRoomIds(null, ["9", "10"]);
    setSavedRoomIds(5, ["10", "11"]);

    expect(mergeGuestSavedRooms(5)).toEqual(["10", "11", "9"]);
    expect(getSavedRoomIds(null)).toEqual([]);
  });

  it("prunes ids that can no longer be loaded", () => {
    setSavedRoomIds(5, ["1", "2", "3"]);

    expect(pruneSavedRooms(5, ["2", "3"])).toEqual(["2", "3"]);
    expect(getSavedRoomIds(5)).toEqual(["2", "3"]);
  });
});
