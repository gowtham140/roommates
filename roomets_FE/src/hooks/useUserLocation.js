import { useCallback, useEffect, useState } from "react";
import { getCurrentPosition } from "../utils/geo";

const useUserLocation = () => {
  const [position, setPosition] = useState(null);
  const [error, setError] = useState("");
  const [requesting, setRequesting] = useState(true);

  const load = useCallback((forceRefresh = false) => {
    getCurrentPosition({ forceRefresh })
      .then((next) => {
        setPosition(next);
        setError("");
      })
      .catch((err) => {
        setError(err?.message || "Location permission was not granted");
      })
      .finally(() => setRequesting(false));
  }, []);

  const refresh = useCallback(() => load(true), [load]);

  useEffect(() => {
    load(false);
  }, [load]);

  return { position, error, requesting, refresh };
};

export default useUserLocation;
