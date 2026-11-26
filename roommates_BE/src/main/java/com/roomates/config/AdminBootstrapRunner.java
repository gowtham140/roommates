package com.roomates.config;

import java.time.LocalDate;
import java.util.Date;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import com.roomates.model.User;
import com.roomates.repository.UserRepository;
import com.roomates.security.UserTypes;

@Component
@Profile("prod")
public class AdminBootstrapRunner implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(AdminBootstrapRunner.class);

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final String email;
    private final String password;

    public AdminBootstrapRunner(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            @Value("${app.admin.bootstrap.email:}") String email,
            @Value("${app.admin.bootstrap.password:}") String password) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.email = email;
        this.password = password;
    }

    @Override
    @Transactional
    public void run(String... args) {
        if (!StringUtils.hasText(email) || !StringUtils.hasText(password)) {
            return;
        }
        String normalized = email.trim().toLowerCase(java.util.Locale.ROOT);
        if (userRepository.findByMailID(normalized) != null) {
            return;
        }

        User admin = new User();
        admin.setName("Administrator");
        admin.setMailID(normalized);
        admin.setPhone_no("0000000000");
        admin.setPassword(passwordEncoder.encode(password));
        admin.setGender("ANY");
        admin.setAge(LocalDate.now().getYear() - 1990);
        admin.setStatus(true);
        admin.setIsDelete(false);
        admin.setSeekingClosed(false);
        admin.setUserType(UserTypes.ADMIN);
        admin.setCreatedDate(new Date());
        admin.setUpdatedDate(new Date());
        userRepository.save(admin);
        log.info("Created bootstrap admin account for {}", normalized);
    }
}
