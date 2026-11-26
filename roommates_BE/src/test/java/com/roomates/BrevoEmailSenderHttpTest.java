package com.roomates;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.io.IOException;
import java.net.InetSocketAddress;
import java.nio.charset.StandardCharsets;
import java.util.concurrent.atomic.AtomicReference;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;

import com.roomates.serviceImp.BrevoEmailSender;
import com.sun.net.httpserver.HttpServer;

class BrevoEmailSenderHttpTest {

    private final AtomicReference<String> capturedBody = new AtomicReference<>();
    private final AtomicReference<String> capturedApiKey = new AtomicReference<>();
    private HttpServer server;

    @AfterEach
    void stopServer() {
        if (server != null) {
            server.stop(0);
        }
    }

    @Test
    void configuredWhenApiKeyAndFromArePresent() {
        assertTrue(new BrevoEmailSender("xkeysib-test", "https://api.brevo.com/v3/smtp/email",
                "supportroomates@gmail.com").isConfigured());
        assertFalse(new BrevoEmailSender("", "https://api.brevo.com/v3/smtp/email",
                "supportroomates@gmail.com").isConfigured());
    }

    @Test
    void sendsTextEmailToBrevoApi() throws Exception {
        startServer(201, "{\"messageId\":\"test-id\"}");
        BrevoEmailSender sender = new BrevoEmailSender("xkeysib-test", serverUrl(),
                "RoomMate Finder <supportroomates@gmail.com>");

        sender.sendText("user@example.com", "Verify your email", "Your code is 123456");

        assertEquals("xkeysib-test", capturedApiKey.get());
        assertTrue(capturedBody.get().contains("\"sender\":{\"name\":\"RoomMate Finder\",\"email\":\"supportroomates@gmail.com\"}"));
        assertTrue(capturedBody.get().contains("\"to\":[{\"email\":\"user@example.com\"}]"));
        assertTrue(capturedBody.get().contains("\"textContent\":\"Your code is 123456\""));
        assertFalse(capturedBody.get().contains("htmlContent"));
    }

    @Test
    void sendsHtmlEmailToBrevoApi() throws Exception {
        startServer(201, "{\"messageId\":\"test-id\"}");
        BrevoEmailSender sender = new BrevoEmailSender("xkeysib-test", serverUrl(), "supportroomates@gmail.com");

        sender.sendHtml("user@example.com", "New enquiry", "plain", "<p>html</p>");

        assertTrue(capturedBody.get().contains("\"htmlContent\":\"<p>html</p>\""));
        assertFalse(capturedBody.get().contains("textContent"));
    }

    @Test
    void surfacesBrevoProviderError() throws Exception {
        startServer(401, "{\"message\":\"Invalid API key\"}");
        BrevoEmailSender sender = new BrevoEmailSender("xkeysib-test", serverUrl(), "supportroomates@gmail.com");

        IllegalStateException exception = assertThrows(IllegalStateException.class,
                () -> sender.sendText("user@example.com", "Subject", "Body"));

        assertTrue(exception.getMessage().contains("401"));
        assertTrue(exception.getMessage().contains("Invalid API key"));
    }

    private void startServer(int status, String responseBody) throws IOException {
        server = HttpServer.create(new InetSocketAddress("127.0.0.1", 0), 0);
        server.createContext("/smtp/email", exchange -> {
            capturedBody.set(new String(exchange.getRequestBody().readAllBytes(), StandardCharsets.UTF_8));
            capturedApiKey.set(exchange.getRequestHeaders().getFirst("api-key"));
            byte[] response = responseBody.getBytes(StandardCharsets.UTF_8);
            exchange.getResponseHeaders().add("Content-Type", "application/json");
            exchange.sendResponseHeaders(status, response.length);
            exchange.getResponseBody().write(response);
            exchange.close();
        });
        server.start();
    }

    private String serverUrl() {
        return "http://127.0.0.1:" + server.getAddress().getPort() + "/smtp/email";
    }
}
