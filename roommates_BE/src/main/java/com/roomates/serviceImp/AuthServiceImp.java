package com.roomates.serviceImp;

import java.util.Date;
import java.util.Locale;

import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.Authentication;
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
import com.roomates.webModel.ApiResponse;
import com.roomates.webModel.AuthResponse;
import com.roomates.webModel.LoginRequest;
import com.roomates.webModel.ProfileRequest;
import com.roomates.webModel.RegisterRequest;
import com.roomates.webModel.UserDto;

@Service
public class AuthServiceImp implements AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final TokenUtil tokenUtil;

    public AuthServiceImp(UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            AuthenticationManager authenticationManager,
            TokenUtil tokenUtil) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.authenticationManager = authenticationManager;
        this.tokenUtil = tokenUtil;
    }

    @Override
    @Transactional
    public ApiResponse<UserDto> register(RegisterRequest request) {
        String email = normalize(request.getEmail());
        String userType = request.getUserType() == null ? "" : request.getUserType().trim();

        if (userRepository.existsByMailID(email)) {
            throw new BadRequestException("An account with this email already exists");
        }

        if (!UserTypes.OWNER.equals(userType) && !UserTypes.SEEKER.equals(userType)) {
            throw new BadRequestException("Please select a valid account type");
        }

        User user = new User();
        user.setName(request.getName().trim());
        user.setMailID(email);
        user.setPhone_no(request.getPhone().trim());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setCpassword(request.getPassword());
        user.setGender(request.getGender());
        user.setAge(request.getAge());
        user.setUserType(userType);
        user.setStatus(true);
        user.setIsDelete(false);
        user.setCreatedDate(new Date());
        user.setUpdatedDate(new Date());

        return ApiResponse.ok("Account created successfully", toDto(userRepository.save(user)));
    }

    @Override
    public ApiResponse<AuthResponse> login(LoginRequest request) {
        String email = normalize(request.getEmail());
        Authentication authentication;
        try {
            authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(email, request.getPassword()));
        } catch (AuthenticationException e) {
            throw new BadRequestException("Invalid email or password");
        }

        User user = userRepository.findByMailID(email);
        if (user == null || Boolean.FALSE.equals(user.getStatus()) || Boolean.TRUE.equals(user.getIsDelete())) {
            throw new BadRequestException("This account is not active");
        }

        String token = tokenUtil.generateToken(user);
        AuthResponse response = new AuthResponse(
                token, "Bearer", tokenUtil.getValidityMs() / 1000, toDto(user));
        return ApiResponse.ok("Signed in successfully", response);
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
        user.setUpdatedDate(new Date());
        return toDto(userRepository.save(user));
    }

    private User findUser(Integer userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }

    private String normalize(String email) {
        return email == null ? null : email.trim().toLowerCase(Locale.ROOT);
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
        return dto;
    }
}
