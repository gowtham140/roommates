package com.roomates.security;

import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import com.roomates.model.AuthUser;
import com.roomates.model.User;
import com.roomates.repository.UserRepository;

@Service
public class AuthUserService implements UserDetailsService {

    private final UserRepository userRepository;

    public AuthUserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    public UserDetails loadUserByUsername(String email)
            throws UsernameNotFoundException {

        User user = userRepository.findByMailID(email);

        if (user == null) {
            throw new UsernameNotFoundException(
                    "User not found: " + email
            );
        }

        return new AuthUser(
                user,
                java.util.List.of()
        );
    }
}