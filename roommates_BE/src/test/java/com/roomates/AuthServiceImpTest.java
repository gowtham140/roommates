package com.roomates;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;

import com.roomates.exception.BadRequestException;
import com.roomates.model.User;
import com.roomates.repository.UserRepository;
import com.roomates.security.TokenUtil;
import com.roomates.service.EmailOtpService;
import com.roomates.serviceImp.AuthServiceImp;
import com.roomates.webModel.ApiResponse;
import com.roomates.webModel.AuthResponse;
import com.roomates.webModel.LoginRequest;
import com.roomates.webModel.RegisterRequest;
import com.roomates.webModel.ResetPasswordRequest;

@ExtendWith(MockitoExtension.class)
class AuthServiceImpTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private AuthenticationManager authenticationManager;

    @Mock
    private TokenUtil tokenUtil;

    @Mock
    private EmailOtpService emailOtpService;

    @Mock
    private Authentication authentication;

    private AuthServiceImp service;

    @BeforeEach
    void setUp() {
        service = new AuthServiceImp(userRepository, passwordEncoder, authenticationManager, tokenUtil,
                emailOtpService);
    }

    @Test
    void registerHashesPasswordAndStoresNormalizedEmail() {
        RegisterRequest request = new RegisterRequest();
        request.setName("  Test User ");
        request.setEmail(" TEST@Example.COM ");
        request.setPhone("9876543210");
        request.setPassword("secret123");
        request.setConfirmPassword("secret123");
        request.setOtp("123456");
        request.setGender("FEMALE");
        request.setUserType("3");

        when(userRepository.existsByMailID("test@example.com")).thenReturn(false);
        when(passwordEncoder.encode("secret123")).thenReturn("$2a$hashed");
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> invocation.getArgument(0));

        ApiResponse<?> result = service.register(request);

        assertTrue(result.isSuccess());
        ArgumentCaptor<User> captor = ArgumentCaptor.forClass(User.class);
        org.mockito.Mockito.verify(userRepository).save(captor.capture());
        User saved = captor.getValue();
        assertEquals("test@example.com", saved.getMailID());
        assertEquals("$2a$hashed", saved.getPassword());
        assertEquals("Test User", saved.getName());
        assertEquals("9876543210", saved.getPhone_no());
        assertEquals("3", saved.getUserType());
        verify(emailOtpService).verifyOtp("test@example.com", "123456", EmailOtpService.PURPOSE_REGISTER);
    }

    @Test
    void registerRejectsMismatchedPasswordConfirmation() {
        RegisterRequest request = new RegisterRequest();
        request.setName("Test");
        request.setEmail("test@example.com");
        request.setPhone("9876543210");
        request.setPassword("secret123");
        request.setConfirmPassword("different");
        request.setOtp("123456");
        request.setGender("FEMALE");
        request.setUserType("3");

        when(userRepository.existsByMailID("test@example.com")).thenReturn(false);

        assertThrows(BadRequestException.class, () -> service.register(request));
        org.mockito.Mockito.verify(userRepository, org.mockito.Mockito.never()).save(any(User.class));
        org.mockito.Mockito.verify(emailOtpService, org.mockito.Mockito.never()).verifyOtp(any(), any(), any());
    }

    @Test
    void registerRejectsDuplicateEmail() {
        RegisterRequest request = new RegisterRequest();
        request.setName("Test");
        request.setEmail("test@example.com");
        request.setPhone("9876543210");
        request.setPassword("secret123");

        when(userRepository.existsByMailID("test@example.com")).thenReturn(true);

        assertThrows(BadRequestException.class, () -> service.register(request));
    }

    @Test
    void registerRejectsInvalidAccountType() {
        RegisterRequest request = new RegisterRequest();
        request.setName("Test");
        request.setEmail("new@example.com");
        request.setPhone("9876543210");
        request.setPassword("secret123");
        request.setUserType("1");

        when(userRepository.existsByMailID("new@example.com")).thenReturn(false);

        assertThrows(BadRequestException.class, () -> service.register(request));
    }

    @Test
    void loginReturnsTokenAndUser() {
        LoginRequest request = new LoginRequest();
        request.setEmail("test@example.com");
        request.setPassword("secret123");

        User user = new User();
        user.setId(7);
        user.setName("Test");
        user.setMailID("test@example.com");
        user.setPhone_no("9876543210");
        user.setUserType("2");
        user.setStatus(true);
        user.setIsDelete(false);

        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class)))
                .thenReturn(authentication);
        when(userRepository.findByMailID("test@example.com")).thenReturn(user);
        when(tokenUtil.generateToken(user)).thenReturn("jwt-token");
        when(tokenUtil.getValidityMs()).thenReturn(86400000L);

        ApiResponse<AuthResponse> result = service.login(request);

        assertTrue(result.isSuccess());
        assertEquals("jwt-token", result.getData().getToken());
        assertEquals(7, result.getData().getUser().getId());
        assertEquals("test@example.com", result.getData().getUser().getEmail());
    }

    @Test
    void resetPasswordUpdatesHashConsumesOtpAndReturnsSuccess() {
        ResetPasswordRequest request = new ResetPasswordRequest();
        request.setEmail(" TEST@Example.com ");
        request.setOtp("654321");
        request.setNewPassword("newSecret");
        request.setConfirmPassword("newSecret");

        User user = new User();
        user.setMailID("test@example.com");
        user.setPassword("oldHash");

        when(userRepository.findByMailID("test@example.com")).thenReturn(user);
        when(passwordEncoder.encode("newSecret")).thenReturn("newHash");

        ApiResponse<Void> result = service.resetPassword(request);

        assertTrue(result.isSuccess());
        assertEquals("newHash", user.getPassword());
        verify(emailOtpService).verifyOtp("test@example.com", "654321", EmailOtpService.PURPOSE_RESET_PASSWORD);
        verify(userRepository).save(user);
    }

    @Test
    void resetPasswordStopsWhenOtpIsInvalid() {
        ResetPasswordRequest request = new ResetPasswordRequest();
        request.setEmail("test@example.com");
        request.setOtp("000000");
        request.setNewPassword("newSecret");
        request.setConfirmPassword("newSecret");

        org.mockito.Mockito.doThrow(new BadRequestException("Incorrect verification code"))
                .when(emailOtpService)
                .verifyOtp("test@example.com", "000000", EmailOtpService.PURPOSE_RESET_PASSWORD);

        assertThrows(BadRequestException.class, () -> service.resetPassword(request));
        verify(userRepository, org.mockito.Mockito.never()).save(any(User.class));
    }
}
