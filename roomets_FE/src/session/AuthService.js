class AuthService {
  readJwtToken(key) {
    const appJwtToken = sessionStorage.getItem("TOKEN");
    if (appJwtToken) {
      const payload = appJwtToken.split(".")[1];
      let jwtObj = JSON.parse(atob(payload));

      return jwtObj[key];
    } else {
      return "";
    }
  }

  registerEmail(email) {
    sessionStorage.setItem("email", email);
  }

  registerAlertShow() {
    sessionStorage.setItem("alert", true);
  }

  registerAuth(loginValue) {
    // sessionStorage.setItem("authUsers", loginValue.userName);
    // sessionStorage.setItem("authType", loginValue.uType);
    // sessionStorage.setItem("authID", loginValue.uId);
    // sessionStorage.setItem("authMailId", loginValue.mailID);
    sessionStorage.setItem("loginValue", JSON.stringify(loginValue));
  }

  getLoginValue() {
    // let loginValue = sessionStorage.getItem("loginValue");
    // var obj = JSON.parse(loginValue);
    return this.readJwtToken("authUsers");
  }

  getName() {
    let loginValue = JSON.parse(sessionStorage.getItem("loginValue"));
    return loginValue.firstName + " " + loginValue.lastName;
  }

  storeIpAddress(ipAddress) {
    sessionStorage.setItem("ipAddress", JSON.stringify(ipAddress));
  }

  registerArea(areaValues) {
    sessionStorage.setItem("areaValues", JSON.stringify(areaValues));
  }

  getUserType() {
    // let type = sessionStorage.getItem("authType");
    // return type;
    return this.readJwtToken("userType");
  }

  getAuthId() {
    // let type = sessionStorage.getItem("authID");
    return this.readJwtToken("userId");
  }

  setNavMenuShow(value) {
    sessionStorage.setItem("navMenuShow", value);
  }

  setClientList(value) {
    const jsonString = JSON.stringify(value);
    sessionStorage.setItem("clientList", jsonString);
  }

  getClientList() {
    const jsonString = sessionStorage.getItem("clientList");
    return JSON.parse(jsonString);
  }

  getNavMenuShow() {
    let value = sessionStorage.getItem("navMenuShow");
    if (value === "false") {
      return false;
    } else {
      return true;
    }
  }
  getToken() {
    let token = "Bearer " + sessionStorage.getItem("TOKEN");
    return token;
  }

  registerToken(token) {
    sessionStorage.setItem("TOKEN", token);
  }

  isAuth() {
    // let user = sessionStorage.getItem("authUsers");
    let user = this.readJwtToken("authUsers");

    if (user) return true;
    return false;
  }

  removeAuth() {
    sessionStorage.clear();
  }
}

export default new AuthService();
