package com.roomates.security;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableMethodSecurity
public class WebSecurityConfig {

    private final AuthEntryPoint authEntryPoint;
    private final AuthRequestFilter requestFilter;

    public WebSecurityConfig(
            AuthEntryPoint authEntryPoint,
            AuthRequestFilter requestFilter) {

        this.authEntryPoint = authEntryPoint;
        this.requestFilter = requestFilter;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationManager authenticationManager(
            AuthenticationConfiguration configuration) throws Exception {

        return configuration.getAuthenticationManager();
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http)
            throws Exception {

        http
            // REST API -> CSRF disabled
            .csrf(csrf -> csrf.disable())

            // CORS
            .cors(cors -> {})

            // No HTTP session for JWT authentication
            .sessionManagement(session ->
                session.sessionCreationPolicy(
                    SessionCreationPolicy.STATELESS
                )
            )

            // Authorization rules
            .authorizeHttpRequests(auth -> auth

                // Public authentication APIs
                .requestMatchers("/api/auth/**").permitAll()

                // You can add other public endpoints here
                .requestMatchers(
                    "/",
                    "/error",
                    "/swagger-ui/**",
                    "/v3/api-docs/**"
                ).permitAll()

                // EVERYTHING ELSE requires authentication
                .anyRequest().authenticated()
            )

            // Return 401 when authentication is required
            // but the request is not authenticated
            .exceptionHandling(exception ->
                exception.authenticationEntryPoint(authEntryPoint)
            )

            // Your JWT filter
            .addFilterBefore(
                requestFilter,
                UsernamePasswordAuthenticationFilter.class
            );

        return http.build();
    }
}