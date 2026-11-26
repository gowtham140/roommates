package com.roomates;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

import org.junit.jupiter.api.Test;

import com.roomates.security.TokenUtil;

import io.jsonwebtoken.Claims;

class TokenUtilTest {

    private final TokenUtil tokenUtil = new TokenUtil(
            "R8vK3mQ7xN2pL9sW4dF6hJ1cZ5tY0bG8uE3rA7kP2mX6qV9n", 3600000L);

    @Test
    void generatedTokenContainsIdentityClaimsAndIsValid() {
        com.roomates.model.User user = new com.roomates.model.User();
        user.setId(12);
        user.setName("Tester");
        user.setMailID("tester@example.com");
        user.setUserType("2");

        String token = tokenUtil.generateToken(user);

        assertTrue(tokenUtil.validateToken(token));
        assertEquals("tester@example.com", tokenUtil.getUsernameFromToken(token));
        assertEquals(12, tokenUtil.getUserIdFromToken(token));
        Claims claims = tokenUtil.getAllClaimsFromToken(token);
        assertEquals("Tester", claims.get("name"));
        assertEquals("2", claims.get("userType"));
    }

    @Test
    void invalidTokenIsRejected() {
        assertFalse(tokenUtil.validateToken("not-a-jwt"));
    }

    @Test
    void expiredTokenIsRejected() {
        TokenUtil expiredUtil = new TokenUtil(
                "R8vK3mQ7xN2pL9sW4dF6hJ1cZ5tY0bG8uE3rA7kP2mX6qV9n", -1000L);
        com.roomates.model.User user = new com.roomates.model.User();
        user.setId(1);
        user.setMailID("a@b.com");
        user.setUserType("2");

        assertFalse(expiredUtil.validateToken(expiredUtil.generateToken(user)));
    }

    @Test
    void missingSecretFailsWithClearMessage() {
        IllegalStateException error = assertThrows(IllegalStateException.class,
                () -> new TokenUtil("", 3600000L));

        assertTrue(error.getMessage().contains("JWT_SECRET is required"));
    }

    @Test
    void shortSecretFailsWithClearMessage() {
        IllegalStateException error = assertThrows(IllegalStateException.class,
                () -> new TokenUtil("too-short", 3600000L));

        assertTrue(error.getMessage().contains("at least 32 bytes"));
    }
}
