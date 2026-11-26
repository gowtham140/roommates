package com.roomates;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

import org.junit.jupiter.api.Test;

import com.roomates.serviceImp.ResendEmailSender;

class ResendEmailSenderTest {

    @Test
    void configuredWhenApiKeyAndFromArePresent() {
        ResendEmailSender sender = new ResendEmailSender("re_test_key", "https://api.resend.com/emails",
                "onboarding@resend.dev");

        assertTrue(sender.isConfigured());
    }

    @Test
    void notConfiguredWhenApiKeyOrFromIsMissing() {
        assertFalse(new ResendEmailSender("", "https://api.resend.com/emails", "onboarding@resend.dev")
                .isConfigured());
        assertFalse(new ResendEmailSender("re_test_key", "https://api.resend.com/emails", "")
                .isConfigured());
    }
}
