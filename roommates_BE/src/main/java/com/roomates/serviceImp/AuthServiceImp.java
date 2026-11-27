package com.roomates.serviceImp;

import java.util.Date;
import java.util.List;
import java.util.Locale;
import java.util.regex.Pattern;

import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.roomates.exception.BadRequestException;
import com.roomates.exception.ResourceNotFoundException;
import com.roomates.model.User;
import com.roomates.repository.UserRepository;
import com.roomates.security.TokenUtil;
import com.roomates.security.UserTypes;
import com.roomates.service.AuthService;
import com.roomates.service.EmailOtpService;
import com.roomates.webModel.ApiResponse;
import com.roomates.webModel.AuthResponse;
import com.roomates.webModel.LoginRequest;
import com.roomates.webModel.ProfileRequest;
import com.roomates.webModel.RegisterRequest;
import com.roomates.webModel.ResetPasswordRequest;
import com.roomates.webModel.UserDto;

@Service
public class AuthServiceImp implements AuthService {

    private static final Pattern PHONE_PATTERN = Pattern.compile("\\d{10,15}");

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final TokenUtil tokenUtil;
    private final EmailOtpService emailOtpService;

    public AuthServiceImp(UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            AuthenticationManager authenticationManager,
            TokenUtil tokenUtil,
            EmailOtpService emailOtpService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.authenticationManager = authenticationManager;
        this.tokenUtil = tokenUtil;
        this.emailOtpService = emailOtpService;
    }

    @Override
    @Transactional
    public ApiResponse<UserDto> register(RegisterRequest request) {
        String email = normalize(request.getEmail());
        String phone = digitsOnly(request.getPhone());
        String userType = request.getUserType() == null ? "" : request.getUserType().trim();

        if (userRepository.existsByMailID(email)) {
            throw new BadRequestException("An account with this email already exists");
        }
        if (userRepository.existsByPhoneNo(phone)) {
            throw new BadRequestException("An account with this phone number already exists");
        }

        if (!UserTypes.OWNER.equals(userType) && !UserTypes.SEEKER.equals(userType)) {
            throw new BadRequestException("Please select a valid account type");
        }
        if (request.getConfirmPassword() != null && !request.getConfirmPassword().isBlank()) {
            requirePasswordMatch(request.getPassword(), request.getConfirmPassword());
        }

        emailOtpService.verifyOtp(email, request.getOtp(), EmailOtpService.PURPOSE_REGISTER);

        User user = new User();
        user.setName(request.getName().trim());
        user.setMailID(email);
        user.setPhone_no(phone);
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setGender(request.getGender());
        user.setAge(request.getAge());
        user.setWorkingDetails(trimToNull(request.getWorkingDetails()));
        user.setHobbyPreferences(trimToNull(request.getHobbyPreferences()));
        user.setSeekingClosed(false);
        user.setUserType(userType);
        user.setStatus(true);
        user.setIsDelete(false);
        user.setCreatedDate(new Date());
        user.setUpdatedDate(new Date());

        return ApiResponse.ok("Account created successfully", toDto(userRepository.save(user)));
    }

    @Override
    public ApiResponse<AuthResponse> login(LoginRequest request) {
        String identifier = normalize(request.getEmail());
        List<User> candidates = findUsersByIdentifier(identifier);
        User authenticatedUser = null;
        for (User candidate : candidates) {
            if (Boolean.FALSE.equals(candidate.getStatus()) || Boolean.TRUE.equals(candidate.getIsDelete())) {
                continue;
            }
            try {
                authenticationManager.authenticate(
                        new UsernamePasswordAuthenticationToken(candidate.getMailID(), request.getPassword()));
                authenticatedUser = candidate;
                break;
            } catch (AuthenticationException ignored) {
            }
        }
        if (authenticatedUser == null) {
            throw new BadRequestException("Invalid email or mobile number or password");
        }

        String token = tokenUtil.generateToken(authenticatedUser);
        AuthResponse response = new AuthResponse(
                token, "Bearer", tokenUtil.getValidityMs() / 1000, toDto(authenticatedUser));
        return ApiResponse.ok("Signed in successfully", response);
    }

    @Override
    public ApiResponse<Void> forgotPassword(String email) {
        emailOtpService.sendOtp(email, EmailOtpService.PURPOSE_RESET_PASSWORD);
        return ApiResponse.ok("Verification code sent to your email", null);
    }

    @Override
    @Transactional
    public ApiResponse<Void> resetPassword(ResetPasswordRequest request) {
        String email = normalize(request.getEmail());
        requirePasswordMatch(request.getNewPassword(), request.getConfirmPassword());
        emailOtpService.verifyOtp(email, request.getOtp(), EmailOtpService.PURPOSE_RESET_PASSWORD);

        User user = userRepository.findByMailID(email);
        if (user == null || Boolean.TRUE.equals(user.getIsDelete())) {
            throw new BadRequestException("Account not found");
        }

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        user.setUpdatedDate(new Date());
        userRepository.save(user);
        return ApiResponse.ok("Password reset successfully", null);
    }

    @Override
    @Transactional(readOnly = true)
    public UserDto getCurrentUser(Integer userId) {
        return toDto(findUser(userId));
    }

    @Override
    @Transactional
    public UserDto updateProfile(Integer userId, ProfileRequest request) {
        User user = findUser(userId);
        user.setName(request.getName().trim());
        user.setPhone_no(request.getPhone().trim());
        user.setGender(request.getGender());
        user.setAge(request.getAge());
        user.setWorkingDetails(trimToNull(request.getWorkingDetails()));
        user.setHobbyPreferences(trimToNull(request.getHobbyPreferences()));
        if (request.getSeekingClosed() != null) {
            user.setSeekingClosed(request.getSeekingClosed());
        }
        user.setUpdatedDate(new Date());
        return toDto(userRepository.save(user));
    }

    private User findUser(Integer userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }

    private List<User> findUsersByIdentifier(String identifier) {
        if (identifier == null || identifier.isBlank()) {
            return List.of();
        }
        User user = userRepository.findByMailID(identifier);
        if (user != null) {
            return List.of(user);
        }
        String digits = digitsOnly(identifier);
        return PHONE_PATTERN.matcher(digits).matches() ? userRepository.findByPhoneNo(digits) : List.of();
    }

    private String digitsOnly(String value) {
        return value == null ? "" : value.replaceAll("\\D", "");
    }

    private void requirePasswordMatch(String password, String confirmPassword) {
        if (confirmPassword == null || !confirmPassword.equals(password)) {
            throw new BadRequestException("Password and confirm password must match");
        }
    }

    private String normalize(String email) {
        return email == null ? null : email.trim().toLowerCase(Locale.ROOT);
    }

    private String trimToNull(String value) {
        if (value == null) {
            return null;
        }
        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }

    private UserDto toDto(User user) {
        UserDto dto = new UserDto();
        dto.setId(user.getId());
        dto.setName(user.getName());
        dto.setEmail(user.getMailID());
        dto.setPhone(user.getPhone_no());
        dto.setGender(user.getGender());
        dto.setAge(user.getAge());
        dto.setUserType(user.getUserType());
        dto.setWorkingDetails(user.getWorkingDetails());
        dto.setHobbyPreferences(user.getHobbyPreferences());
        dto.setSeekingClosed(Boolean.TRUE.equals(user.getSeekingClosed()));
        return dto;
    }
}
