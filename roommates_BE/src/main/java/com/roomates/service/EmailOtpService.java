package com.roomates.service;

public interface EmailOtpService {

    String PURPOSE_REGISTER = "REGISTER";
    String PURPOSE_RESET_PASSWORD = "RESET_PASSWORD";

    String sendOtp(String email, String purpose);

    void verifyOtp(String email, String otp, String purpose);
}
