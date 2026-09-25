import axios from "axios";
import { createBrowserHistory } from "history";
import AuthService from "../session/AuthService.js";
import http from "./http.js";
import * as APPCONFIG from "./app-config.js";

const history = createBrowserHistory();
// Create axios instance
var axiosApi = axios.create({
  headers: http.AUTH_HEADERS(),
  baseURL: APPCONFIG.API_URL,
});

// Axios response interceptor
axiosApi.interceptors.response.use(
  function (response) {
    return response;
  },
  function (error) {
    if (error && error.response) {
      console.error("error:::", error);
      if (error.response.status) {
        switch (error.response.status) {
          case 401:
            AuthService.removeAuth(); // Remove authentication details
            history.push("/Duracan/login");
            window.location.reload();
            break;
          case 503:
            history.push("/Duracan/login");
            // Handle service unavailable error here (if needed)
            break;
          default:
            history.push("/Duracan/login");
            // Handle other error status codes if needed
            break;
        }
      }
    }

    // Return the error to be handled by the calling code
    return Promise.reject(error);
  }
);

export default axiosApi;
