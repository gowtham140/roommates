import { useCallback, useEffect, useMemo, useState } from "react";
import AuthService from "../session/AuthService";
import { SESSION_EXPIRED_EVENT } from "../session/sessionEvents";
import { getMe, login as loginRequest, register as registerRequest, updateMe } from "../API/authAPI";
import { mergeGuestSavedRooms } from "../utils/savedRooms";
import { AuthContext } from "./authContext";

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => AuthService.getToken());
  const [user, setUser] = useState(() => AuthService.getUser());
  const [loading, setLoading] = useState(Boolean(AuthService.getToken()));
  const [sessionExpired, setSessionExpired] = useState(false);

  useEffect(() => {
    if (!token) {
      return;
    }

    let active = true;
    getMe()
      .then((profile) => {
        if (!active) return;
        setUser(profile);
        AuthService.setUser(profile);
        setSessionExpired(false);
      })
      .catch(() => {
        if (!active) return;
        AuthService.removeAuth();
        setToken(null);
        setUser(null);
        setSessionExpired(true);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [token]);

  useEffect(() => {
    const handleSessionExpired = () => {
      AuthService.removeAuth();
      setToken(null);
      setUser(null);
      setLoading(false);
      setSessionExpired(true);
    };

    window.addEventListener(SESSION_EXPIRED_EVENT, handleSessionExpired);
    return () => window.removeEventListener(SESSION_EXPIRED_EVENT, handleSessionExpired);
  }, []);

  const login = useCallback(async (emailOrPayload, password, remember = false) => {
    const payload =
      typeof emailOrPayload === "string"
        ? { email: emailOrPayload, password, remember }
        : { ...emailOrPayload, remember: emailOrPayload.remember ?? remember };
    const result = await loginRequest(payload);
    const shouldRemember = Boolean(payload.remember);

    AuthService.setToken(result.token, shouldRemember);
    AuthService.setUser(result.user, shouldRemember);
    mergeGuestSavedRooms(result.user?.id);
    setToken(result.token);
    setUser(result.user);
    setSessionExpired(false);
    return result;
  }, []);

  const register = useCallback(async (payload) => registerRequest(payload), []);

  const updateUser = useCallback(async (payload) => {
    const updated = await updateMe(payload);
    setUser(updated);
    AuthService.setUser(updated);
    return updated;
  }, []);

  const clearSessionExpired = useCallback(() => setSessionExpired(false), []);

  const logout = useCallback(() => {
    AuthService.removeAuth();
    setToken(null);
    setUser(null);
    setSessionExpired(false);
  }, []);

  const value = useMemo(
    () => ({
      user,
      token,
      loading,
      login,
      register,
      logout,
      updateUser,
      sessionExpired,
      clearSessionExpired,
    }),
    [
      user,
      token,
      loading,
      login,
      register,
      logout,
      updateUser,
      sessionExpired,
      clearSessionExpired,
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthProvider;
