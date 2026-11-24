package com.roomates;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

import org.junit.jupiter.api.Test;

import com.roomates.model.AuthUser;
import com.roomates.model.User;

class AuthUserTest {

    @Test
    void activeUserIsEnabledAndUnlocked() {
        User user = new User();
        user.setId(7);
        user.setMailID("active@example.com");
        user.setPassword("hash");
        user.setName("Active User");
        user.setUserType("2");
        user.setStatus(true);
        user.setIsDelete(false);

        AuthUser details = AuthUser.from(user);

        assertTrue(details.isEnabled());
        assertTrue(details.isAccountNonExpired());
        assertTrue(details.isCredentialsNonExpired());
        assertTrue(details.isAccountNonLocked());
        assertEquals(7, details.getUserId());
        assertEquals("ROLE_USER", details.getAuthorities().iterator().next().getAuthority());
    }

    @Test
    void inactiveOrDeletedUserIsDisabled() {
        User inactive = new User();
        inactive.setMailID("inactive@example.com");
        inactive.setStatus(false);
        inactive.setIsDelete(false);
        assertFalse(AuthUser.from(inactive).isEnabled());

        User deleted = new User();
        deleted.setMailID("deleted@example.com");
        deleted.setStatus(true);
        deleted.setIsDelete(true);
        assertFalse(AuthUser.from(deleted).isEnabled());
    }
}
