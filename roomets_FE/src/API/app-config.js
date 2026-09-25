const allowedLocalDomains = ["localhost", "127.0.0.1", "172.16.16.65"];

let URL = "";
const hostname = window.location.hostname;
const origin = window.location.origin;

if (allowedLocalDomains.includes(hostname)) {
  URL = "http://localhost:8080/"; //local
}

export const API_URL = URL;
console.log("API_URL ", API_URL);