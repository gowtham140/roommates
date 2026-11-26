package com.roomates;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.time.LocalDateTime;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.security.crypto.password.PasswordEncoder;

import com.roomates.exception.BadRequestException;
import com.roomates.model.EmailOtp;
import com.roomates.model.User;
import com.roomates.repository.EmailOtpRepository;
import com.roomates.repository.UserRepository;
import com.roomates.service.EmailOtpService;
import com.roomates.serviceImp.EmailOtpServiceImp;

@ExtendWith(MockitoExtension.class)
class EmailOtpServiceImpTest {

    @Mock
    private JavaMailSender mailSender;

    @Mock
    private EmailOtpRepository otpRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    private EmailOtpServiceImp service;

    @BeforeEach
    void setUp() {
        service = new EmailOtpServiceImp(mailSender, otpRepository, userRepository, passwordEncoder,
                "", "account@gmail.com", "app-password", 600000L);
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

        ArgumentCaptor<SimpleMailMessage> mailCaptor = ArgumentCaptor.forClass(SimpleMailMessage.class);
        verify(mailSender).send(mailCaptor.capture());
        assertEquals("account@gmail.com", mailCaptor.getValue().getFrom());
        assertEquals("user@example.com", mailCaptor.getValue().getTo()[0]);
    }

    @Test
    void verifyOtpDeletesRecordOnMatch() {
        EmailOtp record = new EmailOtp();
        record.setEmail("user@example.com");
        record.setPurpose(EmailOtpService.PURPOSE_REGISTER);
        record.setOtpHash("hashed-otp");
        record.setExpiresAt(LocalDateTime.now().plusMinutes(5));

        when(otpRepository.findByEmailAndPurpose("user@example.com", EmailOtpService.PURPOSE_REGISTER))
                .thenReturn(Optional.of(record));
        when(passwordEncoder.matches("123456", "hashed-otp")).thenReturn(true);

        service.verifyOtp("user@example.com", "123456", EmailOtpService.PURPOSE_REGISTER);

        verify(otpRepository).delete(record);
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
    void sendOtpRequiresMailCredentials() {
        EmailOtpServiceImp unconfigured = new EmailOtpServiceImp(mailSender, otpRepository, userRepository,
                passwordEncoder, "", "", "", 600000L);

        assertThrows(BadRequestException.class,
                () -> unconfigured.sendOtp("user@example.com", EmailOtpService.PURPOSE_REGISTER));
        verify(otpRepository, org.mockito.Mockito.never()).save(any(EmailOtp.class));
    }
}
