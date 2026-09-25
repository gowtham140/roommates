package com.roomates.security;

import java.util.List;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;

import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

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
            AuthenticationConfiguration configuration)
            throws Exception {

        return configuration.getAuthenticationManager();
    }

    // =========================
    // CORS CONFIGURATION
    // =========================

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {

        CorsConfiguration configuration =
                new CorsConfiguration();

        // Allow ALL origins
        configuration.setAllowedOriginPatterns(
                List.of("*")
        );

        // Allow ALL HTTP methods
        configuration.setAllowedMethods(
                List.of("*")
        );

        // Allow ALL headers
        configuration.setAllowedHeaders(
                List.of("*")
        );

        // We are not using cookies/session credentials
        configuration.setAllowCredentials(false);

        UrlBasedCorsConfigurationSource source =
                new UrlBasedCorsConfigurationSource();

        source.registerCorsConfiguration(
                "/**",
                configuration
        );

        return source;
    }

    // =========================
    // SECURITY
    // =========================

    @Bean
    public SecurityFilterChain securityFilterChain(
            HttpSecurity http) throws Exception {

        http

            .csrf(csrf -> csrf.disable())

            .cors(cors -> {})

            .sessionManagement(session ->
                session.sessionCreationPolicy(
                    SessionCreationPolicy.STATELESS
                )
            )

            .authorizeHttpRequests(auth -> auth

                // VERY IMPORTANT
                // Allow CORS preflight requests
                .requestMatchers(
                    HttpMethod.OPTIONS,
                    "/**"
                ).permitAll()

                // Public authentication APIs
                .requestMatchers(
                    "/api/auth/**"
                ).permitAll()

                .requestMatchers(
                    "/",
                    "/error",
                    "/swagger-ui/**",
                    "/v3/api-docs/**"
                ).permitAll()

                // Everything else requires JWT
                .anyRequest().authenticated()
            )

            .exceptionHandling(exception ->
                exception.authenticationEntryPoint(
                    authEntryPoint
                )
            )

            .addFilterBefore(
                requestFilter,
                UsernamePasswordAuthenticationFilter.class
            );

        return http.build();
    }
}