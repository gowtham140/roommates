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
public class ResendEmailSender implements EmailSender {

    private final HttpClient httpClient = HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(10))
            .build();
    private final String apiKey;
    private final String apiUrl;
    private final String fromAddress;

    public ResendEmailSender(
            @Value("${resend.api.key:}") String apiKey,
            @Value("${resend.api.url:https://api.resend.com/emails}") String apiUrl,
            @Value("${app.mail.from:}") String fromAddress) {

        this.apiKey = apiKey == null ? "" : apiKey.trim();
        this.apiUrl = StringUtils.hasText(apiUrl) ? apiUrl.trim() : "https://api.resend.com/emails";
        this.fromAddress = fromAddress == null ? "" : fromAddress.trim();
    }

    @Override
    public boolean isConfigured() {
        return StringUtils.hasText(apiKey) && StringUtils.hasText(fromAddress);
    }

    @Override
    public void sendText(String to, String subject, String text) {
        send(to, subject, text, null);
    }

    @Override
    public void sendHtml(String to, String subject, String text, String html) {
        send(to, subject, text, html);
    }

    private void send(String to, String subject, String text, String html) {
        if (!isConfigured()) {
            throw new IllegalStateException("Resend email is not configured");
        }

        String json = buildPayload(to, subject, text, html);
        HttpRequest request = HttpRequest.newBuilder(URI.create(apiUrl))
                .timeout(Duration.ofSeconds(15))
                .header("Authorization", "Bearer " + apiKey)
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
                        "Resend API returned HTTP " + response.statusCode() + ": " + body);
            }
        } catch (InterruptedException ex) {
            Thread.currentThread().interrupt();
            throw new IllegalStateException("Email delivery was interrupted", ex);
        } catch (IOException ex) {
            throw new IllegalStateException("Unable to reach Resend API", ex);
        }
    }

    private String buildPayload(String to, String subject, String text, String html) {
        StringBuilder json = new StringBuilder();
        json.append("{\"from\":\"").append(escape(fromAddress))
                .append("\",\"to\":[\"").append(escape(to))
                .append("\"],\"subject\":\"").append(escape(subject)).append("\"");
        if (StringUtils.hasText(text)) {
            json.append(",\"text\":\"").append(escape(text)).append("\"");
        }
        if (StringUtils.hasText(html)) {
            json.append(",\"html\":\"").append(escape(html)).append("\"");
        }
        return json.append('}').toString();
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
