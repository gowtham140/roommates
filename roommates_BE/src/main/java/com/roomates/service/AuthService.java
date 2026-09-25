package com.roomates.service;

import com.roomates.webModel.RequestModel;
import com.roomates.webModel.Response;

public interface AuthService {

	Response createUser(RequestModel webmodel);
}
