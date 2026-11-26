package com.roomates;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.time.LocalDateTime;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import com.roomates.model.EmailOtp;
import com.roomates.repository.EmailOtpRepository;
import com.roomates.service.EmailOtpService;
import com.roomates.serviceImp.OtpAttemptService;

@SpringBootTest
class OtpAttemptServiceTest {

    @Autowired
    private OtpAttemptService otpAttemptService;

    @Autowired
    private EmailOtpRepository otpRepository;

    @Test
    void failedAttemptAndDeletePersistOutsideCallingTransaction() {
        EmailOtp record = new EmailOtp();
        record.setEmail("attempts@example.com");
        record.setPurpose(EmailOtpService.PURPOSE_REGISTER);
        record.setOtpHash("hash");
        record.setExpiresAt(LocalDateTime.now().plusMinutes(5));
        record.setAttempts(0);
        Integer id = otpRepository.save(record).getId();

        otpAttemptService.recordFailedAttempt(id);

        assertEquals(1, otpRepository.findById(id).orElseThrow().getAttempts());

        otpAttemptService.delete(id);

        assertTrue(otpRepository.findById(id).isEmpty());
    }
}
