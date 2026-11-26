package com.roomates.serviceImp;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.Locale;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import com.roomates.exception.BadRequestException;
import com.roomates.model.EmailOtp;
import com.roomates.model.User;
import com.roomates.repository.EmailOtpRepository;
import com.roomates.repository.UserRepository;
import com.roomates.service.EmailOtpService;
import com.roomates.service.EmailSender;

@Service
public class EmailOtpServiceImp implements EmailOtpService {

	private static final Logger log = LoggerFactory.getLogger(EmailOtpServiceImp.class);
	private static final int MAX_ATTEMPTS = 5;
	private static final SecureRandom RANDOM = new SecureRandom();

	private final EmailSender emailSender;
	private final EmailOtpRepository otpRepository;
	private final UserRepository userRepository;
	private final PasswordEncoder passwordEncoder;
	private final OtpRateLimiter rateLimiter;
	private final OtpAttemptService otpAttemptService;
	private final long expirationMs;
	private final boolean devConsoleOtp;

	public EmailOtpServiceImp(EmailSender emailSender, EmailOtpRepository otpRepository,
			UserRepository userRepository, PasswordEncoder passwordEncoder, OtpRateLimiter rateLimiter,
			OtpAttemptService otpAttemptService, @Value("${app.otp.expiration-ms:600000}") long expirationMs,
			@Value("${app.mail.dev-console-otp:false}") boolean devConsoleOtp) {

		this.emailSender = emailSender;
		this.otpRepository = otpRepository;
		this.userRepository = userRepository;
		this.passwordEncoder = passwordEncoder;
		this.rateLimiter = rateLimiter;
		this.otpAttemptService = otpAttemptService;
		this.expirationMs = expirationMs;
		this.devConsoleOtp = devConsoleOtp;
	}

	@Override
	@Transactional
	public String sendOtp(String email, String purpose) {
		String normalized = normalize(email);
		requireSupportedPurpose(purpose);
		boolean mailConfigured = emailSender.isConfigured();
		if (!mailConfigured && !devConsoleOtp) {
			throw new BadRequestException("Email service is not configured yet. Please contact support");
		}

		User user = userRepository.findByMailID(normalized);
		if (PURPOSE_REGISTER.equals(purpose)) {
			if (user != null) {
				throw new BadRequestException("An account with this email already exists");
			}
		} else if (user == null || Boolean.FALSE.equals(user.getStatus()) || Boolean.TRUE.equals(user.getIsDelete())) {
			throw new BadRequestException("Account not found or blocked. Please contact support.");
		}

		rateLimiter.checkAllowed(normalized);
		String otp = generateOtp();

		EmailOtp record = otpRepository.findByEmailAndPurpose(normalized, purpose).orElseGet(EmailOtp::new);
		record.setEmail(normalized);
		record.setPurpose(purpose);
		record.setOtpHash(passwordEncoder.encode(otp));
		record.setExpiresAt(LocalDateTime.now().plus(expirationMs, ChronoUnit.MILLIS));
		record.setAttempts(0);
		otpRepository.save(record);
		otpRepository.deleteByExpiresAtBefore(LocalDateTime.now());

		if (!mailConfigured) {
			log.warn("Email is not configured; OTP delivery is using the console for {}. Code: {}", normalized, otp);
			return otp;
		}

		String subject;
		String text;
		if (PURPOSE_REGISTER.equals(purpose)) {
			subject = "Verify your email - RoomMate Finder";
			text = "Your email verification code is " + otp + ". It expires in " + (expirationMs / 60000)
					+ " minutes.";
		} else {
			subject = "Reset your password - RoomMate Finder";
			text = "Your password reset code is " + otp + ". It expires in " + (expirationMs / 60000)
					+ " minutes. If you did not request this, you can ignore this email.";
		}

		try {
			emailSender.sendText(normalized, subject, text);
			log.info("OTP email successfully sent to {}", normalized);
		} catch (RuntimeException ex) {
			log.error("OTP email failed for {}", normalized, ex);
			otpAttemptService.delete(record.getId());
			rateLimiter.refund(normalized);
			throw new BadRequestException("Unable to send the verification email right now");
		}
		return null;
	}

	@Override
	@Transactional
	public void verifyOtp(String email, String otp, String purpose) {
		String normalized = normalize(email);
		requireSupportedPurpose(purpose);

		EmailOtp record = otpRepository.findByEmailAndPurpose(normalized, purpose)
				.orElseThrow(() -> new BadRequestException("Invalid or expired verification code"));

		if (record.getExpiresAt() == null || record.getExpiresAt().isBefore(LocalDateTime.now())) {
			otpAttemptService.delete(record.getId());
			throw new BadRequestException("Verification code has expired. Please request a new one");
		}

		if (record.getAttempts() >= MAX_ATTEMPTS) {
			otpAttemptService.delete(record.getId());
			throw new BadRequestException("Too many incorrect attempts. Please request a new code");
		}

		if (otp == null || !passwordEncoder.matches(otp.trim(), record.getOtpHash())) {
			otpAttemptService.recordFailedAttempt(record.getId());
			throw new BadRequestException("Incorrect verification code");
		}

		otpAttemptService.delete(record.getId());
	}

	private void requireSupportedPurpose(String purpose) {
		if (!PURPOSE_REGISTER.equals(purpose) && !PURPOSE_RESET_PASSWORD.equals(purpose)) {
			throw new BadRequestException("Invalid verification purpose");
		}
	}

	private String normalize(String email) {
		if (!StringUtils.hasText(email)) {
			throw new BadRequestException("Email is required");
		}
		return email.trim().toLowerCase(Locale.ROOT);
	}

	private String generateOtp() {
		return String.valueOf(RANDOM.nextInt(900000) + 100000);
	}
}
