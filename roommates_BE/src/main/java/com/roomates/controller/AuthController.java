package com.roomates.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.roomates.model.AuthUser;
import com.roomates.service.AuthService;
import com.roomates.webModel.ApiResponse;
import com.roomates.webModel.AuthResponse;
import com.roomates.webModel.LoginRequest;
import com.roomates.webModel.ProfileRequest;
import com.roomates.webModel.RegisterRequest;
import com.roomates.webModel.RequestModel;
import com.roomates.webModel.UserDto;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/test")
    public String test() {
        return "Hello world";
    }

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<UserDto>> register(@Valid @RequestBody RegisterRequest request) {
        return ResponseEntity.ok(authService.register(request));
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthResponse>> login(@Valid @RequestBody LoginRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<UserDto>> me(@AuthenticationPrincipal AuthUser principal) {
        return ResponseEntity.ok(ApiResponse.ok(authService.getCurrentUser(principal.getUserId())));
    }

    @PutMapping("/me")
    public ResponseEntity<ApiResponse<UserDto>> updateMe(
            @AuthenticationPrincipal AuthUser principal,
            @Valid @RequestBody ProfileRequest request) {
        return ResponseEntity.ok(ApiResponse.ok("Profile updated", authService.updateProfile(principal.getUserId(), request)));
    }

    @PostMapping("/createUser")
    public ResponseEntity<ApiResponse<UserDto>> createUser(@RequestBody RequestModel legacy) {
        RegisterRequest request = new RegisterRequest();
        request.setName(legacy.getName());
        request.setEmail(legacy.getEmail());
        request.setPhone(legacy.getPhone());
        request.setPassword(legacy.getPassword());
        request.setGender(legacy.getGender());
        request.setAge(legacy.getAge());
        return register(request);
    }
}
