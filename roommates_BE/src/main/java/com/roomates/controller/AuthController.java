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
import com.roomates.service.EmailOtpService;
import com.roomates.webModel.ApiResponse;
import com.roomates.webModel.AuthResponse;
import com.roomates.webModel.LoginRequest;
import com.roomates.webModel.OtpRequest;
import com.roomates.webModel.ProfileRequest;
import com.roomates.webModel.RegisterRequest;
import com.roomates.webModel.ResetPasswordRequest;
import com.roomates.webModel.UserDto;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;
    private final EmailOtpService emailOtpService;

    public AuthController(AuthService authService, EmailOtpService emailOtpService) {
        this.authService = authService;
        this.emailOtpService = emailOtpService;
    }

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<UserDto>> register(@Valid @RequestBody RegisterRequest request) {
        return ResponseEntity.ok(authService.register(request));
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthResponse>> login(@Valid @RequestBody LoginRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }

    @PostMapping("/send-otp")
    public ResponseEntity<ApiResponse<Void>> sendOtp(@Valid @RequestBody OtpRequest request) {
        emailOtpService.sendOtp(request.getEmail(), request.getPurpose());
        return ResponseEntity.ok(ApiResponse.ok("Verification code sent", null));
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<ApiResponse<Void>> forgotPassword(@Valid @RequestBody OtpRequest request) {
        return ResponseEntity.ok(authService.forgotPassword(request.getEmail()));
    }

    @PostMapping("/reset-password")
    public ResponseEntity<ApiResponse<Void>> resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
        return ResponseEntity.ok(authService.resetPassword(request));
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

}
