package com.roomates.security;

import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.Map;

import javax.crypto.SecretKey;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;

import com.roomates.model.AuthUser;
import com.roomates.model.User;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;

@Component
public class TokenUtil {

    private final SecretKey signingKey;

    private static final long JWT_TOKEN_VALIDITY =
            1000L * 60 * 60 * 24; // 24 hours

    public TokenUtil(@Value("${jwt.secret}") String secret) {

        this.signingKey = Keys.hmacShaKeyFor(
                secret.getBytes(StandardCharsets.UTF_8)
        );
    }

    public String generateToken(Map<String, Object> user) {

        return Jwts.builder()
                .claims(user)
                .subject(String.valueOf(user.get("mailID")))
                .issuedAt(new Date())
                .expiration(
                        new Date(
                                System.currentTimeMillis()
                                        + JWT_TOKEN_VALIDITY
                        )
                )
                .signWith(signingKey)
                .compact();
    }

    public Claims getAllClaimsFromToken(String token) {

        return Jwts.parser()
                .verifyWith(signingKey)
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    public String getUsernameFromToken(String token) {

        return getAllClaimsFromToken(token)
                .getSubject();
    }

    public boolean validateToken(String token) {

        try {

            Claims claims = getAllClaimsFromToken(token);

            return claims.getExpiration()
                    .after(new Date());

        } catch (Exception e) {

            return false;
        }
    }

    public UserDetails loadAuthKeyAuthendicatedUser(
            String token) {

        Claims claims = getAllClaimsFromToken(token);

        User user = new User();

        user.setMailID(claims.getSubject());

        user.setPassword("N/A");

        user.setId(
                ((Number) claims.get("userId"))
                        .intValue()
        );

        user.setUserType(
                String.valueOf(
                        claims.get("userType")
                )
        );

        return new AuthUser(
                user,
                java.util.List.of()
        );
    }
}