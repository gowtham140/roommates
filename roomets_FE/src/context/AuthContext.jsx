import { useCallback, useEffect, useMemo, useState } from "react";
import AuthService from "../session/AuthService";
import { getMe, login as loginRequest, register as registerRequest, updateMe } from "../API/authAPI";
import { AuthContext } from "./authContext";

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => AuthService.getToken());
  const [user, setUser] = useState(() => AuthService.getUser());
  const [loading, setLoading] = useState(Boolean(AuthService.getToken()));

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
      })
      .catch(() => {
        if (!active) return;
        AuthService.removeAuth();
        setToken(null);
        setUser(null);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [token]);

  const login = useCallback(async (emailOrPayload, password) => {
    const payload =
      typeof emailOrPayload === "string"
        ? { email: emailOrPayload, password }
        : emailOrPayload;
    const result = await loginRequest(payload);
    AuthService.setToken(result.token);
    AuthService.setUser(result.user);
    setToken(result.token);
    setUser(result.user);
    return result;
  }, []);

  const register = useCallback(async (payload) => registerRequest(payload), []);

  const updateUser = useCallback(async (payload) => {
    const updated = await updateMe(payload);
    setUser(updated);
    AuthService.setUser(updated);
    return updated;
  }, []);

  const logout = useCallback(() => {
    AuthService.removeAuth();
    setToken(null);
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({ user, token, loading, login, register, logout, updateUser }),
    [user, token, loading, login, register, logout, updateUser]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthProvider;
