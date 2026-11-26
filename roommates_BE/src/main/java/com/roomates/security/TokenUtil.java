package com.roomates.security;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.Date;
import java.util.HashMap;
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

    private static final String DEFAULT_SECRET = "local-development-only-jwt-secret-change-me-1234567890";

    private final SecretKey signingKey;
    private final long validityMs;

    public TokenUtil(
            @Value("${jwt.secret:}") String secret,
            @Value("${jwt.expiration-ms:86400000}") long validityMs) {

        String effectiveSecret = secret == null || secret.isBlank() ? DEFAULT_SECRET : secret;
        byte[] keyBytes = effectiveSecret.getBytes(StandardCharsets.UTF_8);
        if (keyBytes.length < 32) {
            try {
                keyBytes = MessageDigest.getInstance("SHA-256").digest(keyBytes);
            } catch (NoSuchAlgorithmException ex) {
                throw new IllegalStateException("SHA-256 is unavailable", ex);
            }
        }
        this.signingKey = Keys.hmacShaKeyFor(keyBytes);
        this.validityMs = validityMs;
    }

    public String generateToken(Map<String, Object> claims) {
        Date now = new Date();
        return Jwts.builder()
                .claims(claims)
                .subject(String.valueOf(claims.get("mailID")))
                .issuedAt(now)
                .expiration(new Date(now.getTime() + validityMs))
                .signWith(signingKey)
                .compact();
    }

    public String generateToken(User user) {
        Map<String, Object> claims = new HashMap<>();
        claims.put("mailID", user.getMailID());
        claims.put("userId", user.getId());
        claims.put("userType", user.getUserType());
        claims.put("name", user.getName());
        return generateToken(claims);
    }

    public long getValidityMs() {
        return validityMs;
    }

    public Claims getAllClaimsFromToken(String token) {
        return Jwts.parser()
                .verifyWith(signingKey)
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    public String getUsernameFromToken(String token) {
        return getAllClaimsFromToken(token).getSubject();
    }

    public Integer getUserIdFromToken(String token) {
        Object value = getAllClaimsFromToken(token).get("userId");
        return value instanceof Number number ? number.intValue() : null;
    }

    public boolean validateToken(String token) {
        try {
            Claims claims = getAllClaimsFromToken(token);
            return claims.getExpiration().after(new Date());
        } catch (Exception e) {
            return false;
        }
    }

    public UserDetails loadAuthKeyAuthendicatedUser(String token) {
        Claims claims = getAllClaimsFromToken(token);

        User user = new User();
        user.setMailID(claims.getSubject());
        user.setPassword("N/A");
        Object userId = claims.get("userId");
        if (userId instanceof Number number) {
            user.setId(number.intValue());
        }
        user.setUserType(String.valueOf(claims.get("userType")));
        user.setName(String.valueOf(claims.get("name")));
        user.setStatus(true);
        user.setIsDelete(false);

        return new AuthUser(user, java.util.List.of());
    }
}
