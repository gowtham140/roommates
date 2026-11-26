package com.roomates.serviceImp;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import com.roomates.model.EmailOtp;
import com.roomates.repository.EmailOtpRepository;

@Service
public class OtpAttemptService {

    private final EmailOtpRepository otpRepository;

    public OtpAttemptService(EmailOtpRepository otpRepository) {
        this.otpRepository = otpRepository;
    }

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void recordFailedAttempt(Integer id) {
        if (id == null) {
            return;
        }
        otpRepository.findById(id).ifPresent(record -> {
            record.setAttempts(record.getAttempts() + 1);
            otpRepository.save(record);
        });
    }

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void delete(Integer id) {
        if (id == null) {
            return;
        }
        otpRepository.findById(id).ifPresent(otpRepository::delete);
    }
}
