package com.roomates.service;

import com.roomates.webModel.ApiResponse;
import com.roomates.webModel.AuthResponse;
import com.roomates.webModel.LoginRequest;
import com.roomates.webModel.ProfileRequest;
import com.roomates.webModel.RegisterRequest;
import com.roomates.webModel.UserDto;

public interface AuthService {

    ApiResponse<UserDto> register(RegisterRequest request);

    ApiResponse<AuthResponse> login(LoginRequest request);

    UserDto getCurrentUser(Integer userId);

    UserDto updateProfile(Integer userId, ProfileRequest request);
}
