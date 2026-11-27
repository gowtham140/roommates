package com.roomates.security;

import java.util.List;
import java.util.Locale;
import java.util.regex.Pattern;

import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import com.roomates.model.AuthUser;
import com.roomates.model.User;
import com.roomates.repository.UserRepository;

@Service
public class AuthUserService implements UserDetailsService {

    private static final Pattern PHONE_PATTERN = Pattern.compile("\\d{10,15}");

    private final UserRepository userRepository;

    public AuthUserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    public UserDetails loadUserByUsername(String identifier) throws UsernameNotFoundException {
        User user = findUser(identifier);
        if (user == null) {
            throw new UsernameNotFoundException("Invalid email or mobile number or password");
        }
        return AuthUser.from(user);
    }

    private User findUser(String identifier) {
        if (identifier == null || identifier.isBlank()) {
            return null;
        }
        String normalized = identifier.trim().toLowerCase(Locale.ROOT);
        User user = userRepository.findByMailID(normalized);
        if (user != null) {
            return user;
        }
        String digits = normalized.replaceAll("\\D", "");
        if (!PHONE_PATTERN.matcher(digits).matches()) {
            return null;
        }
        List<User> users = userRepository.findByPhoneNo(digits);
        return users.stream()
                .filter(candidate -> !Boolean.FALSE.equals(candidate.getStatus()))
                .filter(candidate -> !Boolean.TRUE.equals(candidate.getIsDelete()))
                .findFirst()
                .orElse(null);
    }
}
