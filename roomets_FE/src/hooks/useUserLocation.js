import { useCallback, useEffect, useState } from "react";
import { getCurrentPosition } from "../utils/geo";

const shared = { position: null, error: "", requesting: false };
const listeners = new Set();

const updateShared = (partial) => {
  Object.assign(shared, partial);
  listeners.forEach((listener) => listener({ ...shared }));
};

const useUserLocation = () => {
  const [state, setState] = useState({ ...shared });

  useEffect(() => {
    listeners.add(setState);
    return () => listeners.delete(setState);
  }, []);

  const load = useCallback(async (forceRefresh = false) => {
    if (shared.requesting) return;

    updateShared({ requesting: true, error: "" });
    try {
      const next = await getCurrentPosition({ forceRefresh });
      updateShared({ position: next, error: "", requesting: false });
    } catch (err) {
      updateShared({
        error: err?.message || "Location permission was not granted",
        requesting: false,
      });
    }
  }, []);

  useEffect(() => {
    load(false);
  }, [load]);

  const refresh = useCallback(() => load(true), [load]);

  return { ...state, refresh };
};

export default useUserLocation;
