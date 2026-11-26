package com.roomates.serviceImp;

import java.util.ArrayList;
import java.util.List;
import java.util.function.Consumer;

import org.springframework.context.annotation.Primary;
import org.springframework.stereotype.Component;

import com.roomates.service.EmailSender;

@Component
@Primary
public class RoutingEmailSender implements EmailSender {

    private final List<EmailSender> providers;

    public RoutingEmailSender(BrevoEmailSender brevoEmailSender, ResendEmailSender resendEmailSender) {
        this.providers = List.of(brevoEmailSender, resendEmailSender);
    }

    @Override
    public boolean isConfigured() {
        return providers.stream().anyMatch(EmailSender::isConfigured);
    }

    @Override
    public void sendText(String to, String subject, String text) {
        send(provider -> provider.sendText(to, subject, text));
    }

    @Override
    public void sendHtml(String to, String subject, String text, String html) {
        send(provider -> provider.sendHtml(to, subject, text, html));
    }

    private void send(Consumer<EmailSender> action) {
        List<String> failures = new ArrayList<>();
        for (EmailSender provider : providers) {
            if (!provider.isConfigured()) {
                continue;
            }
            try {
                action.accept(provider);
                return;
            } catch (RuntimeException ex) {
                String message = ex.getMessage() == null ? "unknown error" : ex.getMessage();
                failures.add(provider.getClass().getSimpleName() + ": " + message);
            }
        }
        if (failures.isEmpty()) {
            throw new IllegalStateException("No email provider is configured");
        }
        throw new IllegalStateException("All email providers failed: " + String.join(" | ", failures));
    }
}
