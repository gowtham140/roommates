import { useEffect } from "react";

const useLoadEffect = (load) => {
  useEffect(() => {
    let cancelled = false;
    let cleanup;
    const timer = window.setTimeout(() => {
      if (cancelled) return;
      cleanup = load();
    }, 0);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
      if (typeof cleanup === "function") cleanup();
    };
  }, [load]);
};

export default useLoadEffect;
