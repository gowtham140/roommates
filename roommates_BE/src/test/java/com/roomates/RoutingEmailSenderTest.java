package com.roomates;

import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.roomates.serviceImp.BrevoEmailSender;
import com.roomates.serviceImp.ResendEmailSender;
import com.roomates.serviceImp.RoutingEmailSender;

@ExtendWith(MockitoExtension.class)
class RoutingEmailSenderTest {

    @Mock
    private BrevoEmailSender brevoEmailSender;

    @Mock
    private ResendEmailSender resendEmailSender;

    @Test
    void usesBrevoFirstWhenConfigured() {
        when(brevoEmailSender.isConfigured()).thenReturn(true);
        RoutingEmailSender sender = new RoutingEmailSender(brevoEmailSender, resendEmailSender);

        sender.sendText("user@example.com", "Subject", "Body");

        verify(brevoEmailSender).sendText("user@example.com", "Subject", "Body");
        verify(resendEmailSender, never()).sendText("user@example.com", "Subject", "Body");
    }

    @Test
    void fallsBackToResendWhenBrevoFails() {
        when(brevoEmailSender.isConfigured()).thenReturn(true);
        when(resendEmailSender.isConfigured()).thenReturn(true);
        doThrow(new IllegalStateException("Brevo API returned HTTP 401")).when(brevoEmailSender)
                .sendText("user@example.com", "Subject", "Body");
        RoutingEmailSender sender = new RoutingEmailSender(brevoEmailSender, resendEmailSender);

        sender.sendText("user@example.com", "Subject", "Body");

        verify(resendEmailSender).sendText("user@example.com", "Subject", "Body");
    }

    @Test
    void surfacesAllProviderFailures() {
        when(brevoEmailSender.isConfigured()).thenReturn(true);
        when(resendEmailSender.isConfigured()).thenReturn(true);
        doThrow(new IllegalStateException("Brevo API returned HTTP 401")).when(brevoEmailSender)
                .sendHtml("user@example.com", "Subject", "Body", "<p>Body</p>");
        doThrow(new IllegalStateException("Resend API returned HTTP 403")).when(resendEmailSender)
                .sendHtml("user@example.com", "Subject", "Body", "<p>Body</p>");
        RoutingEmailSender sender = new RoutingEmailSender(brevoEmailSender, resendEmailSender);

        IllegalStateException exception = assertThrows(IllegalStateException.class,
                () -> sender.sendHtml("user@example.com", "Subject", "Body", "<p>Body</p>"));

        assertTrue(exception.getMessage().contains("Brevo API returned HTTP 401"));
        assertTrue(exception.getMessage().contains("Resend API returned HTTP 403"));
    }
}
