const TOKEN_KEY = "TOKEN";
const USER_KEY = "USER";
const REMEMBER_KEY = "REMEMBER";

const read = (key, storage) => {
  try {
    return storage.getItem(key);
  } catch {
    return null;
  }
};

const write = (key, value, storage) => {
  try {
    if (value === null || value === undefined) {
      storage.removeItem(key);
    } else {
      storage.setItem(key, value);
    }
  } catch {
    return undefined;
  }
};

const AuthService = {
  getToken() {
    return read(TOKEN_KEY, sessionStorage) || read(TOKEN_KEY, localStorage);
  },

  setToken(token, remember = false) {
    write(TOKEN_KEY, token, sessionStorage);
    write(TOKEN_KEY, remember ? token : null, localStorage);
    write(REMEMBER_KEY, remember ? "true" : "false", localStorage);
  },

  getUser() {
    const rawUser = read(USER_KEY, sessionStorage) || read(USER_KEY, localStorage);
    if (!rawUser) {
      return null;
    }
    try {
      return JSON.parse(rawUser);
    } catch {
      return null;
    }
  },

  setUser(user, remember = false) {
    const value = user ? JSON.stringify(user) : null;
    write(USER_KEY, value, sessionStorage);
    write(USER_KEY, remember ? value : null, localStorage);
  },

  isAuthenticated() {
    return Boolean(this.getToken());
  },

  removeAuth() {
    [sessionStorage, localStorage].forEach((storage) => {
      [TOKEN_KEY, USER_KEY, REMEMBER_KEY].forEach((key) => write(key, null, storage));
    });
  },
};

export default AuthService;
