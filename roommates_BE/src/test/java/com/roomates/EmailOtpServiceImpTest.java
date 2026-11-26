package com.roomates;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.lenient;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.time.Clock;
import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneOffset;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import com.roomates.exception.BadRequestException;
import com.roomates.model.EmailOtp;
import com.roomates.model.User;
import com.roomates.repository.EmailOtpRepository;
import com.roomates.repository.UserRepository;
import com.roomates.service.EmailOtpService;
import com.roomates.service.EmailSender;
import com.roomates.serviceImp.EmailOtpServiceImp;
import com.roomates.serviceImp.OtpAttemptService;
import com.roomates.serviceImp.OtpRateLimiter;

@ExtendWith(MockitoExtension.class)
class EmailOtpServiceImpTest {

    @Mock
    private EmailSender emailSender;

    @Mock
    private EmailOtpRepository otpRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private OtpAttemptService otpAttemptService;

    private EmailOtpServiceImp service;

    @BeforeEach
    void setUp() {
        lenient().when(emailSender.isConfigured()).thenReturn(true);
        service = new EmailOtpServiceImp(emailSender, otpRepository, userRepository, passwordEncoder,
                new OtpRateLimiter(), otpAttemptService, 600000L, false);
    }

    @Test
    void sendOtpStoresHashAndMailsCode() {
        when(userRepository.findByMailID("user@example.com")).thenReturn(null);
        when(otpRepository.findByEmailAndPurpose("user@example.com", EmailOtpService.PURPOSE_REGISTER))
                .thenReturn(Optional.empty());
        when(passwordEncoder.encode(anyString())).thenReturn("hashed-otp");

        service.sendOtp(" USER@Example.com ", EmailOtpService.PURPOSE_REGISTER);

        ArgumentCaptor<EmailOtp> otpCaptor = ArgumentCaptor.forClass(EmailOtp.class);
        verify(otpRepository).save(otpCaptor.capture());
        EmailOtp saved = otpCaptor.getValue();
        assertEquals("user@example.com", saved.getEmail());
        assertEquals("hashed-otp", saved.getOtpHash());
        assertEquals(EmailOtpService.PURPOSE_REGISTER, saved.getPurpose());
        assertTrue(saved.getExpiresAt().isAfter(LocalDateTime.now()));

        verify(emailSender).sendText(eq("user@example.com"), anyString(), anyString());
    }

    @Test
    void verifyOtpDeletesRecordOnMatch() {
        EmailOtp record = new EmailOtp();
        record.setId(7);
        record.setEmail("user@example.com");
        record.setPurpose(EmailOtpService.PURPOSE_REGISTER);
        record.setOtpHash("hashed-otp");
        record.setExpiresAt(LocalDateTime.now().plusMinutes(5));

        when(otpRepository.findByEmailAndPurpose("user@example.com", EmailOtpService.PURPOSE_REGISTER))
                .thenReturn(Optional.of(record));
        when(passwordEncoder.matches("123456", "hashed-otp")).thenReturn(true);

        service.verifyOtp("user@example.com", "123456", EmailOtpService.PURPOSE_REGISTER);

        verify(otpAttemptService).delete(7);
    }

    @Test
    void verifyOtpRecordsFailedAttemptOutsideVerificationTransaction() {
        EmailOtp record = new EmailOtp();
        record.setId(9);
        record.setEmail("user@example.com");
        record.setPurpose(EmailOtpService.PURPOSE_REGISTER);
        record.setOtpHash("hashed-otp");
        record.setExpiresAt(LocalDateTime.now().plusMinutes(5));

        when(otpRepository.findByEmailAndPurpose("user@example.com", EmailOtpService.PURPOSE_REGISTER))
                .thenReturn(Optional.of(record));

        assertThrows(BadRequestException.class,
                () -> service.verifyOtp("user@example.com", "000000", EmailOtpService.PURPOSE_REGISTER));
        verify(otpAttemptService).recordFailedAttempt(9);
    }

    @Test
    void resetOtpIsNotSentForUnknownAccount() {
        when(userRepository.findByMailID("unknown@example.com")).thenReturn(null);

        assertThrows(BadRequestException.class,
                () -> service.sendOtp("unknown@example.com", EmailOtpService.PURPOSE_RESET_PASSWORD));
        verify(otpRepository, org.mockito.Mockito.never()).save(any(EmailOtp.class));
    }

    @Test
    void resetOtpIsNotSentForBlockedAccount() {
        User blocked = new User();
        blocked.setStatus(false);
        when(userRepository.findByMailID("blocked@example.com")).thenReturn(blocked);

        assertThrows(BadRequestException.class,
                () -> service.sendOtp("blocked@example.com", EmailOtpService.PURPOSE_RESET_PASSWORD));
        verify(otpRepository, org.mockito.Mockito.never()).save(any(EmailOtp.class));
    }

    @Test
    void sendOtpIsRateLimitedPerEmail() {
        Clock fixedClock = Clock.fixed(Instant.parse("2026-01-01T00:00:00Z"), ZoneOffset.UTC);
        EmailOtpServiceImp limited = new EmailOtpServiceImp(emailSender, otpRepository, userRepository,
                passwordEncoder, new OtpRateLimiter(fixedClock), otpAttemptService, 600000L, false);
        when(userRepository.findByMailID("user@example.com")).thenReturn(null);
        when(passwordEncoder.encode(anyString())).thenReturn("hashed-otp");

        for (int i = 0; i < OtpRateLimiter.MAX_REQUESTS; i++) {
            limited.sendOtp("user@example.com", EmailOtpService.PURPOSE_REGISTER);
        }
        BadRequestException exception = assertThrows(BadRequestException.class,
                () -> limited.sendOtp("user@example.com", EmailOtpService.PURPOSE_REGISTER));

        assertTrue(exception.getMessage().contains("10 minutes"));
        verify(emailSender, times(OtpRateLimiter.MAX_REQUESTS)).sendText(anyString(), anyString(), anyString());
        verify(otpRepository, times(OtpRateLimiter.MAX_REQUESTS)).save(any(EmailOtp.class));
    }

    @Test
    void sendOtpRequiresMailCredentials() {
        when(emailSender.isConfigured()).thenReturn(false);
        EmailOtpServiceImp unconfigured = new EmailOtpServiceImp(emailSender, otpRepository, userRepository,
                passwordEncoder, new OtpRateLimiter(), otpAttemptService, 600000L, false);

        assertThrows(BadRequestException.class,
                () -> unconfigured.sendOtp("user@example.com", EmailOtpService.PURPOSE_REGISTER));
        verify(otpRepository, org.mockito.Mockito.never()).save(any(EmailOtp.class));
    }

    @Test
    void sendOtpUsesConsoleFallbackWhenMailIsUnconfigured() {
        when(emailSender.isConfigured()).thenReturn(false);
        EmailOtpServiceImp console = new EmailOtpServiceImp(emailSender, otpRepository, userRepository,
                passwordEncoder, new OtpRateLimiter(), otpAttemptService, 600000L, true);
        when(userRepository.findByMailID("user@example.com")).thenReturn(null);
        when(otpRepository.findByEmailAndPurpose("user@example.com", EmailOtpService.PURPOSE_REGISTER))
                .thenReturn(Optional.empty());
        when(passwordEncoder.encode(anyString())).thenReturn("hashed-otp");

        String otp = console.sendOtp("user@example.com", EmailOtpService.PURPOSE_REGISTER);

        assertTrue(otp.matches("\\d{6}"));
        verify(otpRepository).save(any(EmailOtp.class));
        verify(emailSender, org.mockito.Mockito.never()).sendText(anyString(), anyString(), anyString());
    }
}
