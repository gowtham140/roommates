package com.roomates;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.math.BigDecimal;
import java.util.Set;
import java.util.stream.Collectors;

import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockHttpServletRequest;

import com.roomates.exception.ErrorResponse;
import com.roomates.exception.GlobalExceptionHandler;
import com.roomates.webModel.ProfileRequest;
import com.roomates.webModel.RegisterRequest;
import com.roomates.webModel.RoomRequest;

import jakarta.validation.ConstraintViolation;
import jakarta.validation.Validation;
import jakarta.validation.Validator;

class ValidationTest {

    private final Validator validator = Validation.buildDefaultValidatorFactory().getValidator();

    @Test
    void roomRequestRejectsInvalidRentStatusAndImageUrl() {
        RoomRequest request = new RoomRequest();
        request.setTitle("Room");
        request.setLocation("Chennai");
        request.setRent(new BigDecimal("-1"));
        request.setStatus("BLOCKED_BY_ADMIN");
        request.setImageUrls(java.util.List.of("https://example.com/evil.png"));

        Set<String> fields = validator.validate(request).stream()
                .map(violation -> violation.getPropertyPath().toString())
                .collect(Collectors.toSet());

        assertTrue(fields.contains("rent"));
        assertTrue(fields.contains("status"));
        assertTrue(fields.stream().anyMatch(field -> field.startsWith("imageUrls")));
    }

    @Test
    void registerRequestEnforcesPhoneGenderAndAge() {
        RegisterRequest request = new RegisterRequest();
        request.setName("Test User");
        request.setEmail("test@example.com");
        request.setPhone("123");
        request.setPassword("secret123");
        request.setOtp("123456");
        request.setGender("ALIEN");
        request.setAge(12);

        Set<String> fields = validator.validate(request).stream()
                .map(violation -> violation.getPropertyPath().toString())
                .collect(Collectors.toSet());

        assertTrue(fields.contains("phone"));
        assertTrue(fields.contains("gender"));
        assertTrue(fields.contains("age"));
        assertFalse(fields.contains("confirmPassword"));
    }

    @Test
    void profileRequestEnforcesPhoneGenderAndAge() {
        ProfileRequest request = new ProfileRequest();
        request.setName("Test User");
        request.setPhone("abc");
        request.setGender("UNKNOWN");
        request.setAge(200);

        assertEquals(3, validator.validate(request).size());
    }

    @Test
    void illegalArgumentExceptionMapsToBadRequest() {
        GlobalExceptionHandler handler = new GlobalExceptionHandler();
        ErrorResponse body = handler.handleInvalidArgument(new IllegalArgumentException("bad rent"),
                new MockHttpServletRequest()).getBody();

        assertEquals(400, body.getStatus());
        assertEquals("bad rent", body.getMessage());
    }
}
