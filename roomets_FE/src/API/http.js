import AuthService from "../session/AuthService";


const http = {
  HEADERS: () => {
    return {
      "Content-Type": "application/json",
      Accept: "*/*",
      Authorization: "JWT fefege...",
    };
  },
  AUTH_HEADERS: () => {
    return {
      "Content-Type": "application/json",
      Accept: "*/*",
      Authorization: AuthService.getToken(),
    };
  },
  MULTIPART_HEADERS: () => {
    return {
      "Content-Type": "multipart/form-data",
      Accept: "*/*",
      Authorization: AuthService.getToken(),
    };
  },
};

export default http;
