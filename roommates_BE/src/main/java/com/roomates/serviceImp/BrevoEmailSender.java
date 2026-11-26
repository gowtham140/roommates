package com.roomates.serviceImp;

import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.time.Duration;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

import com.roomates.service.EmailSender;

@Component
public class BrevoEmailSender implements EmailSender {

    private static final String SENDER_NAME = "RoomMate Finder";

    private final HttpClient httpClient = HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(10))
            .build();
    private final String apiKey;
    private final String apiUrl;
    private final String fromAddress;

    public BrevoEmailSender(
            @Value("${brevo.api.key:}") String apiKey,
            @Value("${brevo.api.url:https://api.brevo.com/v3/smtp/email}") String apiUrl,
            @Value("${app.mail.from:}") String fromAddress) {

        this.apiKey = apiKey == null ? "" : apiKey.trim();
        this.apiUrl = StringUtils.hasText(apiUrl) ? apiUrl.trim() : "https://api.brevo.com/v3/smtp/email";
        this.fromAddress = extractAddress(fromAddress);
    }

    @Override
    public boolean isConfigured() {
        return StringUtils.hasText(apiKey) && StringUtils.hasText(fromAddress);
    }

    @Override
    public void sendText(String to, String subject, String text) {
        send(to, subject, "textContent", text);
    }

    @Override
    public void sendHtml(String to, String subject, String text, String html) {
        send(to, subject, "htmlContent", html);
    }

    private void send(String to, String subject, String contentField, String content) {
        if (!isConfigured()) {
            throw new IllegalStateException("Brevo email is not configured");
        }

        String json = buildPayload(to, subject, contentField, content);
        HttpRequest request = HttpRequest.newBuilder(URI.create(apiUrl))
                .timeout(Duration.ofSeconds(15))
                .header("api-key", apiKey)
                .header("Accept", "application/json")
                .header("Content-Type", "application/json")
                .POST(HttpRequest.BodyPublishers.ofString(json, StandardCharsets.UTF_8))
                .build();

        try {
            HttpResponse<String> response = httpClient.send(
                    request, HttpResponse.BodyHandlers.ofString(StandardCharsets.UTF_8));
            if (response.statusCode() < 200 || response.statusCode() >= 300) {
                String body = response.body() == null ? "" : response.body().trim();
                if (body.length() > 500) {
                    body = body.substring(0, 500);
                }
                throw new IllegalStateException(
                        "Brevo API returned HTTP " + response.statusCode() + ": " + body);
            }
        } catch (InterruptedException ex) {
            Thread.currentThread().interrupt();
            throw new IllegalStateException("Email delivery was interrupted", ex);
        } catch (IOException ex) {
            throw new IllegalStateException("Unable to reach Brevo API", ex);
        }
    }

    private String buildPayload(String to, String subject, String contentField, String content) {
        StringBuilder json = new StringBuilder();
        json.append("{\"sender\":{\"name\":\"").append(escape(SENDER_NAME))
                .append("\",\"email\":\"").append(escape(fromAddress)).append("\"}")
                .append(",\"to\":[{\"email\":\"").append(escape(to)).append("\"}]")
                .append(",\"subject\":\"").append(escape(subject)).append("\"")
                .append(",\"").append(contentField).append("\":\"").append(escape(content)).append("\"}");
        return json.toString();
    }

    private String extractAddress(String value) {
        if (!StringUtils.hasText(value)) {
            return "";
        }
        String trimmed = value.trim();
        int open = trimmed.lastIndexOf('<');
        int close = trimmed.lastIndexOf('>');
        if (open >= 0 && close > open) {
            return trimmed.substring(open + 1, close).trim();
        }
        return trimmed;
    }

    private String escape(String value) {
        if (value == null) {
            return "";
        }
        StringBuilder escaped = new StringBuilder(value.length());
        for (int i = 0; i < value.length(); i++) {
            char c = value.charAt(i);
            switch (c) {
                case '"' -> escaped.append("\\\"");
                case '\\' -> escaped.append("\\\\");
                case '\b' -> escaped.append("\\b");
                case '\f' -> escaped.append("\\f");
                case '\n' -> escaped.append("\\n");
                case '\r' -> escaped.append("\\r");
                case '\t' -> escaped.append("\\t");
                default -> {
                    if (c < 0x20) {
                        escaped.append(String.format("\\u%04x", (int) c));
                    } else {
                        escaped.append(c);
                    }
                }
            }
        }
        return escaped.toString();
    }
}
